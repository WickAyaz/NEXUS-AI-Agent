import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, HelpCircle, Terminal } from 'lucide-react';
import Prism from 'prismjs';
// Basic prism languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

export default function CodeBlock({
  language = 'text',
  code = '',
  onRun,
  onExplain,
}) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || 'text').toLowerCase().trim();
  const normalizedLang = cleanLang === 'js' ? 'javascript'
    : cleanLang === 'py' ? 'python'
    : cleanLang === 'html' ? 'markup'
    : cleanLang;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const isRunnable = ['javascript', 'js', 'html', 'python', 'py'].includes(cleanLang);

  return (
    <div className="my-3 rounded-lg border border-slate-200/90 bg-[#1e2029] text-slate-100 shadow-sm overflow-hidden text-sm font-mono">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161821] border-b border-slate-700/60 select-none text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={13} className="text-slate-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
            {language || 'code'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-500">
            {code.trim().split('\n').length} lines
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Explain Button */}
          {onExplain && (
            <button
              onClick={() => onExplain(code, language)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
              title="Ask AI to explain this code"
            >
              <HelpCircle size={12} />
              <span>Explain</span>
            </button>
          )}

          {/* Run / Preview Button */}
          {isRunnable && onRun && (
            <button
              onClick={() => onRun(code, cleanLang)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
              title="Run or preview this code"
            >
              <Play size={12} className="fill-emerald-400" />
              <span>{cleanLang === 'html' ? 'Preview' : 'Run'}</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto max-h-[500px] text-[13px] leading-relaxed">
        <pre className="!m-0 !p-0 !bg-transparent font-mono">
          <code className={`language-${normalizedLang}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
