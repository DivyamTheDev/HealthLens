import React, { useState } from 'react';
import { ComparisonItem } from '../types/health.js';
import { StatusBadge } from './StatusBadge.js';
import { ArrowUp, ArrowDown, ArrowRight, Search, Filter } from 'lucide-react';

interface ComparisonTableProps {
  items: ComparisonItem[];
  prevDate: string;
  currDate: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  items,
  prevDate,
  currDate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.biomarker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search & Filter bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search biomarker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Biomarker</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">
                Previous <span className="text-xs text-slate-400 font-normal block">{prevDate}</span>
              </th>
              <th className="py-3 px-3 text-right">
                Current <span className="text-xs text-slate-400 font-normal block">{currDate}</span>
              </th>
              <th className="py-3 px-3 text-center">Change (Δ)</th>
              <th className="py-3 px-3 text-center">Trend</th>
              <th className="py-3 px-4 text-right">Reference Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No biomarkers found matching your search.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const isIncreased = item.direction === 'increased';
                const isDecreased = item.direction === 'decreased';
                const isUnchanged = item.direction === 'unchanged';

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.biomarker}</div>
                      <div className="text-xs text-slate-400">{item.unit}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-medium">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono">
                      {item.prevValue !== null ? (
                        <div>
                          <span className="font-medium text-slate-700">{item.prevValue}</span>
                          {item.prevStatus && (
                            <div className="mt-0.5">
                              <StatusBadge status={item.prevStatus} showIcon={false} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">--</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono">
                      {item.currValue !== null ? (
                        <div>
                          <span className="font-medium text-slate-900">{item.currValue}</span>
                          {item.currStatus && (
                            <div className="mt-0.5">
                              <StatusBadge status={item.currStatus} showIcon={false} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">--</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {item.change !== null ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            isIncreased
                              ? 'bg-blue-50 text-blue-700'
                              : isDecreased
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.change > 0 ? `+${item.change}` : item.change} {item.unit}
                          {item.percentChange !== null && (
                            <span className="text-[10px] block opacity-80">
                              ({item.percentChange > 0 ? `+${item.percentChange}` : item.percentChange}%)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {isIncreased && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                          <ArrowUp className="w-3.5 h-3.5" /> Increased
                        </span>
                      )}
                      {isDecreased && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600">
                          <ArrowDown className="w-3.5 h-3.5" /> Decreased
                        </span>
                      )}
                      {isUnchanged && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                          <ArrowRight className="w-3.5 h-3.5" /> Unchanged
                        </span>
                      )}
                      {item.direction === 'new' && (
                        <span className="text-xs font-semibold text-emerald-600">New</span>
                      )}
                      {item.direction === 'missing' && (
                        <span className="text-xs text-slate-400">Not in current</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-mono">
                      {item.referenceRange}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
