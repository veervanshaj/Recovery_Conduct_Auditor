import React, { useRef, useState } from 'react';
import { formatSeconds } from '../../utils/formatters';
import { 
  Volume2, 
  TrendingUp, 
  PauseCircle, 
  MessageSquare, 
  AlertTriangle, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export function MultiTrackTimeline({
  duration,
  currentTime,
  transcript = [],
  audioEvents = [],
  flaggedSegments = [],
  onSeek,
  onSelectEvent,
  selectedEvent
}) {
  const containerRef = useRef(null);
  const [hoverTime, setHoverTime] = useState(null);

  const totalDuration = Math.max(duration || 1, 1);

  // Position calculation helper
  const getLeftPercent = (time) => `${(Math.max(0, time) / totalDuration) * 100}%`;
  const getWidthPercent = (start, end) => `${(Math.max(0.5, end - start) / totalDuration) * 100}%`;

  // Click on timeline to seek
  const handleTimelineClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = clickRatio * totalDuration;
    onSeek(targetTime);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, moveX / rect.width));
    setHoverTime(ratio * totalDuration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  // Group audio events by type
  const loudnessEvents = audioEvents.filter(e => e.event_type === 'loudness_increase');
  const pitchEvents = audioEvents.filter(e => e.event_type === 'pitch_variation');
  const pauseEvents = audioEvents.filter(e => e.event_type === 'long_pause');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-lg space-y-4">
      {/* Header with Timeline Controls & Hover info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive Multi-Track Forensic Timeline
          </h3>
          <span className="text-[11px] text-slate-500">
            (Click any segment or track to seek & inspect)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          {hoverTime != null && (
            <span className="text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Hover: {formatSeconds(hoverTime)}
            </span>
          )}
          <span className="text-blue-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Playhead: {formatSeconds(currentTime)} / {formatSeconds(totalDuration)}
          </span>
        </div>
      </div>

      {/* Main Multi-Track Canvas Area */}
      <div
        ref={containerRef}
        onClick={handleTimelineClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-pointer select-none space-y-2 py-2"
      >
        {/* Playhead vertical marker line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(59,130,246,0.8)]"
          style={{ left: getLeftPercent(currentTime) }}
        >
          <div className="w-2.5 h-2.5 -ml-1 -top-1 absolute bg-blue-400 rounded-full border border-white"></div>
        </div>

        {/* Hover vertical marker line */}
        {hoverTime != null && (
          <div
            className="absolute top-0 bottom-0 w-px bg-amber-400/70 z-20 pointer-events-none border-dashed border-l border-amber-400"
            style={{ left: getLeftPercent(hoverTime) }}
          ></div>
        )}

        {/* ---------------- TRACK 1: Speech Segments & Speaker Turns ---------------- */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Speech Utterances</span>
          </div>
          <div className="relative h-7 bg-slate-800/80 rounded-md w-full overflow-hidden border border-slate-700/60">
            {transcript.map((seg, idx) => {
              const isAgent = (seg.speaker || '').includes('1') || (seg.speaker || '').includes('AGENT');
              const isSelected = selectedEvent?.transcript_excerpt === seg.text;
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(seg.start_time);
                    onSelectEvent({
                      type: 'transcript',
                      start_time: seg.start_time,
                      end_time: seg.end_time,
                      speaker: seg.speaker,
                      text: seg.text
                    });
                  }}
                  className={`absolute top-1 bottom-1 rounded px-1.5 text-[10px] truncate flex items-center transition-all ${
                    isAgent
                      ? 'bg-blue-600/80 hover:bg-blue-500 text-white'
                      : 'bg-emerald-600/80 hover:bg-emerald-500 text-white'
                  } ${isSelected ? 'ring-2 ring-white z-10' : ''}`}
                  style={{
                    left: getLeftPercent(seg.start_time),
                    width: getWidthPercent(seg.start_time, seg.end_time)
                  }}
                  title={`[${formatSeconds(seg.start_time)} - ${formatSeconds(seg.end_time)}] ${seg.speaker}: ${seg.text}`}
                >
                  <span className="truncate">{seg.speaker}: {seg.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- TRACK 2: Loudness Surges (RMS DSP) ---------------- */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>RMS Loudness</span>
          </div>
          <div className="relative h-6 bg-slate-800/80 rounded-md w-full overflow-hidden border border-slate-700/60">
            {loudnessEvents.map((ev, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(ev.start_time);
                  onSelectEvent({ type: 'dsp', ...ev });
                }}
                className={`absolute top-1 bottom-1 rounded px-1 text-[9px] font-mono flex items-center justify-center font-bold transition-all ${
                  ev.severity === 'high' ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
                style={{
                  left: getLeftPercent(ev.start_time),
                  width: getWidthPercent(ev.start_time, ev.end_time)
                }}
                title={`[${formatSeconds(ev.start_time)} - ${formatSeconds(ev.end_time)}] Loudness Surge (+${ev.measured_features?.db_increase || '8'} dB)`}
              >
                <span>+{ev.measured_features?.db_increase || 8}dB</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- TRACK 3: Pitch Variations (F0 pYIN DSP) ---------------- */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Pitch Variance (F0)</span>
          </div>
          <div className="relative h-6 bg-slate-800/80 rounded-md w-full overflow-hidden border border-slate-700/60">
            {pitchEvents.map((ev, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(ev.start_time);
                  onSelectEvent({ type: 'dsp', ...ev });
                }}
                className="absolute top-1 bottom-1 rounded px-1 text-[9px] font-mono flex items-center justify-center font-bold bg-purple-500 hover:bg-purple-400 text-white transition-all"
                style={{
                  left: getLeftPercent(ev.start_time),
                  width: getWidthPercent(ev.start_time, ev.end_time)
                }}
                title={`[${formatSeconds(ev.start_time)} - ${formatSeconds(ev.end_time)}] Pitch Elevation (${ev.measured_features?.pitch_hz || 280} Hz)`}
              >
                <span>{ev.measured_features?.pitch_hz ? `${Math.round(ev.measured_features.pitch_hz)}Hz` : 'Pitch Surge'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- TRACK 4: Silence & Pauses (>2.5s) ---------------- */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <PauseCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Pauses / Silences</span>
          </div>
          <div className="relative h-6 bg-slate-800/80 rounded-md w-full overflow-hidden border border-slate-700/60">
            {pauseEvents.map((ev, idx) => {
              const isDuressPause = ev.duration >= 6.0;
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(ev.start_time);
                    onSelectEvent({ type: 'dsp', ...ev });
                  }}
                  className={`absolute top-1 bottom-1 rounded px-1 text-[9px] font-mono flex items-center justify-center font-medium transition-all ${
                    isDuressPause
                      ? 'bg-rose-900/80 border border-rose-500 text-rose-200 hover:bg-rose-800'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                  style={{
                    left: getLeftPercent(ev.start_time),
                    width: getWidthPercent(ev.start_time, ev.end_time)
                  }}
                  title={`[${formatSeconds(ev.start_time)} - ${formatSeconds(ev.end_time)}] Pause (${ev.duration}s)`}
                >
                  <span>{ev.duration}s pause</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- TRACK 5: Language & Conduct Flags ---------------- */}
        <div className="flex items-center gap-3">
          <div className="w-28 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Conduct Flags</span>
          </div>
          <div className="relative h-7 bg-slate-800/80 rounded-md w-full overflow-hidden border border-slate-700/60">
            {flaggedSegments.map((fl, idx) => {
              const isCritical = fl.severity === 'critical';
              const isSelected = selectedEvent?.transcript_excerpt === fl.transcript_excerpt;
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(fl.start_time);
                    onSelectEvent({ type: 'flag', ...fl });
                  }}
                  className={`absolute top-1 bottom-1 rounded px-1.5 text-[10px] font-semibold truncate flex items-center transition-all ${
                    isCritical
                      ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  } ${isSelected ? 'ring-2 ring-white z-10' : ''}`}
                  style={{
                    left: getLeftPercent(fl.start_time),
                    width: getWidthPercent(fl.start_time, fl.end_time)
                  }}
                  title={`[${formatSeconds(fl.start_time)} - ${formatSeconds(fl.end_time)}] ${fl.category}: ${fl.reason_for_flag}`}
                >
                  <span className="truncate">{fl.category.replace(/_/g, ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- TIME AXIS TICKS ---------------- */}
        <div className="flex items-center gap-3 pt-1">
          <div className="w-28"></div>
          <div className="relative w-full h-4 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>00:00</span>
            <span>{formatSeconds(totalDuration * 0.25)}</span>
            <span>{formatSeconds(totalDuration * 0.5)}</span>
            <span>{formatSeconds(totalDuration * 0.75)}</span>
            <span>{formatSeconds(totalDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
