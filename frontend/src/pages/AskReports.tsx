import React, { useState } from 'react';
import { askReports } from '../services/api.js';
import { AskReportsResponse } from '../types/health.js';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relevantReports?: { id: string; date: string; type: string }[];
  referencedBiomarkers?: string[];
}

export const AskReports: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello Alex! I am your HealthLens AI assistant powered by Amazon Bedrock. I can answer questions directly grounded in your uploaded medical laboratory records. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'What changed between my last two reports?',
    'Show my Vitamin D measurements over time',
    'Are any of my cholesterol levels outside the reference interval?',
    'Did my hemoglobin levels improve across 2026?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response: AskReportsResponse = await askReports(textToSend);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relevantReports: response.relevantReports,
        referencedBiomarkers: response.referencedBiomarkers,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `I encountered an issue querying your reports: ${err.message || 'Unknown error'}. Please verify that reports have been loaded.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ask My Reports
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
            Amazon Bedrock RAG
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Ask questions in plain English. Responses are synthesized strictly from your structured
          laboratory records.
        </p>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Suggested:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-all text-left shadow-sm disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Citations block for AI answers */}
                  {!isUser && (msg.relevantReports?.length || msg.referencedBiomarkers?.length) ? (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
                      {msg.relevantReports?.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium"
                        >
                          <Calendar className="w-3 h-3 text-teal-600" />
                          {r.date}
                        </span>
                      ))}

                      {msg.referencedBiomarkers?.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono"
                        >
                          <Layers className="w-3 h-3 text-slate-400" />
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <span
                    className={`text-[10px] mt-1.5 block ${
                      isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 text-sm text-slate-500 flex items-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
                <span>Searching DynamoDB records & synthesizing with Bedrock...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about your lab tests, changes, or reference ranges..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p>
          <strong>Safety Notice:</strong> Ask My Reports answers factual questions about recorded
          laboratory numbers. It does not provide medical diagnoses, treatment plans, or emergency advice.
          Always discuss test results with your doctor.
        </p>
      </div>
    </div>
  );
};
