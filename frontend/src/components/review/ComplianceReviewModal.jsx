import React, { useState } from 'react';
import { UserCheck, X, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';
import { api } from '../../services/api';

export function ComplianceReviewModal({ isOpen, onClose, call, onReviewSubmitted }) {
  const [reviewStatus, setReviewStatus] = useState(call?.review_status || 'under_investigation');
  const [notes, setNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('Logged in compliance register');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !call) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide compliance review rationale notes.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitReview(call.call_id, {
        review_status: reviewStatus,
        reviewer_notes: notes,
        action_taken: actionTaken,
        reviewer_id: 'COMPLIANCE_OFFICER_1'
      });
      setSubmitting(false);
      onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Human Compliance Sign-Off</h3>
              <p className="text-xs text-slate-500 font-mono">Call: {call.call_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Statutory Review Mandate</span>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              AI findings and acoustic DSP observations serve as supporting evidence for human judgment. Final determination of conduct compliance rests with the human compliance officer.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Determination Verdict</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 bg-white"
            >
              <option value="pending_review">Pending Review (Hold in queue)</option>
              <option value="under_investigation">Under Investigation (Audit team assigned)</option>
              <option value="escalated">Escalated (Forward to Disciplinary / Legal Committee)</option>
              <option value="cleared">Cleared (Compliant / False positive)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Compliance Officer Notes & Findings</label>
            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail observations on acoustic surge, spoken phrases, borrower context, and mitigating factors..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recommended Action</label>
            <input
              type="text"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g. Forward to HR; Agent refresher training; Logged in register"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Submit Sign-Off'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
