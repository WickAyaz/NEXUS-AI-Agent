import React from 'react';
import {
  Menu,
  PhoneCall,
  BookOpen,
  Settings,
  Download,
  Share2,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  onOpenVoiceModal,
  onToggleNotes,
  onOpenSettings,
  onExportChat,
  hasMessages,
  providerStatus,
  activeModelName,
  theme = 'dark',
  onToggleTheme,
}) {
  const isDark = theme === 'dark';

  return (
    <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#11141c]/85 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
              Nexus
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                providerStatus === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span>{activeModelName}</span>
          </span>
        </div>
      </div>

      {/* Right action controls */}
      <div className="flex items-center gap-1.5">
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-amber-300 hover:text-slate-900 dark:hover:text-amber-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Voice Call Mode Button */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          title="Start live hands-free voice conversation"
        >
          <PhoneCall size={13} className="text-slate-600 dark:text-slate-300" />
          <span className="hidden sm:inline">Voice Call</span>
        </button>

        {/* Study Notes Button */}
        <button
          onClick={onToggleNotes}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Open Study & Coding Notes"
        >
          <BookOpen size={16} />
        </button>

        {/* Export Chat Button */}
        {hasMessages && (
          <button
            onClick={onExportChat}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Export conversation to Markdown"
          >
            <Download size={16} />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Settings and API Configuration"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
