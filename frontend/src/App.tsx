import { useState, useEffect } from 'react';
import { fetchReports, fetchStatus, seedDemoData } from './services/api.js';
import { ReportDetail, ReportMetadata, SystemStatus } from './types/health.js';
import { Navbar } from './components/Navbar.js';
import { Dashboard } from './pages/Dashboard.js';
import { UploadReport } from './pages/UploadReport.js';
import { ReportsList } from './pages/ReportsList.js';
import { ReportDetails } from './pages/ReportDetails.js';
import { CompareReports } from './pages/CompareReports.js';
import { TimelineView } from './pages/TimelineView.js';
import { AskReports } from './pages/AskReports.js';
import { Cloud, Database, Cpu, Server } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Deep link state for child pages
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [comparePrevId, setComparePrevId] = useState<string | undefined>();
  const [compareCurrId, setCompareCurrId] = useState<string | undefined>();
  const [timelineBiomarker, setTimelineBiomarker] = useState<string | undefined>('Vitamin D (25-OH)');

  // Refresh reports & status
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [reportsData, statusData] = await Promise.all([
        fetchReports().catch(() => []),
        fetchStatus().catch(() => null),
      ]);
      setReports(reportsData);
      setSystemStatus(statusData);

      // If no reports yet, auto seed demo
      if (reportsData.length === 0) {
        await seedDemoData();
        const refreshed = await fetchReports();
        setReports(refreshed);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setCurrentTab('details');
  };

  const handleCompareSelected = (prevId: string, currId: string) => {
    setComparePrevId(prevId);
    setCompareCurrId(currId);
    setCurrentTab('compare');
  };

  const handleViewBiomarkerTimeline = (biomarkerName: string) => {
    setTimelineBiomarker(biomarkerName);
    setCurrentTab('timeline');
  };

  const handleUploadSuccess = (newReport: ReportDetail) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    setSelectedReportId(newReport.id);
    setCurrentTab('details');
  };

  const handleSeedDemo = async () => {
    await seedDemoData();
    const refreshed = await fetchReports();
    setReports(refreshed);
    if (refreshed.length >= 2) {
      setComparePrevId(refreshed[refreshed.length - 1].id);
      setCompareCurrId(refreshed[0].id);
    }
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        systemStatus={systemStatus}
        onSeedDemo={handleSeedDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 text-center text-slate-500 space-y-3">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Connecting to HealthLens Services...</p>
            <p className="text-xs text-slate-400">Loading S3 &amp; DynamoDB medical data</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                reports={reports}
                onSelectReport={handleSelectReport}
                onNavigate={setCurrentTab}
                onCompareSelected={handleCompareSelected}
              />
            )}

            {currentTab === 'upload' && (
              <UploadReport
                onUploadSuccess={handleUploadSuccess}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsList
                reports={reports}
                onSelectReport={handleSelectReport}
                onCompareSelected={handleCompareSelected}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'details' && selectedReportId && (
              <ReportDetails
                reportId={selectedReportId}
                onBack={() => setCurrentTab('dashboard')}
                onCompareWith={(repId) => {
                  const other = reports.find((r) => r.id !== repId);
                  if (other) {
                    handleCompareSelected(other.id, repId);
                  } else {
                    setCurrentTab('compare');
                  }
                }}
                onViewBiomarkerTimeline={handleViewBiomarkerTimeline}
              />
            )}

            {currentTab === 'compare' && (
              <CompareReports
                reports={reports}
                initialPrevId={comparePrevId}
                initialCurrId={compareCurrId}
              />
            )}

            {currentTab === 'timeline' && (
              <TimelineView initialBiomarker={timelineBiomarker} />
            )}

            {currentTab === 'ask' && <AskReports />}
          </>
        )}
      </main>

      {/* Footer with AWS Architecture Attribution */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-800">
              HEALTHLENS — AWS Medical Report Intelligence Platform
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Built with React, Vite, TypeScript, Tailwind CSS, AWS Lambda, Amazon S3, DynamoDB &amp; Amazon Bedrock.
            </p>
          </div>

          {/* AWS Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              <Cloud className="w-3.5 h-3.5 text-teal-600" /> S3
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              <Database className="w-3.5 h-3.5 text-teal-600" /> DynamoDB
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-teal-600" /> Bedrock AI
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
              <Server className="w-3.5 h-3.5 text-teal-600" /> Lambda &amp; API GW
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
