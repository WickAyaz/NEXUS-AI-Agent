import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  ChevronDown,
  ChevronRight,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import MathRenderer from './MathRenderer';
import CodeBlock from './CodeBlock';
import { speakText, stopSpeaking } from '../utils/speech';

export default function ChatMessage({
  message,
  onRunCode,
  onExplainCode,
  onSaveToNotes,
  onRegenerate,
  speechSettings,
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  const isUser = message.role === 'user';

  // Handle Speech Read Aloud
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(message.content, {
        voiceURI: speechSettings?.voiceURI,
        rate: speechSettings?.speechRate || 1.0,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse Thought Process if present
  let thoughtText = null;
  let mainContent = message.content || '';

  const thoughtMatch = mainContent.match(/^>\s*💭\s*\*\*Thought Process\*\*:\s*([\s\S]*?)\n\n/);
  if (thoughtMatch) {
    thoughtText = thoughtMatch[1].trim();
    mainContent = mainContent.slice(thoughtMatch[0].length);
  }

  // Parse Code Blocks and Text Blocks
  const parseBlocks = (text) => {
    const blocks = [];
    const codeBlockRegex = /```([a-zA-Z0-9_\-\+\.]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Preceding text
      if (match.index > lastIndex) {
        const textChunk = text.slice(lastIndex, match.index).trim();
        if (textChunk) {
          blocks.push({ type: 'text', content: textChunk });
        }
      }

      // Code block
      blocks.push({
        type: 'code',
        language: match[1] || 'text',
        code: match[2].trimEnd(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < text.length) {
      const textChunk = text.slice(lastIndex).trim();
      if (textChunk) {
        blocks.push({ type: 'text', content: textChunk });
      }
    }

    return blocks;
  };

  const blocks = parseBlocks(mainContent);

  return (
    <div
      className={`py-5 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-white/60 dark:bg-[#12151e]/60 border-y border-slate-100/80 dark:border-slate-800/60'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4 items-start">
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium ${
            isUser
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              : 'bg-slate-900 dark:bg-indigo-600 text-white shadow-2xs'
          }`}
        >
          {isUser ? <User size={15} /> : <Sparkles size={14} />}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 overflow-hidden space-y-2 text-sm text-slate-800 dark:text-slate-200">
          {/* Role Name */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-900 dark:text-white">
              {isUser ? 'You' : 'Nexus'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>

          {/* User Attachments (if any) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-1">
              {message.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                >
                  <FileCode size={13} className="text-slate-500 dark:text-slate-400" />
                  <span className="font-medium truncate max-w-xs">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Collapsible Thought Process */}
          {thoughtText && (
            <div className="my-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs text-slate-600 dark:text-slate-300 overflow-hidden">
              <button
                onClick={() => setIsThoughtOpen(!isThoughtOpen)}
                className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span className="text-sm">💭</span>
                  <span>Reasoning & Thought Process</span>
                </div>
                {isThoughtOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isThoughtOpen && (
                <div className="p-3 border-t border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                  {thoughtText}
                </div>
              )}
            </div>
          )}

          {/* Render parsed blocks */}
          <div className="space-y-3 leading-relaxed">
            {blocks.map((block, idx) => {
              if (block.type === 'code') {
                return (
                  <CodeBlock
                    key={idx}
                    language={block.language}
                    code={block.code}
                    onRun={onRunCode}
                    onExplain={onExplainCode}
                  />
                );
              } else {
                return (
                  <MathRenderer
                    key={idx}
                    content={block.content}
                    className="whitespace-pre-line"
                  />
                );
              }
            })}
          </div>

          {/* Action Bar for AI message */}
          {!isUser && (
            <div className="flex items-center gap-2 pt-2 text-slate-400 dark:text-slate-500">
              <button
                onClick={handleToggleSpeech}
                className={`p-1.5 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs ${
                  isSpeaking ? 'text-blue-600 dark:text-blue-400 font-medium' : ''
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud with voice'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX size={14} className="text-red-500" />
                    <span className="text-[11px] text-red-500">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={14} />
                    <span className="text-[11px]">Listen</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                title="Copy response"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onSaveToNotes && (
                <button
                  onClick={() => onSaveToNotes(mainContent)}
                  className="p-1.5 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                  title="Bookmark to Study Notes"
                >
                  <Bookmark size={14} />
                  <span className="text-[11px]">Save Note</span>
                </button>
              )}

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                  title="Regenerate response"
                >
                  <RotateCcw size={14} />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
