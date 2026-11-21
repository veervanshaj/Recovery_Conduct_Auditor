import React from 'react';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Users, 
  FileAudio, 
  TrendingUp, 
  ArrowUpRight,
  ChevronRight,
  AlertOctagon
} from 'lucide-react';
import { RiskBadge, StatusBadge } from '../common/Badge';
import { formatDurationDetailed, formatSeconds } from '../../utils/formatters';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export function Dashboard({ metrics, onSelectCall, onOpenUpload }) {
  const m = metrics || {};

  // Risk Distribution Data for Donut Chart
  const riskData = [
    { name: 'High Priority', value: m.high_risk_cases || 0, color: '#ef4444' },
    { name: 'Medium Concern', value: m.medium_risk_cases || 0, color: '#f59e0b' },
    { name: 'Low Concern', value: m.low_risk_cases || 0, color: '#10b981' }
  ];

  // Category Bar Chart Data
  const categoryData = (m.flagged_categories || []).map(cat => ({
    name: cat._id?.replace(/_/g, ' ') || 'Unknown',
    count: cat.count
  }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recovery Conduct Compliance Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time acoustic signal processing and contextual AI monitoring for debt recovery interactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <FileAudio className="w-4 h-4" />
            <span>Upload New Recording</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Calls Audited</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileAudio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{m.total_calls || 0}</span>
            <span className="text-xs text-slate-500">recordings</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">100%</span> processed with DSP
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Priority Cases</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">{m.high_risk_cases || 0}</span>
            <span className="text-xs text-red-500 font-medium">require officer sign-off</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Employer & vocal aggression flags
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review Queue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{m.pending_review_queue || 0}</span>
            <span className="text-xs text-amber-600 font-medium">in queue</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting human auditor review
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escalated Cases</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700">{m.escalated_cases || 0}</span>
            <span className="text-xs text-purple-600 font-medium">to Legal / HR</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Formal inquiries opened
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Risk Distribution & Flagged Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Risk Classification Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Evidence-based distribution across audited calls</p>
          <div className="h-56 w-full flex items-center justify-center">
            {m.total_calls > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No call data available yet</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            {riskData.map((item) => (
              <div key={item.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name.split(' ')[0]}</span>
                </div>
                <span className="text-base font-bold text-slate-900 mt-0.5">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged Conduct Categories */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Flagged Conduct Categories</h3>
          <p className="text-xs text-slate-500 mb-4">Multimodal findings grounded in regulatory provisions</p>
          <div className="h-56 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="name" width={170} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No violation categories flagged yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Flagged Calls Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Priority Cases for Compliance Review</h3>
            <p className="text-xs text-slate-500 mt-0.5">Calls containing detected acoustic anomalies and language flags</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Live Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Call ID</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Borrower</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Risk Classification</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(m.recent_flagged_calls || []).map((call) => (
                <tr 
                  key={call.call_id}
                  onClick={() => onSelectCall(call.call_id)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                    {call.call_id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {call.agent_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {call.borrower_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {formatDurationDetailed(call.duration)}
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={call.overall_risk_level} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={call.review_status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!m.recent_flagged_calls || m.recent_flagged_calls.length === 0) && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                    No flagged calls found. Click "Load Demo Scenarios" above or upload an audio recording.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
