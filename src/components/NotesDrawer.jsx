import React, { useState } from 'react';
import { X, BookOpen, Trash2, Download, Copy, Plus, Check } from 'lucide-react';

export default function NotesDrawer({
  isOpen,
  onClose,
  notes = [],
  onAddNote,
  onDeleteNote,
  onClearNotes,
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveNote = () => {
    if (!newContent.trim()) return;
    onAddNote({
      id: Date.now().toString(),
      title: newTitle.trim() || 'Untitled Note',
      content: newContent.trim(),
      date: new Date().toLocaleDateString(),
    });
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleDownload = () => {
    const markdown = notes.map(n => `## ${n.title} (${n.date})\n\n${n.content}\n\n---\n`).join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Agent_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = async () => {
    const text = notes.map(n => `${n.title}\n${n.content}`).join('\n\n---\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-[#12141d] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f1118]">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Study & Code Notes</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            {notes.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {notes.length > 0 && (
            <>
              <button
                onClick={handleCopyAll}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800"
                title="Copy all notes"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800"
                title="Download notes as Markdown"
              >
                <Download size={16} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Add note section */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#12141d]">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Add Quick Note / Formula
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Note title (e.g. Dijkstra algorithm, Quadratic steps)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-[#181a24] text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
            />
            <textarea
              placeholder="Write note or paste formula..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-[#181a24] text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 resize-none font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-slate-800 dark:hover:bg-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-xs">
            <BookOpen size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p>No notes saved yet.</p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              Click the bookmark icon on any message in chat to save it here!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-slate-50/80 dark:bg-[#181a25] hover:bg-slate-50 dark:hover:bg-[#1e202e] border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs space-y-1.5 transition-all shadow-2xs group"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[13px]">{note.title}</h4>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                  title="Delete note"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto">
                {note.content}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-1">{note.date}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notes.length > 0 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f1118] flex justify-between items-center text-xs">
          <button
            onClick={onClearNotes}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Auto-saved locally</span>
        </div>
      )}
    </div>
  );
}
