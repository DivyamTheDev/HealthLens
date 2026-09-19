import React, { useState } from 'react';
import { ReportMetadata } from '../types/health.js';
import {
  FileText,
  Calendar,
  Eye,
  GitCompare,
  Search,
  CheckSquare,
  Square,
  UploadCloud,
} from 'lucide-react';

interface ReportsListProps {
  reports: ReportMetadata[];
  onSelectReport: (reportId: string) => void;
  onCompareSelected: (prevId: string, currId: string) => void;
  onNavigate: (tab: string) => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  onSelectReport,
  onCompareSelected,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Sort newest first
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );

  const filteredReports = sortedReports.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.reportDate.includes(q) ||
      r.reportType.toLowerCase().includes(q) ||
      r.labName.toLowerCase().includes(q)
    );
  });

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const handleExecuteCompare = () => {
    if (selectedForCompare.length === 2) {
      onCompareSelected(selectedForCompare[0], selectedForCompare[1]);
      onNavigate('compare');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Medical Reports Archive
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View all uploaded diagnostic records or select any two to compare
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length === 2 && (
            <button
              onClick={handleExecuteCompare}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition-all flex items-center gap-1.5 animate-in fade-in"
            >
              <GitCompare className="w-4 h-4" />
              Compare Selected (2)
            </button>
          )}

          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by date (YYYY-MM-DD), panel type, or laboratory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Reports Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-medium">No medical reports found.</p>
            <p className="text-xs text-slate-400">
              Upload a PDF report or click &quot;1-Click Demo Data&quot; in the header.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => {
              const isSelected = selectedForCompare.includes(report.id);
              return (
                <div
                  key={report.id}
                  className={`p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleSelectForCompare(report.id)}
                      className="text-slate-400 hover:text-amber-600 transition-colors"
                      title="Select to compare"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase border border-teal-200/60 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {report.reportDate}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {report.reportType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{report.labName}</span>
                        <span>•</span>
                        <span>{report.measurementCount} biomarkers</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {report.fileName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => toggleSelectForCompare(report.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                        isSelected
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      {isSelected ? 'Selected' : 'Select'}
                    </button>

                    <button
                      onClick={() => onSelectReport(report.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
