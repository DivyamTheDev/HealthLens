import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { TimelinePoint } from '../types/health.js';

interface TrendChartProps {
  data: TimelinePoint[];
  biomarkerName: string;
  unit: string;
  refLow?: number;
  refHigh?: number;
  referenceRange?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  biomarkerName,
  unit,
  refLow,
  refHigh,
  referenceRange,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm">
        No historical measurements available for this biomarker.
      </div>
    );
  }

  // Calculate domain padding for Y-Axis
  const values = data.map((d) => d.value);
  if (refLow !== undefined) values.push(refLow);
  if (refHigh !== undefined) values.push(refHigh);

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.2 || 5;

  const yMin = Math.max(0, Math.floor(minVal - padding));
  const yMax = Math.ceil(maxVal + padding);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            {biomarkerName}
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {unit}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Reference Interval:{' '}
            <span className="font-semibold text-slate-700 font-mono">
              {referenceRange || `${refLow ?? 0} - ${refHigh ?? 'max'} ${unit}`}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
            <span className="text-slate-600">Recorded Value</span>
          </div>
          {refLow !== undefined && refHigh !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
              <span className="text-slate-600">Normal Range</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              domain={[yMin, yMax]}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dx={-5}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as TimelinePoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
                      <p className="font-semibold text-teal-300">{item.date}</p>
                      <p className="text-sm font-bold">
                        {item.value} {unit}
                      </p>
                      <p className="capitalize text-slate-300">
                        Status:{' '}
                        <span
                          className={
                            item.status === 'normal'
                              ? 'text-emerald-400 font-medium'
                              : 'text-amber-400 font-medium'
                          }
                        >
                          {item.status}
                        </span>
                      </p>
                      {referenceRange && (
                        <p className="text-[10px] text-slate-400">Ref: {referenceRange}</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Reference Normal Zone */}
            {refLow !== undefined && refHigh !== undefined && (
              <ReferenceArea
                y1={refLow}
                y2={refHigh}
                fill="#10b981"
                fillOpacity={0.08}
                stroke="#10b981"
                strokeOpacity={0.3}
                strokeDasharray="2 2"
              />
            )}

            {refLow !== undefined && (
              <ReferenceLine
                y={refLow}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: `Min (${refLow})`,
                  position: 'insideBottomLeft',
                  fill: '#059669',
                  fontSize: 10,
                }}
              />
            )}

            {refHigh !== undefined && (
              <ReferenceLine
                y={refHigh}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: `Max (${refHigh})`,
                  position: 'insideTopLeft',
                  fill: '#059669',
                  fontSize: 10,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke="#0d9488"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#valueGradient)"
              dot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 7, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
