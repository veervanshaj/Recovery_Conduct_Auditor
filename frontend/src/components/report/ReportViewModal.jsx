import React, { useState, useEffect } from 'react';
import { FileText, X, Printer, Download, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export function ReportViewModal({ isOpen, onClose, callId }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && callId) {
      loadReport();
    }
  }, [isOpen, callId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.getCallReport(callId);
      setReportData(data.report);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load report:', err);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Evidence Compliance Audit Dossier</h3>
            <span className="font-mono text-xs text-slate-400">({callId})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Audit Report Document */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs text-slate-800 bg-white">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading audit dossier...</div>
          ) : reportData ? (
            <div className="space-y-6 font-sans">
              {/* Report Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">RECOVERY CONDUCT COMPLIANCE AUDIT</h1>
                  <p className="text-xs text-slate-500 mt-0.5">{reportData.report_metadata.regulatory_framework}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">Dossier ID: {reportData.report_metadata.report_id}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-slate-100 font-mono font-bold text-slate-800 text-xs border border-slate-300">
                    STATUS: {reportData.risk_verdict.review_status?.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Audited: {new Date(reportData.report_metadata.generated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Call Profile Table */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">1. Interaction Profile</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Call Reference</span>
                    <strong className="font-mono text-slate-900">{reportData.call_profile.call_id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recovery Agent</span>
                    <strong className="text-slate-900">{reportData.call_profile.agent_id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Borrower Account</span>
                    <strong className="text-slate-900">{reportData.call_profile.borrower_id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Audio Duration</span>
                    <strong className="font-mono text-slate-900">{Math.round(reportData.call_profile.duration_seconds)} seconds</strong>
                  </div>
                </div>
              </div>

              {/* Risk Verdict & Summary */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Compliance Risk Verdict</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    reportData.risk_verdict.overall_risk_level === 'high' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {reportData.risk_verdict.overall_risk_level?.toUpperCase()} (Score: {reportData.risk_verdict.risk_score_0_100}/100)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {reportData.risk_verdict.summary}
                </p>
              </div>

              {/* Multimodal Flagged Findings */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Multimodal Flagged Incidents ({reportData.multimodal_flagged_segments.length})
                </h3>
                <div className="space-y-3">
                  {reportData.multimodal_flagged_segments.map((item, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          {idx + 1}. {item.category.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="font-mono text-blue-600 font-semibold">{item.timestamp}</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded italic text-slate-900 font-medium">
                        "{item.transcript_excerpt}"
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <p><strong>Language Finding:</strong> {item.language_evidence}</p>
                        <p><strong>Acoustic Supporting DSP:</strong> {item.audio_evidence.join(', ')}</p>
                        <p><strong>Contextual Setting:</strong> {item.context}</p>
                        <p><strong>Regulatory Assessment:</strong> {item.reason_for_flag}</p>
                      </div>
                    </div>
                  ))}
                  {reportData.multimodal_flagged_segments.length === 0 && (
                    <div className="p-4 text-center text-slate-400 border border-dashed rounded-lg">
                      No conduct non-compliance incidents detected in this recording.
                    </div>
                  )}
                </div>
              </div>

              {/* Acoustic DSP Measurements Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Acoustic Signal (DSP) Summary</h3>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Loudness Surges:</span>
                    <strong className="ml-1 text-slate-900">{reportData.acoustic_evidence_summary.loudness_spikes}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Pitch Variations:</span>
                    <strong className="ml-1 text-slate-900">{reportData.acoustic_evidence_summary.pitch_variations}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Pauses &gt;2.5s:</span>
                    <strong className="ml-1 text-slate-900">{reportData.acoustic_evidence_summary.silence_and_pauses}</strong>
                  </div>
                </div>
              </div>

              {/* Human Review Sign-Off Section */}
              <div className="border-t-2 border-slate-900 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">5. Human Compliance Sign-Off</h3>
                {reportData.human_compliance_notes && reportData.human_compliance_notes.length > 0 ? (
                  reportData.human_compliance_notes.map((rev, i) => (
                    <div key={i} className="p-3 bg-slate-100 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>Reviewer: {rev.reviewer_id}</span>
                        <span>Date: {new Date(rev.reviewed_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 italic">"{rev.reviewer_notes}"</p>
                      <span className="text-[10px] text-slate-500 block">Action: {rev.action_taken}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic">Awaiting compliance officer formal sign-off.</p>
                )}
              </div>

              {/* Regulatory Disclaimer */}
              <p className="text-[10px] text-slate-400 italic pt-4 border-t border-slate-200 leading-relaxed">
                {reportData.disclaimer}
              </p>
            </div>
          ) : (
            <div className="py-12 text-center text-red-500">Failed to render report data.</div>
          )}
        </div>
      </div>
    </div>
  );
}
