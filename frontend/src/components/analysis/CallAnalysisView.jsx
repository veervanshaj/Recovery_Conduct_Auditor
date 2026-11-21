import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  UserCheck, 
  Clock, 
  AlertOctagon, 
  Share2, 
  Download,
  Info
} from 'lucide-react';
import { RiskBadge, StatusBadge } from '../common/Badge';
import { AudioPlayer } from './AudioPlayer';
import { MultiTrackTimeline } from './MultiTrackTimeline';
import { TimestampedTranscript } from './TimestampedTranscript';
import { AlignedEventInspector } from './AlignedEventInspector';
import { formatDurationDetailed, formatSeconds } from '../../utils/formatters';

export function CallAnalysisView({ 
  callData, 
  onBack, 
  onOpenReview, 
  onOpenReport 
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!callData || !callData.call) {
    return (
      <div className="p-8 text-center text-slate-500">
        Call data is loading or could not be found.
      </div>
    );
  }

  const { call, transcript = [], audio_events = [], flagged_segments = [] } = callData;

  const handleSeek = (time) => {
    setCurrentTime(time);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleSelectTranscriptSegment = (seg) => {
    // Find matching flag or DSP event if any
    const matchingFlag = flagged_segments.find(fl => 
      Math.max(seg.start_time, fl.start_time) < Math.min(seg.end_time, fl.end_time)
    );
    if (matchingFlag) {
      setSelectedEvent({ type: 'flag', ...matchingFlag });
    } else {
      setSelectedEvent({
        type: 'transcript',
        start_time: seg.start_time,
        end_time: seg.end_time,
        speaker: seg.speaker,
        text: seg.text
      });
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 font-mono tracking-tight">{call.call_id}</h2>
              <RiskBadge level={call.overall_risk_level} />
              <StatusBadge status={call.review_status} />
              {call.is_demo && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-300 rounded">
                  Synthetic Benchmark
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {call.demo_scenario || 'Acoustically analyzed recording under RBI Fair Practice Code guidelines.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenReview(call)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Human Compliance Review</span>
          </button>

          <button
            onClick={() => onOpenReport(call.call_id)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Audit Report</span>
          </button>
        </div>
      </div>

      {/* Call Profile Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Recovery Agent</span>
          <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{call.agent_id}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Borrower Account</span>
          <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{call.borrower_id}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Duration</span>
          <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">{formatDurationDetailed(call.duration)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Risk Score</span>
          <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">{call.risk_score || 0} / 100</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Audio DSP Events</span>
          <p className="text-xs font-bold text-amber-600 mt-0.5 font-mono">{audio_events.length} detected</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Conduct Flags</span>
          <p className="text-xs font-bold text-red-600 mt-0.5 font-mono">{flagged_segments.length} flagged</p>
        </div>
      </div>

      {/* Call Executive Summary & Reasons */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Multimodal AI Executive Assessment</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
          {call.call_summary || 'Evaluation conducted via local acoustic DSP and Faster-Whisper transcript alignment.'}
        </p>

        {call.risk_reasons && call.risk_reasons.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Contributing Evidence Factors:
            </span>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {call.risk_reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-50/70 p-2 rounded border border-slate-200/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Audio Player Controller */}
      <AudioPlayer
        audioUrl={call.audio_url}
        currentTime={currentTime}
        onTimeUpdate={setCurrentTime}
        onSeek={handleSeek}
        duration={call.duration}
      />

      {/* Multi-Track Interactive Forensic Timeline */}
      <MultiTrackTimeline
        duration={call.duration}
        currentTime={currentTime}
        transcript={transcript}
        audioEvents={audio_events}
        flaggedSegments={flagged_segments}
        onSeek={handleSeek}
        onSelectEvent={handleSelectEvent}
        selectedEvent={selectedEvent}
      />

      {/* Two-Column Deep-Dive: Synchronized Transcript & Aligned Event Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimestampedTranscript
          transcript={transcript}
          currentTime={currentTime}
          onSeek={handleSeek}
          onSelectSegment={handleSelectTranscriptSegment}
          selectedSegment={selectedEvent}
          flaggedSegments={flagged_segments}
        />

        <AlignedEventInspector
          selectedEvent={selectedEvent}
        />
      </div>
    </div>
  );
}
