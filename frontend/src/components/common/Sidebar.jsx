import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Activity, 
  History, 
  CalendarClock, 
  Sliders, 
  FileCheck2,
  AlertTriangle
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Compliance Overview', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload & Process Call', icon: UploadCloud },
    { id: 'history', label: 'Audited Calls History', icon: History, count: stats?.total_calls },
    { id: 'call-patterns', label: 'Call Log & Time Engine', icon: CalendarClock },
    { id: 'rules', label: 'Statutory Rules Config', icon: Sliders }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Compliance Division
        </div>
        <div className="text-sm font-semibold text-white mt-0.5">
          Fair Lending & Conduct Monitor
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                active 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count != null && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono ${active ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* High-priority review alert badge */}
      {stats?.high_risk_cases > 0 && (
        <div className="m-3 p-3 bg-red-950/60 border border-red-800/70 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>Action Required</span>
          </div>
          <p className="text-[11px] text-red-300/80 leading-relaxed">
            {stats.high_risk_cases} high-priority case(s) flagged for statutory human review.
          </p>
        </div>
      )}

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>DSP Engine:</span>
          <span className="font-mono text-emerald-400">Librosa / SciPy</span>
        </div>
        <div className="flex justify-between">
          <span>STT Engine:</span>
          <span className="font-mono text-emerald-400">Faster-Whisper</span>
        </div>
        <div className="flex justify-between">
          <span>Framework:</span>
          <span className="font-mono text-blue-400">RBI Master Dir</span>
        </div>
      </div>
    </aside>
  );
}
