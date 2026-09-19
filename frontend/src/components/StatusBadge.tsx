import React from 'react';
import { BiomarkerStatus } from '../types/health.js';
import { CheckCircle2, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: BiomarkerStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  switch (status) {
    case 'normal':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          Normal
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {showIcon && <ArrowDownCircle className="w-3.5 h-3.5 text-blue-600" />}
          Low
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          {showIcon && <ArrowUpCircle className="w-3.5 h-3.5 text-amber-600" />}
          High
        </span>
      );
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
          Critical
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};
