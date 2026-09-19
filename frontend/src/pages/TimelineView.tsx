import React, { useState, useEffect } from 'react';
import { fetchTimeline } from '../services/api.js';
import { BiomarkerTimeline } from '../types/health.js';
import { TrendChart } from '../components/TrendChart.js';
import {
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface TimelineViewProps {
  initialBiomarker?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  initialBiomarker = 'Vitamin D (25-OH)',
}) => {
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>(initialBiomarker);
  const [availableBiomarkers, setAvailableBiomarkers] = useState<string[]>([]);
  const [timelineData, setTimelineData] = useState<BiomarkerTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch available biomarkers list
  useEffect(() => {
    fetchTimeline()
      .then((res: any) => {
        if (res.availableBiomarkers) {
          setAvailableBiomarkers(res.availableBiomarkers);
          if (!res.availableBiomarkers.includes(selectedBiomarker) && res.availableBiomarkers.length > 0) {
            setSelectedBiomarker(res.availableBiomarkers[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load biomarker list:', err));
  }, []);

  // 2. Fetch timeline data for selected biomarker
  useEffect(() => {
    if (!selectedBiomarker) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    fetchTimeline(selectedBiomarker)
      .then((data: any) => {
        if (mounted && data.dataPoints) {
          setTimelineData(data as BiomarkerTimeline);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load timeline');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedBiomarker]);

  // Compute metrics
  const points = timelineData?.dataPoints || [];
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const firstPoint = points.length > 0 ? points[0] : null;
  const values = points.map((p) => p.value);
  const minVal = values.length > 0 ? Math.min(...values) : null;
  const maxVal = values.length > 0 ? Math.max(...values) : null;

  let overallChange: number | null = null;
  let overallPercent: number | null = null;
  if (latestPoint && firstPoint && points.length > 1) {
    overallChange = parseFloat((latestPoint.value - firstPoint.value).toFixed(2));
    if (firstPoint.value !== 0) {
      overallPercent = parseFloat((((latestPoint.value - firstPoint.value) / firstPoint.value) * 100).toFixed(1));
    }
  }

  // Quick preset chips
  const popularBiomarkers = [
    'Vitamin D (25-OH)',
    'Hemoglobin',
    'Total Cholesterol',
    'Fasting Blood Glucose',
    'HbA1c',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Biomarker Health Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 uppercase tracking-wide">
              Visual Wow
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Plot chronological trajectories of any biomarker across all medical reports
          </p>
        </div>
      </div>

      {/* Selector & Presets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Select Tracked Biomarker
            </label>
            <select
              value={selectedBiomarker}
              onChange={(e) => setSelectedBiomarker(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {availableBiomarkers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick chip shortcuts */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Popular:</span>
          {popularBiomarkers.map((bio) => (
            <button
              key={bio}
              onClick={() => setSelectedBiomarker(bio)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedBiomarker === bio
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {bio}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      {timelineData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Latest Recorded</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {latestPoint?.value ?? '--'}{' '}
              <span className="text-xs font-normal text-slate-500">{timelineData.unit}</span>
            </div>
            <span className="text-[11px] text-slate-400">{latestPoint?.date}</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Overall Change</span>
            <div
              className={`text-2xl font-extrabold mt-0.5 flex items-center gap-1 ${
                overallChange === null
                  ? 'text-slate-700'
                  : overallChange > 0
                  ? 'text-teal-700'
                  : overallChange < 0
                  ? 'text-purple-700'
                  : 'text-slate-700'
              }`}
            >
              {overallChange !== null ? (
                <>
                  {overallChange > 0 ? (
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                  )}
                  {overallChange > 0 ? `+${overallChange}` : overallChange}
                </>
              ) : (
                '--'
              )}
            </div>
            {overallPercent !== null && (
              <span className="text-[11px] text-slate-400 font-medium">
                {overallPercent > 0 ? `+${overallPercent}` : overallPercent}% net trajectory
              </span>
            )}
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Lowest Recorded</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {minVal ?? '--'}{' '}
              <span className="text-xs font-normal text-slate-500">{timelineData.unit}</span>
            </div>
            <span className="text-[11px] text-slate-400">Historical Min</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Highest Recorded</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {maxVal ?? '--'}{' '}
              <span className="text-xs font-normal text-slate-500">{timelineData.unit}</span>
            </div>
            <span className="text-[11px] text-slate-400">Historical Max</span>
          </div>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading time-series data...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      ) : timelineData ? (
        <TrendChart
          data={timelineData.dataPoints}
          biomarkerName={timelineData.biomarker}
          unit={timelineData.unit}
          refLow={timelineData.refLow}
          refHigh={timelineData.refHigh}
          referenceRange={timelineData.referenceRange}
        />
      ) : null}

      {/* Data Points Table */}
      {timelineData && timelineData.dataPoints.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Recorded Time-Series Points</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 text-xs border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Report Date</th>
                <th className="py-3 px-4 font-semibold">Recorded Value</th>
                <th className="py-3 px-4 font-semibold">Reference Range</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timelineData.dataPoints.map((pt, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{pt.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {pt.value} {timelineData.unit}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {timelineData.referenceRange}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        pt.status === 'normal'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {pt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
