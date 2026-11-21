import React, { useState } from 'react';
import { UploadCloud, FileAudio, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { api } from '../../services/api';

export function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [agentId, setAgentId] = useState('AGENT-312');
  const [borrowerId, setBorrowerId] = useState('BORROWER-452');
  const [language, setLanguage] = useState('en');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const steps = [
    'Validating audio format & size...',
    'Extracting local DSP features (RMS energy & pYIN pitch)...',
    'Executing local Faster-Whisper transcription...',
    'Matching interval-overlap timestamps...',
    'Synthesizing contextual AI compliance assessment...',
    'Generating final evidence audit dossier...'
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['wav', 'mp3'].includes(ext)) {
        setError('Only WAV and MP3 audio files are supported.');
        return;
      }
      if (selected.size > 50 * 1024 * 1024) {
        setError('File size exceeds the 50 MB limit.');
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an audio file to analyze.');
      return;
    }

    setUploading(true);
    setError(null);
    setCurrentStep(0);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('agent_id', agentId);
    formData.append('borrower_id', borrowerId);
    formData.append('language', language);

    // Simulate step progression during local model processing
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const res = await api.uploadAudio(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      clearInterval(stepInterval);
      setUploading(false);
      onUploadSuccess(res.call_id);
      onClose();
    } catch (err) {
      clearInterval(stepInterval);
      setUploading(false);
      setError(err.response?.data?.message || err.message || 'Upload processing failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upload Recovery Call Recording</h3>
              <p className="text-xs text-slate-500">Audio will be analyzed locally with DSP & Faster-Whisper</p>
            </div>
          </div>
          {!uploading && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop File Area */}
          <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".wav,.mp3"
              disabled={uploading}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center">
              <FileAudio className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {file ? file.name : 'Click to browse or drag recording here'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supported formats: <span className="font-mono font-medium">.WAV, .MP3</span> (Max 50MB)
              </p>
              {file && (
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> {(file.size / (1024 * 1024)).toFixed(2)} MB ready
                </span>
              )}
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Agent ID</label>
              <input
                type="text"
                disabled={uploading}
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="e.g. AGENT-312"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Borrower ID</label>
              <input
                type="text"
                disabled={uploading}
                value={borrowerId}
                onChange={(e) => setBorrowerId(e.target.value)}
                placeholder="e.g. BORROWER-452"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Language Recognition</label>
            <select
              value={language}
              disabled={uploading}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
            >
              <option value="en">English (Default)</option>
              <option value="hi">Hindi (Faster-Whisper Multilingual)</option>
              <option value="auto">Auto-Detect Language</option>
            </select>
          </div>

          {/* Pipeline Progress Indicator */}
          {uploading && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Processing Call Pipeline...</span>
                </span>
                <span className="font-mono">{progress}% Uploaded</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(progress, 15)}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-blue-700 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                <span>{steps[currentStep]}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            {!uploading && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Start Audit Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
