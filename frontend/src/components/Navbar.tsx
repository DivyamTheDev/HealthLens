import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  UploadCloud,
  FileText,
  GitCompare,
  TrendingUp,
  MessageSquareText,
  Cloud,
  Database,
  Cpu,
  RotateCcw,
  Check,
} from 'lucide-react';
import { SystemStatus } from '../types/health.js';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  systemStatus: SystemStatus | null;
  onSeedDemo: () => Promise<void>;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  systemStatus,
  onSeedDemo,
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await onSeedDemo();
    } finally {
      setIsSeeding(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4 shrink-0" /> },
    { id: 'upload', label: 'Upload', icon: <UploadCloud className="w-4 h-4 shrink-0" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4 shrink-0" /> },
    {
      id: 'compare',
      label: 'Compare',
      icon: <GitCompare className="w-4 h-4 shrink-0" />,
      badge: 'Hero',
    },
    { id: 'timeline', label: 'Timeline', icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
    {
      id: 'ask',
      label: 'Ask AI',
      icon: <MessageSquareText className="w-4 h-4 shrink-0" />,
    },
  ];

  const isLiveAws = systemStatus?.mode.activeAwsMode === 'Live AWS';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-none">
                <span className="font-extrabold text-base tracking-tight text-slate-900 whitespace-nowrap">
                  HEALTHLENS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hidden lg:inline-block leading-none whitespace-nowrap">
                  AI Lab Analytics
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide whitespace-nowrap mt-1 hidden sm:block leading-none">
                AWS S3 • DynamoDB • Bedrock
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1.5 shrink-0">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap shrink-0 leading-none ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider leading-none ${
                        item.badge === 'Hero'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200/80'
                          : 'bg-purple-100 text-purple-800 border border-purple-200/80'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: AWS Status & Seed Demo */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Pill */}
            <button
              onClick={() => setShowStatusModal(true)}
              className={`hidden sm:inline-flex h-9 items-center gap-2 px-3 rounded-lg text-xs font-semibold transition-colors border whitespace-nowrap shrink-0 leading-none ${
                isLiveAws
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title="Click to view AWS Cloud Services details"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isLiveAws ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                }`}
              />
              <span>{isLiveAws ? 'Live AWS' : 'Simulation'}</span>
            </button>

            {/* Quick Demo Reset / Seed */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="h-9 inline-flex items-center gap-2 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0 leading-none"
            >
              <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Loading...' : 'Demo Data'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium shrink-0 ${
                currentTab === item.id
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cloud Status Modal rendered via Portal to escape header clipping */}
      {showStatusModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStatusModal(false);
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Cloud className="w-5 h-5 text-teal-600" />
                AWS Cloud Architecture Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Cloud className="w-4 h-4 text-slate-500" />
                    Amazon S3 (PDF Reports):
                  </span>
                  <span className="font-semibold text-xs text-teal-700">
                    {systemStatus?.mode.s3 || 'Local Storage'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Database className="w-4 h-4 text-slate-500" />
                    Amazon DynamoDB (Health Records):
                  </span>
                  <span className="font-semibold text-xs text-teal-700">
                    {systemStatus?.mode.dynamodb || 'Local Store'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Cpu className="w-4 h-4 text-slate-500" />
                    Amazon Bedrock (AI Engine):
                  </span>
                  <span className="font-semibold text-xs text-teal-700">
                    {systemStatus?.mode.bedrock || 'Local Heuristics'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Active Bedrock Model:</strong>{' '}
                  <span className="font-mono text-slate-700">
                    {systemStatus?.awsConfig.bedrockModel || 'anthropic.claude-3-haiku-20240307-v1:0'}
                  </span>
                </p>
                <p>
                  <strong>Target Region:</strong>{' '}
                  <span className="font-mono text-slate-700">
                    {systemStatus?.awsConfig.region || 'ap-south-1'}
                  </span>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800">
                <div className="flex items-start gap-1.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p>
                    HealthLens is connected to live AWS Cloud services. PDF reports are encrypted
                    in Amazon S3, indexed in Amazon DynamoDB, and synthesized by Amazon Bedrock!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
