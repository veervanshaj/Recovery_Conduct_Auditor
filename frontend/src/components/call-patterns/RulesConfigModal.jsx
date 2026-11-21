import React, { useState, useEffect } from 'react';
import { Sliders, X, Check, Save } from 'lucide-react';
import { api } from '../../services/api';

export function RulesConfigModal({ isOpen, onClose }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRules();
    }
  }, [isOpen]);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await api.getRules();
      setRules(data.rules || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setLoading(false);
    }
  };

  const handleParamChange = (ruleId, key, value) => {
    setRules(prev => prev.map(r => {
      if (r.rule_id === ruleId) {
        return {
          ...r,
          parameters: {
            ...r.parameters,
            [key]: value
          }
        };
      }
      return r;
    }));
  };

  const handleSave = async (rule) => {
    try {
      setSaving(true);
      await api.updateRule(rule.rule_id, {
        parameters: rule.parameters,
        is_active: rule.is_active,
        severity: rule.severity
      });
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save rule:', err);
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regulatory Compliance Rules Configuration</h3>
              <p className="text-xs text-slate-500">Configurable statutory thresholds under Fair Lending & RBI Guidelines</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Rules updated successfully. New audits will reflect updated thresholds.</span>
            </div>
          )}

          {rules.map((rule) => (
            <div key={rule.rule_id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rule.rule_name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rule.description}</p>
                  <span className="text-[10px] font-mono text-blue-600 mt-1 block">
                    Ref: {rule.regulatory_reference}
                  </span>
                </div>
                <button
                  onClick={() => handleSave(rule)}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-xs transition-colors shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              {/* Dynamic parameter inputs based on rule */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
                {rule.parameters?.permitted_hours_start != null && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Window Start</label>
                    <input
                      type="time"
                      value={rule.parameters.permitted_hours_start}
                      onChange={(e) => handleParamChange(rule.rule_id, 'permitted_hours_start', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                )}

                {rule.parameters?.permitted_hours_end != null && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Window End</label>
                    <input
                      type="time"
                      value={rule.parameters.permitted_hours_end}
                      onChange={(e) => handleParamChange(rule.rule_id, 'permitted_hours_end', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                )}

                {rule.parameters?.max_calls_per_borrower_per_day != null && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Max Calls / Day</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={rule.parameters.max_calls_per_borrower_per_day}
                      onChange={(e) => handleParamChange(rule.rule_id, 'max_calls_per_borrower_per_day', parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                )}

                {rule.parameters?.min_interval_minutes != null && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Min Cooldown (Mins)</label>
                    <input
                      type="number"
                      min="15"
                      max="360"
                      value={rule.parameters.min_interval_minutes}
                      onChange={(e) => handleParamChange(rule.rule_id, 'min_interval_minutes', parseInt(e.target.value, 10))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
