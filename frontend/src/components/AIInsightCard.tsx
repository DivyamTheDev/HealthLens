import React from 'react';
import { Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';

interface AIInsightCardProps {
  summary?: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  summary,
  isLoading = false,
  onRegenerate,
}) => {
  return (
    <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-teal-800/40 relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 border-b border-teal-700/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white flex items-center gap-2">
              Amazon Bedrock Clinical Summary
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Objective, plain-language observation of changes between reports
            </p>
          </div>
        </div>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-teal-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-300">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
            <p className="text-sm">Synthesizing report comparison with Amazon Bedrock...</p>
          </div>
        ) : summary ? (
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-3">
            {summary.split('\n\n').map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic py-4">
            Click &quot;Generate Summary&quot; to produce an AI-powered comparison of these reports.
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Safety Guardrail:</strong> HealthLens AI summarizes
          recorded lab values without rendering clinical diagnoses or prescribing medication.
          Consult your physician for medical advice.
        </p>
      </div>
    </div>
  );
};
