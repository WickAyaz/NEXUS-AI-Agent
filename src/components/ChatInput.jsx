import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Mic,
  MicOff,
  Paperclip,
  X,
  Code,
  Calculator,
  GraduationCap,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speech';

export default function ChatInput({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  persona,
  onSelectPersona,
}) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-US'); // or hi-IN
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice Speech-to-Text handler
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
    } else {
      const rec = createSpeechRecognizer({
        lang: speechLanguage,
        onStart: () => setIsListening(true),
        onResult: ({ final, interim }) => {
          if (final) {
            setInput(prev => (prev ? `${prev} ${final}` : final));
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false),
      });

      recognitionRef.current = rec;
      try {
        rec.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Handle File Uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');

      if (isImg) {
        reader.onload = (uploadEvent) => {
          setAttachments(prev => [
            ...prev,
            {
              id: Date.now() + Math.random().toString(),
              name: file.name,
              type: file.type,
              isImage: true,
              base64: uploadEvent.target.result,
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (uploadEvent) => {
          setAttachments(prev => [
            ...prev,
            {
              id: Date.now() + Math.random().toString(),
              name: file.name,
              type: file.type,
              isImage: false,
              content: uploadEvent.target.result,
            }
          ]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const personas = [
    { id: 'general', label: 'General', icon: Sparkles },
    { id: 'coding', label: 'Coding Mentor', icon: Code },
    { id: 'math', label: 'Math & Science', icon: Calculator },
    { id: 'study', label: 'Study Tutor', icon: GraduationCap },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Persona Selector Chips */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto py-1 text-xs select-none">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1">Mode:</span>
        {personas.map((p) => {
          const Icon = p.icon;
          const isActive = persona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#161822] text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon size={12} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Input Box */}
      <div className="bg-white dark:bg-[#161822] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm focus-within:border-slate-400 dark:focus-within:border-indigo-500/80 focus-within:shadow-md transition-all overflow-hidden">
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
              >
                <FileCode size={13} className="text-slate-500 dark:text-slate-400" />
                <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="flex items-end px-3 py-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              persona === 'coding'
                ? 'Ask coding questions, paste bugs, or request algorithms...'
                : persona === 'math'
                ? 'Ask math equations, physics formulas, step-by-step calculus...'
                : persona === 'study'
                ? 'Ask study concepts, syllabus review, or exam questions...'
                : 'Ask anything in English, Hindi or Hinglish...'
            }
            className="flex-1 max-h-44 p-2 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden resize-none leading-relaxed"
          />

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".py,.js,.jsx,.ts,.tsx,.cpp,.c,.java,.html,.css,.json,.csv,.txt,.md,image/*"
            className="hidden"
          />

          {/* Action buttons inside input */}
          <div className="flex items-center gap-1 pb-1 text-slate-400 dark:text-slate-500">
            {/* File attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Attach code file, document, or image"
            >
              <Paperclip size={17} />
            </button>

            {/* Voice Mic Input */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-xs'
                  : 'hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Click to speak via voice'}
            >
              {isListening ? <Mic size={17} /> : <Mic size={17} />}
            </button>

            {/* Send / Stop Button */}
            {isGenerating ? (
              <button
                onClick={onStopGeneration}
                className="p-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors shadow-xs"
                title="Stop generation"
              >
                <Square size={16} className="fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() || attachments.length > 0
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1">
        <span>Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">Shift+Enter</kbd> for newline</span>
        <span>Voice STT & TTS active</span>
      </div>
    </div>
  );
}
