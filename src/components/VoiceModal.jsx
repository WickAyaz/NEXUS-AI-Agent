import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, Globe, Sparkles } from 'lucide-react';
import {
  createSpeechRecognizer,
  stopSpeaking,
  isSpeechRecognitionSupported,
} from '../utils/speech';

export default function VoiceModal({
  isOpen,
  onClose,
  onUserSpoke,
  isAgentThinking,
  persona = 'general',
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US'); // en-US or hi-IN
  const [statusMessage, setStatusMessage] = useState('Listening...');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      stopSpeaking();
      setIsListening(false);
      setTranscript('');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setStatusMessage('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const rec = createSpeechRecognizer({
      lang: language,
      onStart: () => {
        setIsListening(true);
        setStatusMessage('Listening to your voice...');
      },
      onResult: ({ final, interim }) => {
        setTranscript(final || interim);
        if (final && final.length > 2) {
          setStatusMessage('Processing your prompt...');
          onUserSpoke(final);
          setTranscript('');
        }
      },
      onError: (e) => {
        if (e.error !== 'no-speech') {
          setStatusMessage(`Mic notice: ${e.error}`);
        }
      },
      onEnd: () => {
        // Auto-restart recognition if modal is still open and agent is not speaking
        if (isOpen && !isAgentThinking) {
          try {
            rec.start();
          } catch {}
        }
      },
    });

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {}

    return () => {
      try { rec.stop(); } catch {}
      stopSpeaking();
    };
  }, [isOpen, language, isAgentThinking]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
      setStatusMessage('Microphone paused');
    } else {
      try { recognitionRef.current.start(); } catch {}
      setIsListening(true);
      setStatusMessage('Listening...');
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en-US' ? 'hi-IN' : 'en-US';
    setLanguage(nextLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151822] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-8 flex flex-col items-center text-center relative overflow-hidden transition-colors">
        {/* Subtle decorative background ring */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-slate-100 dark:bg-indigo-950/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-100 dark:bg-indigo-950/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar info */}
        <div className="flex items-center justify-between w-full mb-8 z-10 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-200">
            <Sparkles size={13} className="text-indigo-500 dark:text-indigo-400" />
            <span className="capitalize">{persona} Voice Mode</span>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors font-medium text-slate-700 dark:text-slate-200"
            title="Toggle between English and Hindi/Hinglish"
          >
            <Globe size={13} />
            <span>{language === 'en-US' ? 'English (US)' : 'Hindi / Hinglish'}</span>
          </button>
        </div>

        {/* Central Audio Visualizer Ring */}
        <div className="relative my-8 flex items-center justify-center">
          {/* Animated concentric ripples when active */}
          {(isListening || isAgentThinking) && (
            <>
              <div className="absolute w-36 h-36 rounded-full border border-indigo-400/30 animate-ping opacity-25" />
              <div className="absolute w-48 h-48 rounded-full border border-indigo-400/20 animate-pulse opacity-40" />
            </>
          )}

          {/* Central orb */}
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
              isAgentThinking
                ? 'bg-slate-800 dark:bg-indigo-600 text-white scale-105'
                : isListening
                ? 'bg-slate-900 dark:bg-indigo-500 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            {isAgentThinking ? (
              <Volume2 size={36} className="animate-pulse" />
            ) : isListening ? (
              <Mic size={36} className="animate-bounce" />
            ) : (
              <MicOff size={36} />
            )}
          </div>
        </div>

        {/* Status message */}
        <div className="space-y-2 max-w-sm z-10">
          <h3 className="font-semibold text-slate-800 dark:text-white text-base">
            {isAgentThinking ? 'Nexus is speaking...' : statusMessage}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 min-h-10 italic px-4">
            {transcript ? `"${transcript}"` : 'Speak naturally in English or Hindi/Hinglish...'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-8 z-10">
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-full transition-all shadow-xs ${
              isListening
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/40'
            }`}
            title={isListening ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-semibold shadow-md transition-colors"
          >
            <PhoneOff size={16} />
            <span>End Voice Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
