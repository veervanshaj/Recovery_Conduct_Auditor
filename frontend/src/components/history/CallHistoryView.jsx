import React, { useState } from 'react';
import { Search, Filter, History, ChevronRight, FileAudio } from 'lucide-react';
import { RiskBadge, StatusBadge } from '../common/Badge';
import { formatDurationDetailed } from '../../utils/formatters';

export function CallHistoryView({ calls = [], onSelectCall, onOpenUpload }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCalls = calls.filter((c) => {
    const matchesSearch = 
      !searchTerm ||
      c.call_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.agent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.borrower_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'all' || c.overall_risk_level === riskFilter;
    const matchesStatus = statusFilter === 'all' || c.review_status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Audited Calls Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full compliance audit trail for loan recovery voice interactions.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <FileAudio className="w-4 h-4" />
          <span>Upload Recording</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Call ID, Agent, Borrower..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Concern</option>
              <option value="low">Low Concern</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="escalated">Escalated</option>
              <option value="cleared">Cleared</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Call ID</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Borrower Account</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Risk Classification</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4">Processed Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCalls.map((call) => (
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
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(call.upload_date || call.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCalls.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    No calls match the selected filter criteria.
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
