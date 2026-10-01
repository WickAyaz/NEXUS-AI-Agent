import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import EmptyState from './components/EmptyState';
import SettingsModal from './components/SettingsModal';
import NotesDrawer from './components/NotesDrawer';
import VoiceModal from './components/VoiceModal';
import CodeRunnerModal from './components/CodeRunnerModal';
import { dispatchAgentResponse } from './services/agentEngine';

const STORAGE_KEYS = {
  CONVERSATIONS: 'antigravity_agent_conversations_v1',
  ACTIVE_ID: 'antigravity_agent_active_id_v1',
  SETTINGS: 'antigravity_agent_settings_v1',
  NOTES: 'antigravity_agent_notes_v1',
};

const DEFAULT_SETTINGS = {
  provider: 'gemini',
  geminiApiKey: '',   // User apni API key Settings mein daale
  geminiModel: 'gemini-3.5-flash-lite',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  openaiBaseUrl: 'https://api.openai.com/v1',
  voiceURI: '',
  speechRate: 1.0,
  theme: 'dark',
};

export default function App() {
  // Theme State (Dark mode by default)
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('nexus_theme');
      if (savedTheme) return savedTheme;
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.theme) return parsed.theme;
      }
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // Settings State with auto-fix for deprecated models and default key
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          !parsed.geminiModel ||
          parsed.geminiModel === 'gemini-2.0-flash' ||
          parsed.geminiModel === 'gemini-2.5-flash' ||
          parsed.geminiModel === 'gemini-1.5-flash'
        ) {
          parsed.geminiModel = 'gemini-3.5-flash-lite';
        }
        if (!parsed.geminiApiKey || !parsed.geminiApiKey.trim()) {
          parsed.geminiApiKey = 'AQ.Ab8RN6KEizuIxK1bRBg7xHS7HstzXTPJuh9DFOYdngqmq9dmng';
        }
        parsed.theme = parsed.theme || theme;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Keep dark class on html root in sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setSettings(s => ({ ...s, theme: next }));
      return next;
    });
  };

  // Conversations State
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialId = Date.now().toString();
    return [
      {
        id: initialId,
        title: 'New Conversation',
        messages: [],
        persona: 'general',
        updatedAt: Date.now(),
      }
    ];
  });

  // Active Conversation ID
  const [activeConversationId, setActiveConversationId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (saved) return saved;
    } catch {}
    return conversations[0]?.id || Date.now().toString();
  });

  // Study Notes State
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI & Modal States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [codeRunnerState, setCodeRunnerState] = useState({ isOpen: false, code: '', lang: 'javascript' });
  const [isGenerating, setIsGenerating] = useState(false);

  const abortControllerRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Active conversation object
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const messages = activeConversation?.messages || [];
  const currentPersona = activeConversation?.persona || 'general';

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isGenerating]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewConversation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Conversation Management
  const handleNewConversation = () => {
    const newId = Date.now().toString();
    const newConv = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      persona: 'general',
      updatedAt: Date.now(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  const handleDeleteConversation = (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const freshId = Date.now().toString();
        const freshConv = {
          id: freshId,
          title: 'New Conversation',
          messages: [],
          persona: 'general',
          updatedAt: Date.now(),
        };
        setActiveConversationId(freshId);
        return [freshConv];
      }
      if (activeConversationId === id) {
        setActiveConversationId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameConversation = (id, newTitle) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const handleClearAllConversations = () => {
    if (confirm('Clear all conversation history?')) {
      const freshId = Date.now().toString();
      setConversations([
        {
          id: freshId,
          title: 'New Conversation',
          messages: [],
          persona: 'general',
          updatedAt: Date.now(),
        }
      ]);
      setActiveConversationId(freshId);
    }
  };

  const handleSelectPersona = (personaId) => {
    setConversations(prev =>
      prev.map(c => (c.id === activeConversationId ? { ...c, persona: personaId } : c))
    );
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Send Message Logic
  const handleSendMessage = async (text, attachments = []) => {
    if ((!text && attachments.length === 0) || isGenerating) return;

    const userMessage = {
      role: 'user',
      content: text,
      attachments,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];

    // Auto-generate title if this is the first message
    let newTitle = activeConversation.title;
    if (messages.length === 0 && text) {
      newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }

    // Placeholder for streaming assistant response
    const assistantMessageIndex = updatedMessages.length;
    const initialAssistantMessage = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const finalMessages = [...updatedMessages, initialAssistantMessage];

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, title: newTitle, messages: finalMessages, updatedAt: Date.now() }
          : c
      )
    );

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      await dispatchAgentResponse({
        messages: updatedMessages,
        settings,
        persona: currentPersona,
        attachments,
        signal: abortControllerRef.current.signal,
        onChunk: (fullStreamedText) => {
          setConversations(prev =>
            prev.map(c => {
              if (c.id !== activeConversationId) return c;
              const newMsgs = [...c.messages];
              if (newMsgs[assistantMessageIndex]) {
                newMsgs[assistantMessageIndex] = {
                  ...newMsgs[assistantMessageIndex],
                  content: fullStreamedText,
                };
              }
              return { ...c, messages: newMsgs };
            })
          );
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMsg = `⚠️ **Error generating response:** ${err.message || 'Unknown network error'}\n\n*Check your API key in Settings (⚙️) or switch to Offline Mode.*`;
        setConversations(prev =>
          prev.map(c => {
            if (c.id !== activeConversationId) return c;
            const newMsgs = [...c.messages];
            if (newMsgs[assistantMessageIndex]) {
              newMsgs[assistantMessageIndex] = {
                ...newMsgs[assistantMessageIndex],
                content: errorMsg,
              };
            }
            return { ...c, messages: newMsgs };
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Quick Action: Explain Code Block
  const handleExplainCode = (code, language) => {
    handleSendMessage(
      `Please explain this ${language || 'code'} block step-by-step. Include its algorithmic time and space complexity, key logic, and edge cases to watch out for:\n\n\`\`\`${language || 'text'}\n${code}\n\`\`\``
    );
  };

  // Quick Action: Run Code in Modal
  const handleRunCode = (code, language) => {
    setCodeRunnerState({
      isOpen: true,
      code,
      lang: language,
    });
  };

  // Quick Action: Save to Notes
  const handleSaveToNotes = (content) => {
    const firstLine = content.split('\n')[0].replace(/^[#*>\s]+/, '').slice(0, 35) || 'Saved Snippet';
    const newNote = {
      id: Date.now().toString(),
      title: firstLine,
      content,
      date: new Date().toLocaleDateString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setIsNotesOpen(true);
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (messages.length < 2 || isGenerating) return;
    const lastUserIndex = messages.findLastIndex(m => m.role === 'user');
    if (lastUserIndex === -1) return;

    const userPrompt = messages[lastUserIndex].content;
    const userAttachments = messages[lastUserIndex].attachments || [];

    // Remove last assistant message
    const trimmed = messages.slice(0, lastUserIndex);
    setConversations(prev =>
      prev.map(c => (c.id === activeConversationId ? { ...c, messages: trimmed } : c))
    );

    handleSendMessage(userPrompt, userAttachments);
  };

  // Export Chat to Markdown
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const mdContent = `# ${activeConversation.title}\n*Exported from Nexus AI Agent on ${new Date().toLocaleString()}*\n\n---\n\n` +
      messages.map(m => `### ${m.role === 'user' ? '👤 User' : '✨ Nexus'}\n\n${m.content}\n\n---\n`).join('\n');

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_chat.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Active Model Name Display
  const hasGeminiKey = Boolean(settings.geminiApiKey?.trim());
  const hasOpenAIKey = Boolean(settings.openaiApiKey?.trim());
  const providerStatus = (settings.provider === 'gemini' && hasGeminiKey) || (settings.provider === 'openai' && (hasOpenAIKey || settings.openaiBaseUrl?.includes('localhost')))
    ? 'connected'
    : 'offline';

  const activeModelName = providerStatus === 'connected'
    ? (settings.provider === 'gemini' ? (settings.geminiModel || 'Gemini 3.5 Flash Lite') : (settings.openaiModel || 'GPT-4o-mini'))
    : 'Smart Offline Engine';

  return (
    <div className="flex h-screen w-full bg-[#fbfbfb] dark:bg-[#090b10] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAllConversations={handleClearAllConversations}
        onOpenSettings={() => setIsSettingsOpen(true)}
        providerStatus={providerStatus}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative dark:bg-[#0d1017]">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExportChat={handleExportChat}
          hasMessages={messages.length > 0}
          providerStatus={providerStatus}
          activeModelName={activeModelName}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Scrollable Conversation Container */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto flex flex-col dark:bg-[#0d1017]"
        >
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          ) : (
            <div className="flex-1 pb-6">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  onRunCode={handleRunCode}
                  onExplainCode={handleExplainCode}
                  onSaveToNotes={handleSaveToNotes}
                  onRegenerate={index === messages.length - 1 && msg.role === 'assistant' ? handleRegenerate : null}
                  speechSettings={settings}
                />
              ))}

              {/* Streaming loading indicator when waiting for initial chunk */}
              {isGenerating && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
                <div className="py-4 px-6 max-w-3xl mx-auto flex items-center gap-3 text-slate-400 dark:text-slate-500 text-xs animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animation-delay-200" />
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animation-delay-400" />
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Nexus is formulating response...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Bottom Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
          persona={currentPersona}
          onSelectPersona={handleSelectPersona}
        />
      </div>

      {/* Slide-out Study & Code Notes Drawer */}
      <NotesDrawer
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        notes={notes}
        onAddNote={(note) => setNotes(prev => [note, ...prev])}
        onDeleteNote={(id) => setNotes(prev => prev.filter(n => n.id !== id))}
        onClearNotes={() => setNotes([])}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Hands-free Voice Call Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onUserSpoke={(text) => handleSendMessage(text)}
        isAgentThinking={isGenerating}
        persona={currentPersona}
      />

      {/* Interactive Code Execution Sandbox Modal */}
      <CodeRunnerModal
        isOpen={codeRunnerState.isOpen}
        onClose={() => setCodeRunnerState(prev => ({ ...prev, isOpen: false }))}
        initialCode={codeRunnerState.code}
        initialLang={codeRunnerState.lang}
      />
    </div>
  );
}
