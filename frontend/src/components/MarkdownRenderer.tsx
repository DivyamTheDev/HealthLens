import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  theme?: 'dark' | 'light';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-3 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className={`text-xl font-extrabold tracking-tight mt-4 mb-2 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-lg font-bold mt-3 mb-2 ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-base font-bold mt-3 mb-1.5 pb-1 border-b ${isDark ? 'text-teal-200 border-teal-800/50' : 'text-teal-900 border-slate-200'}`}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={`text-xs font-bold uppercase tracking-wider mt-3 mb-1.5 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className={`text-sm leading-relaxed mb-2.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 my-2.5 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2.5 list-decimal pl-5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`text-sm leading-relaxed flex items-start gap-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isDark ? 'bg-teal-400 shadow-sm shadow-teal-400/50' : 'bg-teal-600'}`} />
              <span className="flex-1">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 px-4 py-2.5 rounded-r-xl my-3 text-xs leading-relaxed ${
              isDark
                ? 'border-teal-400 bg-teal-950/50 text-slate-300'
                : 'border-teal-500 bg-teal-50 text-slate-700'
            }`}>
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className={`font-mono text-xs px-1.5 py-0.5 rounded ${
              isDark ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-teal-700'
            }`}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
