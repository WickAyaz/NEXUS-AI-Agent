import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Settings,
  Edit2,
  Check,
  X,
  Sparkles,
  ChevronLeft,
  Pin,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onToggle,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onClearAllConversations,
  onOpenSettings,
  providerStatus = 'offline',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredConversations = conversations.filter(c =>
    (c.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title || 'New Chat');
  };

  const saveRename = (id, e) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-2xs z-30 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#f8f9fa] dark:bg-[#0e1118] border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-200 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-none'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={13} />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">
              Nexus AI
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 md:hidden"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-[#161922] border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <span className="flex items-center gap-2">
              <Plus size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span>New Conversation</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Search input if multiple conversations */}
        {conversations.length > 2 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-7 pr-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-[#161922] border border-transparent focus:border-slate-300 dark:focus:border-slate-600 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden transition-all"
              />
            </div>
          </div>
        )}

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Conversations
          </div>

          {filteredConversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No chats found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(conv.id, e);
                          if (e.key === 'Escape') cancelRename(e);
                        }}
                        className="w-full px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white focus:outline-hidden"
                      />
                      <button
                        onClick={(e) => saveRename(conv.id, e)}
                        className="text-emerald-600 hover:text-emerald-700 p-0.5"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="truncate flex-1">
                        {conv.title || 'Untitled Conversation'}
                      </span>

                      {/* Action buttons on hover */}
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => startRename(conv, e)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                          title="Rename"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0c0e14] space-y-2">
          {/* Engine Status pill */}
          <div className="flex items-center justify-between text-[11px] px-2 py-1 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  providerStatus === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              <span>{providerStatus === 'connected' ? 'Live Cloud Model' : 'Offline Solver'}</span>
            </span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings size={14} className="text-slate-500 dark:text-slate-400" />
            <span>Settings & API Key</span>
          </button>
        </div>
      </aside>
    </>
  );
}
