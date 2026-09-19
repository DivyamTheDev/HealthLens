import React, { useState, useEffect } from 'react';
import { compareReports, generateSummary } from '../services/api.js';
import { ComparisonResult, ReportMetadata } from '../types/health.js';
import { ComparisonTable } from '../components/ComparisonTable.js';
import { AIInsightCard } from '../components/AIInsightCard.js';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
} from 'lucide-react';

interface CompareReportsProps {
  reports: ReportMetadata[];
  initialPrevId?: string;
  initialCurrId?: string;
}

export const CompareReports: React.FC<CompareReportsProps> = ({
  reports,
  initialPrevId,
  initialCurrId,
}) => {
  // Sort chronological (oldest to newest)
  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
  );

  const [prevId, setPrevId] = useState<string>(
    initialPrevId || (sortedReports.length >= 2 ? sortedReports[0].id : '')
  );
  const [currId, setCurrId] = useState<string>(
    initialCurrId || (sortedReports.length >= 1 ? sortedReports[sortedReports.length - 1].id : '')
  );

  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger comparison when IDs change
  useEffect(() => {
    if (!prevId || !currId) return;
    if (prevId === currId) {
      setError('Please select two distinct reports to compare.');
      setComparison(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    compareReports(prevId, currId, true)
      .then((data) => {
        if (mounted) {
          setComparison(data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to compare reports');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [prevId, currId]);

  const handleRegenerateSummary = async () => {
    if (!prevId || !currId) return;
    setGeneratingSummary(true);
    try {
      const res = await generateSummary(prevId, currId);
      if (comparison) {
        setComparison({
          ...comparison,
          aiSummary: res.aiSummary,
        });
      }
    } catch (err: any) {
      console.error('Failed to regenerate summary:', err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Metrics for comparison
  const increasedCount = comparison?.items.filter((i) => i.direction === 'increased').length || 0;
  const decreasedCount = comparison?.items.filter((i) => i.direction === 'decreased').length || 0;
  const unchangedCount = comparison?.items.filter((i) => i.direction === 'unchanged').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Report Comparison
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              Hero Feature
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Compare two lab reports side-by-side to track numeric changes (Δ) and plain-language
            observations
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Previous Report Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Previous Report (Baseline)
            </label>
            <select
              value={prevId}
              onChange={(e) => setPrevId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="" disabled>
                Select previous report...
              </option>
              {sortedReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reportDate} — {r.reportType} ({r.labName})
                </option>
              ))}
            </select>
          </div>

          {/* Arrow Divider */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <ArrowRight className="w-5 h-5 hidden md:block" />
              <GitCompare className="w-5 h-5 md:hidden" />
            </div>
          </div>

          {/* Current Report Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Current Report (Follow-up)
            </label>
            <select
              value={currId}
              onChange={(e) => setCurrId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="" disabled>
                Select current report...
              </option>
              {sortedReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reportDate} — {r.reportType} ({r.labName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Computing measurement deltas and querying Amazon Bedrock...</p>
        </div>
      ) : comparison ? (
        <div className="space-y-8">
          {/* Summary Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Total Compared</span>
                <span className="text-xl font-bold text-slate-900">{comparison.items.length}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Increased (↑)</span>
                <span className="text-xl font-bold text-blue-700">{increasedCount}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Decreased (↓)</span>
                <span className="text-xl font-bold text-purple-700">{decreasedCount}</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600">
                <Minus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Unchanged (→)</span>
                <span className="text-xl font-bold text-slate-700">{unchangedCount}</span>
              </div>
            </div>
          </div>

          {/* Feature #7: AI Summary Card */}
          <AIInsightCard
            summary={comparison.aiSummary}
            isLoading={generatingSummary}
            onRegenerate={handleRegenerateSummary}
          />

          {/* Feature #5: Side-by-Side Comparison Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg">Detailed Biomarker Changes</h2>
              <span className="text-xs text-slate-500">
                Displaying recorded values &amp; reference ranges
              </span>
            </div>

            <ComparisonTable
              items={comparison.items}
              prevDate={comparison.prevReport.reportDate}
              currDate={comparison.currReport.reportDate}
            />
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-3">
          <GitCompare className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <p className="text-sm font-medium">Select two reports above to begin comparison.</p>
        </div>
      )}
    </div>
  );
};
