import React from 'react';
import { ShieldCheck, Database, Sparkles, RefreshCw } from 'lucide-react';

export function Navbar({ onSeedDemo, seeding, demoMode, setDemoMode }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Recovery-Conduct Auditor</h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
              RegTech AI 2.0
            </span>
          </div>
          <p className="text-xs text-slate-500">Acoustic DSP & Multimodal Compliance Intelligence Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Regulatory framework tag */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>RBI Fair Practices Code Benchmark (Active)</span>
        </div>

        {/* Demo Mode switcher button */}
        <button
          onClick={onSeedDemo}
          disabled={seeding}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
          title="Seed and switch to synthetic demonstration scenarios"
        >
          {seeding ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{seeding ? 'Seeding Demo...' : 'Load Demo Scenarios'}</span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center">
            CO
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-800">Compliance Audit Desk</div>
            <div className="text-[11px] text-slate-500">Senior Officer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
