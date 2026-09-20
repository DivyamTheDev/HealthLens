import React from 'react';
import { ReportMetadata } from '../types/health.js';
import { MetricCard } from '../components/MetricCard.js';
import {
  FileText,
  Activity,
  Calendar,
  ArrowRight,
  UploadCloud,
  GitCompare,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

interface DashboardProps {
  reports: ReportMetadata[];
  onSelectReport: (reportId: string) => void;
  onNavigate: (tab: string) => void;
  onCompareSelected: (prevId: string, currId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reports,
  onSelectReport,
  onNavigate,
  onCompareSelected,
}) => {
  // Sort descending by date
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );

  const totalReports = sortedReports.length;
  const totalMeasurements = sortedReports.reduce((sum, r) => sum + (r.measurementCount || 0), 0);
  const lastReportDate = sortedReports.length > 0 ? sortedReports[0].reportDate : 'None yet';

  const handleQuickCompare = () => {
    if (sortedReports.length >= 2) {
      const curr = sortedReports[0];
      const prev = sortedReports[1];
      onCompareSelected(prev.id, curr.id);
      onNavigate('compare');
    } else {
      onNavigate('compare');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-500/30 mb-3">
            <Activity className="w-3.5 h-3.5" /> Clinical Lab Intelligence
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Personal Health Dashboard
          </h1>
          <p className="mt-2 text-teal-100/90 text-sm leading-relaxed">
            Welcome to HealthLens. Track your medical lab reports, analyze changes over time,
            and query your health records safely with Amazon Bedrock AI.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow transition-colors"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              Upload New Report
            </button>
            <button
              onClick={handleQuickCompare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              Compare Latest Reports
            </button>
            <button
              onClick={() => onNavigate('ask')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Ask My Reports
            </button>
          </div>
        </div>
      </div>

      {/* Feature #3 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Reports Uploaded"
          value={totalReports}
          subtitle="Processed in S3 & DynamoDB"
          icon={<FileText className="w-6 h-6" />}
          trend={{ value: `${totalReports} active`, isNeutral: true }}
          onClick={() => onNavigate('reports')}
        />
        <MetricCard
          title="Measurements Tracked"
          value={totalMeasurements}
          subtitle="Biomarkers extracted"
          icon={<Activity className="w-6 h-6" />}
          trend={{ value: '100% structured', isPositive: true }}
          onClick={() => onNavigate('timeline')}
        />
        <MetricCard
          title="Last Report Date"
          value={lastReportDate}
          subtitle="Alex Taylor (Blood Test)"
          icon={<Calendar className="w-6 h-6" />}
          trend={{ value: 'Latest panel', isPositive: true }}
          onClick={() => sortedReports[0] && onSelectReport(sortedReports[0].id)}
        />
      </div>

      {/* Recent Reports List (Feature #3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Medical Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely stored in AWS S3 and indexed in Amazon DynamoDB
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            View All ({sortedReports.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sortedReports.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm">No reports uploaded yet.</p>
            <button
              onClick={() => onNavigate('upload')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
            >
              Upload your first lab report
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedReports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase border border-teal-200/60 shrink-0">
                    PDF
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {report.reportDate}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                        {report.reportType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {report.labName} • {report.measurementCount} measurements extracted
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      if (sortedReports.length >= 2) {
                        const other = sortedReports.find((r) => r.id !== report.id);
                        if (other) {
                          onCompareSelected(other.id, report.id);
                          onNavigate('compare');
                        }
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-slate-500" />
                    Compare
                  </button>

                  <button
                    onClick={() => onSelectReport(report.id)}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    View Report <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Compare Card */}
        <div
          onClick={handleQuickCompare}
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-105 transition-transform shrink-0">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Report Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Side-by-side numerical delta analysis and Amazon Bedrock clinical summaries
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
            Launch Comparison <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Timeline Card */}
        <div
          onClick={() => onNavigate('timeline')}
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600 group-hover:scale-105 transition-transform shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Biomarker Timelines
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualize multi-report trajectories like Vitamin D and Cholesterol over months
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
            View Biomarker Graph <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
