import React, { useState, useEffect, useRef } from 'react';
import { formatSeconds } from '../../utils/formatters';
import { Search, User, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

export function TimestampedTranscript({
  transcript = [],
  currentTime,
  onSeek,
  onSelectSegment,
  selectedSegment,
  flaggedSegments = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const activeSegmentRef = useRef(null);

  // Determine which segment is active based on currentTime
  const activeIdx = transcript.findIndex(
    s => currentTime >= s.start_time && currentTime <= s.end_time
  );

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIdx]);

  // Check if a segment overlaps with any flagged segment
  const isSegmentFlagged = (seg) => {
    return flaggedSegments.some(fl => 
      Math.max(seg.start_time, fl.start_time) < Math.min(seg.end_time, fl.end_time)
    );
  };

  const filteredTranscript = transcript.filter(s => 
    !searchTerm || s.text.toLowerCase().includes(searchTerm.toLowerCase()) || (s.speaker || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[520px]">
      {/* Transcript Header with Search */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Synchronized Transcript</h3>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {transcript.length} utterances
          </span>
        </div>

        <div className="relative w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Transcript Scrolling List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredTranscript.map((seg, idx) => {
          const isActive = idx === activeIdx;
          const isSelected = selectedSegment?.text === seg.text;
          const flagged = isSegmentFlagged(seg);
          const isAgent = (seg.speaker || '').includes('1') || (seg.speaker || '').includes('AGENT');

          return (
            <div
              key={idx}
              ref={isActive ? activeSegmentRef : null}
              onClick={() => {
                onSeek(seg.start_time);
                onSelectSegment(seg);
              }}
              className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${
                isActive
                  ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                  : isSelected
                  ? 'bg-slate-100 border-slate-400'
                  : flagged
                  ? 'bg-red-50/40 border-red-200 hover:bg-red-50/70'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                      isAgent
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span>{seg.speaker || (isAgent ? 'AGENT' : 'BORROWER')}</span>
                  </span>

                  <span className="font-mono text-[11px] text-slate-400">
                    {formatSeconds(seg.start_time)} - {formatSeconds(seg.end_time)}
                  </span>
                </div>

                {flagged && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100/90 px-1.5 py-0.5 rounded">
                    <ShieldAlert className="w-3 h-3 text-red-600" />
                    <span>Compliance Flag</span>
                  </span>
                )}
              </div>

              <p className={`text-slate-800 leading-relaxed ${isActive ? 'font-medium' : ''}`}>
                {seg.text}
              </p>
            </div>
          );
        })}

        {filteredTranscript.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No matching transcript utterances found.
          </div>
        )}
      </div>
    </div>
  );
}
