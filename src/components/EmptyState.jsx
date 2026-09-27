import React from 'react';
import { Sparkles, Code, Calculator, GraduationCap, ArrowUpRight } from 'lucide-react';

export default function EmptyState({ onSelectPrompt }) {
  const suggestions = [
    {
      category: 'Coding & Algorithms',
      icon: Code,
      prompts: [
        'Explain Binary Search algorithm in Python with code and time complexity',
        'Solve Two Sum problem using optimal O(n) Hash Map approach',
        'How does React useState and useEffect work with simple examples?'
      ]
    },
    {
      category: 'Math & Physics Formulas',
      icon: Calculator,
      prompts: [
        'Solve Quadratic Equation ax^2 + bx + c = 0 step-by-step with derivation',
        'Explain Newton\'s Three Laws of Motion with mathematical formulas',
        'How to find eigenvalues and eigenvectors of a 2x2 matrix?'
      ]
    },
    {
      category: 'Study & Concept Learning',
      icon: GraduationCap,
      prompts: [
        'Explain Photosynthesis process in plants with chemical equation',
        'Summarize Database Normalization (1NF, 2NF, 3NF) with real examples',
        'Explain Big O Notation and time complexity for common data structures'
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Hero Welcome */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800/90 border border-indigo-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <Sparkles size={22} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Meet Nexus
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          High-performance AI assistant for software engineering, mathematics, scientific problem solving, and academic study.
        </p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
        {suggestions.map((group, gIdx) => {
          const Icon = group.icon;
          return (
            <div
              key={gIdx}
              className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#151821] shadow-2xs hover:shadow-xs transition-shadow flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                <Icon size={15} className="text-indigo-500 dark:text-indigo-400" />
                <span>{group.category}</span>
              </div>

              <div className="space-y-2 flex-1">
                {group.prompts.map((pText, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => onSelectPrompt(pText)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all group flex items-start justify-between gap-1.5"
                  >
                    <span className="line-clamp-2 leading-relaxed">{pText}</span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-opacity shrink-0 mt-0.5"
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice and Hinglish tip */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1.5">
          🎙️ Speak via microphone in English, Hindi, or Hinglish
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          ⚡ Step-by-step LaTeX math & runnable code blocks
        </span>
      </div>
    </div>
  );
}
