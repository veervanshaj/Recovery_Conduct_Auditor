import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Call from '../models/Call.js';
import TranscriptSegment from '../models/TranscriptSegment.js';
import AudioEvent from '../models/AudioEvent.js';
import FlaggedSegment from '../models/FlaggedSegment.js';
import ComplianceReview from '../models/ComplianceReview.js';
import { callPythonAudioAnalysis } from '../services/pythonClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload and analyze audio
export const uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Audio file is required (.wav or .mp3)' });
    }

    const { agent_id, borrower_id, language } = req.body;
    const call_id = `CALL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const original_filename = req.file.originalname;
    const audio_file_path = req.file.path;
    const audio_url = `/uploads/${path.basename(audio_file_path)}`;

    // Create initial pending Call record
    const call = new Call({
      call_id,
      agent_id: agent_id || 'AGENT-408',
      borrower_id: borrower_id || 'BORROWER-921',
      original_filename,
      audio_file_path,
      audio_url,
      analysis_status: 'processing'
    });
    await call.save();

    // Call Python audio processing service asynchronously
    try {
      const analysisResult = await callPythonAudioAnalysis(audio_file_path, {
        call_id,
        agent_id: call.agent_id,
        borrower_id: call.borrower_id,
        language: language || 'en'
      });

      // Update Call record with results
      call.duration = analysisResult.audio_duration || 0;
      call.sample_rate = analysisResult.sample_rate || 16000;
      call.channels = analysisResult.channels || 1;
      call.analysis_status = 'completed';
      call.overall_risk_level = analysisResult.risk_assessment?.overall_risk_level || 'low';
      call.risk_score = analysisResult.risk_assessment?.risk_score || 0;
      call.risk_reasons = analysisResult.risk_assessment?.risk_reasons || [];
      call.call_summary = analysisResult.call_summary || '';
      call.metrics = {
        talk_time_agent_sec: analysisResult.metrics?.talk_time_agent_sec || 0,
        talk_time_borrower_sec: analysisResult.metrics?.talk_time_borrower_sec || 0,
        silence_duration_sec: analysisResult.metrics?.silence_duration_sec || 0,
        total_pauses_count: analysisResult.metrics?.total_pauses_count || 0,
        dsp_events_count: (analysisResult.audio_events || []).length,
        flagged_segments_count: (analysisResult.flagged_segments || []).length
      };
      await call.save();

      // Save Transcript Segments
      if (analysisResult.transcript && analysisResult.transcript.length > 0) {
        const segments = analysisResult.transcript.map(seg => ({
          call_id,
          start_time: seg.start_time,
          end_time: seg.end_time,
          speaker: seg.speaker || 'SPEAKER_UNKNOWN',
          text: seg.text,
          words: seg.words || [],
          confidence: seg.confidence || 1.0,
          language: seg.language || 'en'
        }));
        await TranscriptSegment.insertMany(segments);
      }

      // Save Audio Events (DSP findings)
      if (analysisResult.audio_events && analysisResult.audio_events.length > 0) {
        const events = analysisResult.audio_events.map(ev => ({
          call_id,
          start_time: ev.start_time,
          end_time: ev.end_time,
          event_type: ev.event_type,
          severity: ev.severity || 'low',
          duration: ev.duration || (ev.end_time - ev.start_time),
          measured_features: ev.measured_features || {},
          description: ev.description
        }));
        await AudioEvent.insertMany(events);
      }

      // Save Flagged Segments (Multimodal Contextual findings)
      if (analysisResult.flagged_segments && analysisResult.flagged_segments.length > 0) {
        const flags = analysisResult.flagged_segments.map(fl => ({
          call_id,
          start_time: fl.start_time,
          end_time: fl.end_time,
          category: fl.category,
          severity: fl.severity,
          transcript_excerpt: fl.transcript_excerpt,
          speaker: fl.speaker || 'SPEAKER_UNKNOWN',
          language_evidence: fl.language_evidence,
          audio_evidence: fl.audio_evidence || [],
          context: fl.context || '',
          reason_for_flag: fl.reason_for_flag,
          confidence: fl.confidence || 'medium',
          recommended_action: fl.recommended_action || 'Review recording at this timestamp.'
        }));
        await FlaggedSegment.insertMany(flags);
      }

      return res.status(200).json({
        success: true,
        message: 'Audio analysis completed successfully',
        call_id,
        call
      });

    } catch (analysisErr) {
      console.error('[CallController] Audio analysis failed:', analysisErr.message);
      call.analysis_status = 'failed';
      call.processing_error = analysisErr.message;
      await call.save();

      return res.status(502).json({
        success: false,
        message: `Audio processing pipeline failed: ${analysisErr.message}`,
        call_id,
        call
      });
    }

  } catch (err) {
    console.error('[CallController] Upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// List all calls with filtering
export const getCalls = async (req, res) => {
  try {
    const { risk_level, agent_id, review_status, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (risk_level && risk_level !== 'all') filter.overall_risk_level = risk_level;
    if (agent_id && agent_id !== 'all') filter.agent_id = agent_id;
    if (review_status && review_status !== 'all') filter.review_status = review_status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const calls = await Call.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Call.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      calls
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single call full detail (hero forensic view)
export const getCallById = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findOne({ call_id: id });
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call not found' });
    }

    const [transcript, audioEvents, flaggedSegments, reviewHistory] = await Promise.all([
      TranscriptSegment.find({ call_id: id }).sort({ start_time: 1 }),
      AudioEvent.find({ call_id: id }).sort({ start_time: 1 }),
      FlaggedSegment.find({ call_id: id }).sort({ start_time: 1 }),
      ComplianceReview.find({ call_id: id }).sort({ reviewed_at: -1 })
    ]);

    res.json({
      success: true,
      call,
      transcript,
      audio_events: audioEvents,
      flagged_segments: flaggedSegments,
      review_history: reviewHistory
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit human compliance review update
export const submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_notes, review_status, reviewer_id, action_taken } = req.body;

    const call = await Call.findOne({ call_id: id });
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call not found' });
    }

    call.review_status = review_status;
    await call.save();

    const review = new ComplianceReview({
      call_id: id,
      reviewer_id: reviewer_id || 'COMPLIANCE_OFFICER_1',
      review_status,
      reviewer_notes,
      action_taken: action_taken || 'Status updated by reviewer'
    });
    await review.save();

    res.json({
      success: true,
      message: 'Review recorded successfully',
      call,
      review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Dashboard KPI overview
export const getDashboardMetrics = async (req, res) => {
  try {
    const [totalCalls, highRiskCount, mediumRiskCount, lowRiskCount, pendingReviewCount, escalatedCount] = await Promise.all([
      Call.countDocuments(),
      Call.countDocuments({ overall_risk_level: 'high' }),
      Call.countDocuments({ overall_risk_level: 'medium' }),
      Call.countDocuments({ overall_risk_level: 'low' }),
      Call.countDocuments({ review_status: 'pending_review' }),
      Call.countDocuments({ review_status: 'escalated' })
    ]);

    const flaggedCategories = await FlaggedSegment.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentFlaggedCalls = await Call.find({ overall_risk_level: { $in: ['high', 'medium'] } })
      .sort({ createdAt: -1 })
      .limit(6);

    const agentLeaderboard = await Call.aggregate([
      {
        $group: {
          _id: '$agent_id',
          totalCalls: { $sum: 1 },
          highRiskCalls: {
            $sum: { $cond: [{ $eq: ['$overall_risk_level', 'high'] }, 1, 0] }
          },
          avgRiskScore: { $avg: '$risk_score' }
        }
      },
      { $sort: { highRiskCalls: -1, totalCalls: -1 } },
      { $limit: 8 }
    ]);

    res.json({
      success: true,
      metrics: {
        total_calls: totalCalls,
        high_risk_cases: highRiskCount,
        medium_risk_cases: mediumRiskCount,
        low_risk_cases: lowRiskCount,
        pending_review_queue: pendingReviewCount,
        escalated_cases: escalatedCount,
        flagged_categories: flaggedCategories,
        recent_flagged_calls: recentFlaggedCalls,
        agent_risk_ranking: agentLeaderboard
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
