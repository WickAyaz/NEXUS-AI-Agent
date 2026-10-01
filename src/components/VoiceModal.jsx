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
  const [language, setLanguage] = useState('en-US');
  const [statusMessage, setStatusMessage] = useState('Listening...');
  const recognitionRef = useRef(null);

  // Refs so onEnd callback always gets fresh values (avoids stale closures)
  const isOpenRef = useRef(isOpen);
  const isThinkingRef = useRef(isAgentThinking);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { isThinkingRef.current = isAgentThinking; }, [isAgentThinking]);

  // Helper: safely start recognition
  const startListening = () => {
    try {
      recognitionRef.current?.start();
      setIsListening(true);
      setStatusMessage('Listening to your voice...');
    } catch {}
  };

  // Helper: safely stop recognition
  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  };

  // ── Effect 1: Setup recognizer when modal opens or language changes ──
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      setTranscript('');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setStatusMessage('Voice recognition not supported. Please use Chrome or Edge.');
      return;
    }

    const rec = createSpeechRecognizer({
      lang: language,
      onStart: () => {
        setIsListening(true);
        setStatusMessage('Listening to your voice...');
      },
      onResult: ({ final, interim }) => {
        // Show live interim text so user sees it's working
        setTranscript(final || interim);
        if (interim) setStatusMessage('Listening... (keep speaking)');

        if (final && final.trim().length > 1) {
          setStatusMessage('Processing...');
          onUserSpoke(final.trim());
          setTranscript('');
        }
      },
      onError: (e) => {
        const msgs = {
          'not-allowed': '❌ Mic permission denied! Browser settings mein Allow karo.',
          'no-speech':   '🔇 Koi awaaz nahi aayi, dobara bolo...',
          'audio-capture': '🎤 Mic detect nahi hua. PC settings check karo.',
          'network':     '🌐 Network error.',
          'aborted':     '',
        };
        const msg = msgs[e.error] ?? `Mic error: ${e.error}`;
        if (msg) setStatusMessage(msg);
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          setIsListening(false);
        }
      },
      onEnd: () => {
        // Auto-restart only when modal is open AND agent is NOT thinking
        if (isOpenRef.current && !isThinkingRef.current) {
          setTimeout(() => {
            if (isOpenRef.current && !isThinkingRef.current) {
              try {
                recognitionRef.current?.start();
                setIsListening(true);
                setStatusMessage('Listening to your voice...');
              } catch {}
            }
          }, 350);
        } else {
          setIsListening(false);
          // Effect 2 will restart when agent finishes thinking
        }
      },
    });

    recognitionRef.current = rec;
    try { rec.start(); } catch {}

    return () => {
      try { rec.stop(); } catch {}
      stopSpeaking();
    };
  }, [isOpen, language]); // ← NO isAgentThinking here

  // ── Effect 2: Pause mic while AI thinks, restart when AI finishes ──
  useEffect(() => {
    if (!isOpen || !recognitionRef.current) return;

    if (isAgentThinking) {
      // AI responding — pause mic
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
      setStatusMessage('Nexus is responding...');
    } else {
      // AI done — restart mic after short delay
      const timer = setTimeout(() => {
        if (!isOpenRef.current) return;
        try {
          recognitionRef.current?.start();
          setIsListening(true);
          setStatusMessage('Listening to your voice...');
        } catch {}
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAgentThinking, isOpen]);

  if (!isOpen) return null;

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      stopListening();
      setStatusMessage('Microphone paused');
    } else {
      startListening();
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en-US' ? 'hi-IN' : 'en-US');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151822] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-8 flex flex-col items-center text-center relative overflow-hidden transition-colors">
        {/* Background rings */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-slate-100 dark:bg-indigo-950/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-100 dark:bg-indigo-950/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar */}
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

        {/* Central Orb */}
        <div className="relative my-8 flex items-center justify-center">
          {(isListening || isAgentThinking) && (
            <>
              <div className="absolute w-36 h-36 rounded-full border border-indigo-400/30 animate-ping opacity-25" />
              <div className="absolute w-48 h-48 rounded-full border border-indigo-400/20 animate-pulse opacity-40" />
            </>
          )}
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

        {/* Status */}
        <div className="space-y-2 max-w-sm z-10">
          <h3 className="font-semibold text-slate-800 dark:text-white text-base">
            {isAgentThinking ? 'Nexus is responding...' : statusMessage}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 min-h-10 italic px-4">
            {transcript ? `"${transcript}"` : 'Speak naturally in English or Hindi/Hinglish...'}
          </p>
        </div>

        {/* Controls */}
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
