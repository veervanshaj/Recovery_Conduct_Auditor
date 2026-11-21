export function formatSeconds(secs) {
  if (secs == null || isNaN(secs)) return '00:00';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}

export function formatDurationDetailed(secs) {
  if (secs == null) return '0s';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.round(secs % 60);
  if (mins === 0) return `${remainingSecs}s`;
  return `${mins}m ${remainingSecs}s`;
}

export function getRiskColorClass(level) {
  switch (level?.toLowerCase()) {
    case 'high':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        badge: 'bg-red-100 text-red-800 border-red-300',
        dot: 'bg-red-500',
        text: 'text-red-700'
      };
    case 'medium':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        text: 'text-amber-700'
      };
    case 'low':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
        dot: 'bg-slate-400',
        text: 'text-slate-600'
      };
  }
}

export function getCategoryLabel(category) {
  const map = {
    'potential_intimidation': 'Potential Intimidation',
    'abusive_language': 'Abusive Language',
    'third_party_threat_employer_family': 'Third-Party Threat (Employer/Family)',
    'public_humiliation_threat': 'Public Humiliation Threat',
    'unreasonable_pressure_tactic': 'Unreasonable Pressure Tactic',
    'deceptive_or_misleading': 'Deceptive / Misleading',
    'prohibited_calling_hour': 'Prohibited Calling Hour'
  };
  return map[category] || category.replace(/_/g, ' ');
}
