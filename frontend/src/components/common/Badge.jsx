import React from 'react';
import { getRiskColorClass } from '../../utils/formatters';

export function RiskBadge({ level, size = 'md' }) {
  const colors = getRiskColorClass(level);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colors.badge} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
      <span className="uppercase tracking-wider">
        {level === 'high' ? 'High Priority Review' : level === 'medium' ? 'Medium Concern' : level === 'low' ? 'Low Concern' : (level || 'Unknown')}
      </span>
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const map = {
    critical: 'bg-red-700 text-white border-red-800',
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    informational: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wider ${map[severity?.toLowerCase()] || map.low}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    cleared: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    escalated: 'bg-red-100 text-red-800 border-red-300',
    under_investigation: 'bg-amber-100 text-amber-800 border-amber-300',
    pending_review: 'bg-slate-100 text-slate-800 border-slate-300',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse',
    failed: 'bg-red-100 text-red-800 border-red-300'
  };

  const label = (status || '').replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${map[status] || map.pending_review}`}>
      {label}
    </span>
  );
}
