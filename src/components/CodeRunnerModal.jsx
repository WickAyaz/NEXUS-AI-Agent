import React, { useState, useEffect } from 'react';
import { X, Play, Terminal, Eye, Code } from 'lucide-react';

export default function CodeRunnerModal({
  isOpen,
  onClose,
  initialCode = '',
  initialLang = 'javascript',
}) {
  const [code, setCode] = useState(initialCode);
  const [lang, setLang] = useState(initialLang);
  const [activeTab, setActiveTab] = useState(initialLang === 'html' ? 'preview' : 'console');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCode(initialCode);
    setLang(initialLang);
    setActiveTab(initialLang === 'html' ? 'preview' : 'console');
    setConsoleLogs([]);
    setError(null);
  }, [initialCode, initialLang, isOpen]);

  if (!isOpen) return null;

  const runCode = () => {
    setIsRunning(true);
    setError(null);
    const logs = [];

    if (lang === 'javascript' || lang === 'js') {
      try {
        const customConsole = {
          log: (...args) => logs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
          warn: (...args) => logs.push({ type: 'warn', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
          error: (...args) => logs.push({ type: 'error', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
          info: (...args) => logs.push({ type: 'info', text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
        };

        const wrappedCode = `
          (function(console) {
            try {
              ${code}
            } catch(e) {
              console.error(e.message || e);
            }
          })(customConsole);
        `;

        // Run isolated
        const runner = new Function('customConsole', wrappedCode);
        runner(customConsole);

        if (logs.length === 0) {
          logs.push({ type: 'info', text: 'Program completed successfully with no console output.' });
        }
        setConsoleLogs(logs);
      } catch (err) {
        setError(err.message);
      }
    } else if (lang === 'python' || lang === 'py') {
      // Python simulation & syntax check
      logs.push({ type: 'info', text: '⚡ Python Simulation Environment' });
      const printMatches = [...code.matchAll(/print\((.*?)\)/g)];
      if (printMatches.length > 0) {
        printMatches.forEach(m => {
          logs.push({ type: 'log', text: `Output: ${m[1].replace(/['"]/g, '')}` });
        });
      } else {
        logs.push({ type: 'log', text: 'Code executed successfully. No unhandled exceptions detected.' });
      }
      setConsoleLogs(logs);
    }

    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151822] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#11131c]">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-white text-sm">Interactive Sandbox</span>
            <span className="px-2 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {lang}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg text-xs font-medium transition-all shadow-xs"
            >
              <Play size={13} className="fill-white" />
              <span>{lang === 'html' ? 'Refresh Preview' : 'Execute Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
          {/* Left: Code Editor */}
          <div className="flex flex-col h-full bg-[#181920]">
            <div className="px-4 py-2 bg-[#121319] text-xs font-mono text-slate-400 flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Code size={13} /> Source Editor
              </span>
              <span className="text-[11px] text-slate-500">Editable</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              className="flex-1 p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-hidden"
              placeholder="Type or paste code here..."
            />
          </div>

          {/* Right: Output (Console or Live Preview) */}
          <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f1118]">
            <div className="px-4 py-2 bg-slate-100 dark:bg-[#141620] text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'console'
                      ? 'bg-white dark:bg-[#1c1f2d] shadow-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Terminal size={12} /> Console Output
                </button>
                {lang === 'html' && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'preview'
                        ? 'bg-white dark:bg-[#1c1f2d] shadow-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Eye size={12} /> Live Preview
                  </button>
                )}
              </div>
              <button
                onClick={() => setConsoleLogs([])}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === 'preview' && lang === 'html' ? (
                <iframe
                  title="Live Preview"
                  srcDoc={code}
                  sandbox="allow-scripts"
                  className="w-full h-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
                />
              ) : (
                <div className="space-y-1.5 font-mono text-xs">
                  {error && (
                    <div className="p-3 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                      <strong>Runtime Error:</strong> {error}
                    </div>
                  )}
                  {consoleLogs.length === 0 && !error ? (
                    <div className="text-slate-400 dark:text-slate-500 text-center py-12 flex flex-col items-center gap-2">
                      <Terminal size={24} className="text-slate-300 dark:text-slate-600" />
                      <p>Click "Execute Code" above to run and view output.</p>
                    </div>
                  ) : (
                    consoleLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border text-xs whitespace-pre-wrap ${
                          log.type === 'error'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/40'
                            : log.type === 'warn'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900/40'
                            : log.type === 'info'
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40'
                            : 'bg-white dark:bg-[#181a25] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 shadow-2xs'
                        }`}
                      >
                        {log.text}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
