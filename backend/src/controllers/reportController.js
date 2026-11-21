import Call from '../models/Call.js';
import TranscriptSegment from '../models/TranscriptSegment.js';
import AudioEvent from '../models/AudioEvent.js';
import FlaggedSegment from '../models/FlaggedSegment.js';
import ComplianceReview from '../models/ComplianceReview.js';

// Generate comprehensive compliance audit report data
export const generateCallReport = async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findOne({ call_id: id });
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call not found' });
    }

    const [transcript, audioEvents, flaggedSegments, reviews] = await Promise.all([
      TranscriptSegment.find({ call_id: id }).sort({ start_time: 1 }),
      AudioEvent.find({ call_id: id }).sort({ start_time: 1 }),
      FlaggedSegment.find({ call_id: id }).sort({ start_time: 1 }),
      ComplianceReview.find({ call_id: id }).sort({ reviewed_at: -1 })
    ]);

    const report = {
      report_metadata: {
        report_id: `AUDIT-REP-${call.call_id}`,
        generated_at: new Date().toISOString(),
        auditor_system: 'Recovery-Conduct Auditor v1.0.0 (RegTech Compliance Suite)',
        regulatory_framework: 'RBI Fair Practices Code & Master Directions on Recovery Agents'
      },
      call_profile: {
        call_id: call.call_id,
        agent_id: call.agent_id,
        borrower_id: call.borrower_id,
        recording_filename: call.original_filename,
        duration_seconds: call.duration,
        upload_date: call.upload_date,
        sample_rate_hz: call.sample_rate,
        audio_channels: call.channels
      },
      risk_verdict: {
        overall_risk_level: call.overall_risk_level,
        risk_score_0_100: call.risk_score,
        risk_reasons: call.risk_reasons,
        review_status: call.review_status,
        summary: call.call_summary
      },
      acoustic_evidence_summary: {
        total_audio_events_detected: audioEvents.length,
        loudness_spikes: audioEvents.filter(e => e.event_type === 'loudness_increase').length,
        pitch_variations: audioEvents.filter(e => e.event_type === 'pitch_variation').length,
        silence_and_pauses: audioEvents.filter(e => e.event_type === 'long_pause').length,
        audio_events_detail: audioEvents
      },
      multimodal_flagged_segments: flaggedSegments.map(flag => ({
        timestamp: `${formatSeconds(flag.start_time)} - ${formatSeconds(flag.end_time)}`,
        category: flag.category,
        severity: flag.severity,
        transcript_excerpt: flag.transcript_excerpt,
        language_evidence: flag.language_evidence,
        audio_evidence: flag.audio_evidence,
        context: flag.context,
        reason_for_flag: flag.reason_for_flag,
        confidence: flag.confidence,
        recommended_action: flag.recommended_action
      })),
      human_compliance_notes: reviews,
      disclaimer: 'This automated audit report is an evidence-based compliance monitoring tool designed to assist compliance officers. Findings and acoustic indicators constitute supporting evidence for human review and do not represent a self-executing legal adjudication.'
    };

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function formatSeconds(secs) {
  if (secs == null) return '00:00';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}
