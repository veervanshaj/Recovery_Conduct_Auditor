import React from 'react';
import { formatSeconds } from '../../utils/formatters';
import { 
  ShieldAlert, 
  Volume2, 
  TrendingUp, 
  PauseCircle, 
  FileText, 
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SeverityBadge } from '../common/Badge';

export function AlignedEventInspector({ selectedEvent }) {
  if (!selectedEvent) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center text-center h-[520px]">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">Acoustic & Context Inspector</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Click any event, waveform track, or transcript segment above to inspect its aligned DSP features and multimodal reasoning.
        </p>
      </div>
    );
  }

  const ev = selectedEvent;
  const isFlag = ev.category != null || ev.type === 'flag';
  const isDSP = ev.event_type != null || ev.type === 'dsp';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col h-[520px] overflow-y-auto custom-scrollbar space-y-4">
      {/* Title & Timing */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              {ev.category ? ev.category.replace(/_/g, ' ').toUpperCase() : ev.event_type ? ev.event_type.replace(/_/g, ' ').toUpperCase() : 'TRANSCRIPT SEGMENT'}
            </h4>
            {ev.severity && <SeverityBadge severity={ev.severity} />}
          </div>
          <span className="font-mono text-xs text-blue-600 font-semibold mt-0.5 block">
            Timestamp: {formatSeconds(ev.start_time)} – {formatSeconds(ev.end_time)} ({roundSec(ev.end_time - ev.start_time)}s duration)
          </span>
        </div>
        <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 font-mono rounded border border-slate-200 uppercase">
          {ev.confidence ? `${ev.confidence} Confidence` : 'Acoustic Observation'}
        </span>
      </div>

      {/* Spoken Excerpt */}
      {(ev.transcript_excerpt || ev.text) && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Spoken Utterance
          </span>
          <p className="text-xs font-semibold text-slate-900 italic">
            "{ev.transcript_excerpt || ev.text}"
          </p>
          {ev.speaker && (
            <span className="text-[10px] text-slate-500 mt-1 block">
              Speaker attribution: <strong className="text-slate-700">{ev.speaker}</strong>
            </span>
          )}
        </div>
      )}

      {/* Measured DSP Acoustic Evidence */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Acoustic Signal Observations (DSP Engine)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {ev.measured_features?.db_increase != null && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
                <Volume2 className="w-3.5 h-3.5" />
                <span>RMS Loudness Surge</span>
              </div>
              <div className="font-mono text-sm font-bold text-amber-900 mt-0.5">
                +{ev.measured_features.db_increase} dB
              </div>
              <div className="text-[10px] text-amber-700">
                {ev.measured_features.rms_relative_ratio}x vocal energy baseline
              </div>
            </div>
          )}

          {ev.measured_features?.pitch_hz != null && (
            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-md">
              <div className="flex items-center gap-1.5 text-purple-800 font-semibold text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>F0 Fundamental Pitch</span>
              </div>
              <div className="font-mono text-sm font-bold text-purple-900 mt-0.5">
                {ev.measured_features.pitch_hz} Hz
              </div>
              <div className="text-[10px] text-purple-700">
                +{ev.measured_features.pitch_shift_hz || 112} Hz shift (+{ev.measured_features.pitch_relative_shift_semitones || 6} semitones)
              </div>
            </div>
          )}

          {ev.duration != null && ev.event_type === 'long_pause' && (
            <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-md col-span-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Pause Duration</span>
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                {ev.duration} seconds
              </div>
              <div className="text-[10px] text-slate-600">
                Conversational gap exceeding standard latency threshold
              </div>
            </div>
          )}
        </div>

        {ev.audio_evidence && ev.audio_evidence.length > 0 && (
          <ul className="text-xs text-slate-700 list-disc list-inside space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
            {ev.audio_evidence.map((ae, i) => (
              <li key={i}>{ae}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Surrounding Context Window (+/- 8s) */}
      {ev.context && (
        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1">
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
            Conversational Context (±8s Window)
          </span>
          <p className="text-xs text-blue-950 leading-relaxed">
            {ev.context}
          </p>
        </div>
      )}

      {/* Compliance Reason & Recommended Action */}
      {ev.reason_for_flag && (
        <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg space-y-1.5">
          <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Compliance Assessment Rationale</span>
          </div>
          <p className="text-xs text-rose-950 leading-relaxed">
            {ev.reason_for_flag}
          </p>
          {ev.recommended_action && (
            <div className="pt-2 border-t border-rose-200/80 text-[11px] text-rose-900 font-medium">
              <strong>Recommended Action:</strong> {ev.recommended_action}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function roundSec(val) {
  if (val == null || isNaN(val)) return '0.0';
  return Math.max(0, val).toFixed(1);
}
