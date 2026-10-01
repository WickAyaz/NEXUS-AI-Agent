// Speech utilities for Text-to-Speech (TTS) and Speech-to-Text (STT)

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Clean markdown, code blocks, and math symbols for natural voice narration
export function cleanTextForSpeech(text) {
  if (!text) return '';
  let cleaned = text;

  // Replace code blocks with brief message
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' Code snippet provided in the response. ');
  // Replace inline code
  cleaned = cleaned.replace(/`([^`]+)`/g, ' $1 ');
  // Replace math display formulas
  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, ' mathematical formula ');
  cleaned = cleaned.replace(/\$([^$]+)\$/g, ' $1 ');
  // Replace bold / italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, ' $1 ');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, ' $1 ');
  // Replace markdown headers
  cleaned = cleaned.replace(/#{1,6}\s+/g, '');
  // Replace markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ');
  // Replace bullet points and list dashes
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  // Clean multiple spaces and newlines
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

let currentUtterance = null;

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function pauseSpeaking() {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking() {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function getAvailableVoices() {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

export function speakText(text, options = {}) {
  if (!isSpeechSynthesisSupported()) {
    if (options.onError) options.onError(new Error('Speech synthesis not supported.'));
    return;
  }

  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  currentUtterance = utterance;

  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume !== undefined ? options.volume : 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (options.voiceURI) {
    const selectedVoice = voices.find(v => v.voiceURI === options.voiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
  } else {
    // Intelligent voice picker: prefer natural Hindi / Indian English voice if Hinglish or Hindi
    const hasHindiChar = /[\u0900-\u097F]/.test(text);
    if (hasHindiChar) {
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('heera'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const naturalEn = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en'))
        || voices.find(v => v.lang === 'en-US' || v.lang === 'en-IN' || v.lang.startsWith('en'));
      if (naturalEn) utterance.voice = naturalEn;
    }
  }

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (event) => {
    currentUtterance = null;
    if (options.onError) options.onError(event);
  };

  window.speechSynthesis.speak(utterance);
}

export function createSpeechRecognizer({ onResult, onStart, onEnd, onError, lang = 'en-US' }) {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;      // false = more reliable across all browsers
  recognition.interimResults = true;   // show live transcript while speaking
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    if (onResult) {
      onResult({
        final: finalTranscript.trim(),
        interim: interimTranscript.trim(),
      });
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
