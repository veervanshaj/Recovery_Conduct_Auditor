import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { CallAnalysisView } from './components/analysis/CallAnalysisView';
import { CallHistoryView } from './components/history/CallHistoryView';
import { CallPatternView } from './components/call-patterns/CallPatternView';
import { UploadModal } from './components/upload/UploadModal';
import { ComplianceReviewModal } from './components/review/ComplianceReviewModal';
import { ReportViewModal } from './components/report/ReportViewModal';
import { RulesConfigModal } from './components/call-patterns/RulesConfigModal';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [callsList, setCallsList] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [selectedCallData, setSelectedCallData] = useState(null);
  const [loadingCall, setLoadingCall] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reviewTargetCall, setReviewTargetCall] = useState(null);
  const [reportCallId, setReportCallId] = useState(null);

  // Demo seeder state
  const [seeding, setSeeding] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  // Initial load
  useEffect(() => {
    loadDashboard();
    loadCalls();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboardMetrics();
      setDashboardMetrics(data.metrics);
    } catch (err) {
      console.warn('Dashboard fetch warning:', err.message);
    }
  };

  const loadCalls = async () => {
    try {
      const data = await api.getCalls();
      setCallsList(data.calls || []);
      // If no calls exist yet, automatically seed demo scenarios so the dashboard is immediately populated!
      if (!data.calls || data.calls.length === 0) {
        await handleSeedDemo();
      }
    } catch (err) {
      console.warn('Calls fetch warning:', err.message);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await api.seedDemoData();
      await loadDashboard();
      const updated = await api.getCalls();
      setCallsList(updated.calls || []);
      setSeeding(false);
    } catch (err) {
      console.error('Demo seeding error:', err);
      setSeeding(false);
    }
  };

  const handleSelectCall = async (callId) => {
    try {
      setLoadingCall(true);
      setSelectedCallId(callId);
      const data = await api.getCallById(callId);
      setSelectedCallData(data);
      setCurrentTab('analysis');
      setLoadingCall(false);
    } catch (err) {
      console.error('Error fetching call detail:', err);
      setLoadingCall(false);
    }
  };

  const handleUploadSuccess = (newCallId) => {
    loadDashboard();
    loadCalls();
    handleSelectCall(newCallId);
  };

  const handleOpenReview = (call) => {
    setReviewTargetCall(call);
    setIsReviewOpen(true);
  };

  const handleReviewSubmitted = () => {
    if (selectedCallId) {
      handleSelectCall(selectedCallId);
    }
    loadDashboard();
    loadCalls();
  };

  const handleOpenReport = (callId) => {
    setReportCallId(callId);
    setIsReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onSeedDemo={handleSeedDemo}
        seeding={seeding}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
      />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab === 'upload') {
              setIsUploadOpen(true);
            } else if (tab === 'rules') {
              setIsRulesOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          stats={dashboardMetrics}
        />

        <main className="flex-1 bg-slate-50 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              metrics={dashboardMetrics}
              onSelectCall={handleSelectCall}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentTab === 'history' && (
            <CallHistoryView
              calls={callsList}
              onSelectCall={handleSelectCall}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentTab === 'analysis' && (
            <CallAnalysisView
              callData={selectedCallData}
              onBack={() => setCurrentTab('dashboard')}
              onOpenReview={handleOpenReview}
              onOpenReport={handleOpenReport}
            />
          )}

          {currentTab === 'call-patterns' && (
            <CallPatternView
              onOpenRules={() => setIsRulesOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <RulesConfigModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <ComplianceReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        call={reviewTargetCall}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <ReportViewModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        callId={reportCallId}
      />
    </div>
  );
}
