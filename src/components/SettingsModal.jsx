import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Volume2, ExternalLink, Check, Eye, EyeOff, Sparkles, Moon, Sun } from 'lucide-react';
import { getAvailableVoices, speakText } from '../utils/speech';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  theme = 'dark',
  onToggleTheme,
}) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [voices, setVoices] = useState([]);
  const [activeTab, setActiveTab] = useState('model'); // 'model' | 'voice' | 'theme'
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  useEffect(() => {
    const vList = getAvailableVoices();
    setVoices(vList);
    // Voices might load asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(getAvailableVoices());
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleTestVoice = () => {
    speakText("Hello! Nexus AI voice assistant is configured and ready to help.", {
      voiceURI: localSettings.voiceURI,
      rate: localSettings.speechRate || 1.0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151822] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#11131c]">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-slate-800 dark:text-white text-base">Nexus Settings & API</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/40 dark:bg-[#11131c] gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('model')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'model'
                ? 'border-indigo-600 dark:border-indigo-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Key size={14} /> AI Model & Keys
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'voice'
                ? 'border-indigo-600 dark:border-indigo-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Volume2 size={14} /> Voice & Audio
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'theme'
                ? 'border-indigo-600 dark:border-indigo-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Moon size={14} /> Appearance
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeTab === 'model' && (
            <>
              {/* Provider Selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium mb-1.5">
                  Primary AI Intelligence Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('provider', 'gemini')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      localSettings.provider === 'gemini'
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-blue-500" /> Google Gemini (Fast & Free)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Gemini 3.5 Flash Lite / 3.8 Flash. High quota with multimodal vision.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('provider', 'openai')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      localSettings.provider === 'openai'
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Cpu size={14} className="text-emerald-500" /> OpenAI / Ollama Local
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      GPT-4o, GPT-4o-mini, or local Ollama / LM Studio endpoint.
                    </p>
                  </button>
                </div>
              </div>

              {/* Gemini Configuration */}
              {localSettings.provider === 'gemini' && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#11131c] rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 dark:text-slate-200 font-semibold">Google Gemini API Key</label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Get Free API Key <ExternalLink size={11} />
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={localSettings.geminiApiKey || ''}
                      onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                      placeholder="AQ.Ab8RN6... or AIzaSy..."
                      className="w-full px-3 py-2 pr-9 bg-white dark:bg-[#171924] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Select Gemini Model</label>
                    <select
                      value={localSettings.geminiModel || 'gemini-3.5-flash-lite'}
                      onChange={(e) => handleChange('geminiModel', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#171924] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Recommended - Ultra Fast & Free)</option>
                      <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest Flagship Flash)</option>
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash (Balanced High Performance)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Complex Reasoning)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* OpenAI / Ollama Configuration */}
              {localSettings.provider === 'openai' && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#11131c] rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">OpenAI API Key</label>
                    <div className="relative">
                      <input
                        type={showOpenAIKey ? 'text' : 'password'}
                        value={localSettings.openaiApiKey || ''}
                        onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                        placeholder="sk-proj-... (or leave blank for Ollama)"
                        className="w-full px-3 py-2 pr-9 bg-white dark:bg-[#171924] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showOpenAIKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Base Endpoint URL</label>
                    <input
                      type="text"
                      value={localSettings.openaiBaseUrl || 'https://api.openai.com/v1'}
                      onChange={(e) => handleChange('openaiBaseUrl', e.target.value)}
                      placeholder="https://api.openai.com/v1 or http://localhost:11434/v1"
                      className="w-full px-3 py-2 bg-white dark:bg-[#171924] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      For Ollama local model, use: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">http://localhost:11434/v1</code>
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Model Name</label>
                    <input
                      type="text"
                      value={localSettings.openaiModel || 'gpt-4o-mini'}
                      onChange={(e) => handleChange('openaiModel', e.target.value)}
                      placeholder="gpt-4o-mini or llama3 or qwen"
                      className="w-full px-3 py-2 bg-white dark:bg-[#171924] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Offline fallback note */}
              <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                💡 <strong>Note:</strong> If no API key is provided, Nexus automatically runs in <strong>Smart Offline Mode</strong>, solving math, physics, and coding algorithms directly!
              </div>
            </>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium mb-1.5">Text-to-Speech Voice</label>
                <select
                  value={localSettings.voiceURI || ''}
                  onChange={(e) => handleChange('voiceURI', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#171924] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="">Default System Natural Voice</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 dark:text-slate-200 font-medium">Speech Rate (Speed)</label>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {localSettings.speechRate || 1.0}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={localSettings.speechRate || 1.0}
                  onChange={(e) => handleChange('speechRate', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 size={13} /> Test Voice Sound
                </button>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-medium mb-2">Interface Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (theme !== 'dark') onToggleTheme();
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      theme === 'dark'
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      <Moon size={16} className="text-indigo-500" /> Dark Mode
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Sleek dark theme optimized for long coding sessions and low-light environments.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (theme === 'dark') onToggleTheme();
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      theme !== 'dark'
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      <Sun size={16} className="text-amber-500" /> Light Mode
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Clean white aesthetic with crisp typography and subtle borders.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#11131c] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Settings save to browser storage</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} className="text-emerald-400" /> Saved!
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
