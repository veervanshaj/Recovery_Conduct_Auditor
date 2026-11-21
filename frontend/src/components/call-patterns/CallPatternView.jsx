import React, { useState } from 'react';
import { 
  CalendarClock, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  Filter, 
  Sliders,
  Users,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { SeverityBadge } from '../common/Badge';

export function CallPatternView({ onOpenRules }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleAnalyzeCSV = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const data = await api.uploadCallLogsCSV(formData);
      setAnalysisResult(data);
      setAnalyzing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze call log CSV.');
      setAnalyzing(false);
    }
  };

  const loadSampleCSV = async () => {
    setAnalyzing(true);
    try {
      // Fetch pre-bundled sample CSV
      const response = await fetch('/uploads/sample_recovery_call_logs.csv');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'sample_recovery_call_logs.csv', { type: 'text/csv' });
      setFile(sampleFile);

      const formData = new FormData();
      formData.append('csv', sampleFile);
      const data = await api.uploadCallLogsCSV(formData);
      setAnalysisResult(data);
      setAnalyzing(false);
    } catch (err) {
      setError('Could not load sample CSV.');
      setAnalyzing(false);
    }
  };

  const summary = analysisResult?.summary;
  const violations = analysisResult?.violations || [];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Call Frequency & Statutory Hours Engine</h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
              Pattern Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit recovery telephony logs against RBI Fair Practices Code for calling hour violations and persistent repetition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all"
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Configure Regulatory Rules</span>
          </button>
        </div>
      </div>

      {/* CSV Upload & Controls Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Upload Call Center Telephony Records (CSV)</h4>
              <p className="text-xs text-slate-500">
                Columns: <code className="font-mono text-slate-700">borrower_id, agent_id, phone_number, call_datetime, call_duration, call_status</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={loadSampleCSV}
              disabled={analyzing}
              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              Load Sample Synthetic Log
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors">
              <UploadCloud className="w-4 h-4" />
              <span>{file ? file.name : 'Select CSV File'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {file && (
              <button
                onClick={handleAnalyzeCSV}
                disabled={analyzing}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                {analyzing ? 'Auditing...' : 'Run Audit'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results View */}
      {summary && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Records Processed</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{summary.total_records}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{summary.unique_borrowers} borrowers</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Calling Hours Breaches</span>
              <p className="text-xl font-bold text-red-600 mt-1">{summary.time_window_violations_count}</p>
              <span className="text-[11px] text-red-500 mt-0.5 block">Outside 08:00 - 19:00</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Daily Frequency Limits</span>
              <p className="text-xl font-bold text-amber-600 mt-1">{summary.frequency_violations_count}</p>
              <span className="text-[11px] text-amber-600 mt-0.5 block">&gt; 3 calls in single calendar day</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Rapid Repetition Intervals</span>
              <p className="text-xl font-bold text-purple-600 mt-1">{summary.interval_violations_count}</p>
              <span className="text-[11px] text-purple-600 mt-0.5 block">&lt; 120 mins cooldown breach</span>
            </div>
          </div>

          {/* High-Risk Agents Concentration */}
          {summary.high_risk_agents && summary.high_risk_agents.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Agent Pattern Violation Concentration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {summary.high_risk_agents.map((ag) => (
                  <div key={ag.agent_id} className="p-3 bg-red-50/60 border border-red-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{ag.agent_id}</span>
                      <span className="text-[11px] text-red-700">Repeated pattern breach</span>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-red-200 text-red-900 rounded">
                      {ag.violations_count} breaches
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Violations Detail Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Detected Statutory Non-Compliance Incidents ({violations.length})
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Synthetic Telephony Audit</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Violation Type</th>
                    <th className="py-2.5 px-4">Borrower Account</th>
                    <th className="py-2.5 px-4">Agent ID</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Specific Incident Finding</th>
                    <th className="py-2.5 px-4">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {violations.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {v.violation_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-600">
                        {v.borrower_id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {v.agent_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(v.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {v.detail}
                      </td>
                      <td className="py-3 px-4">
                        <SeverityBadge severity={v.severity} />
                      </td>
                    </tr>
                  ))}
                  {violations.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                        No pattern violations found in this log. All calls compliant with statutory limits.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
