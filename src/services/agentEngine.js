// Agent Dispatcher Engine: orchestrates Gemini, OpenAI, and offline local knowledge

import { callGeminiStream } from './geminiService';
import { callOpenAIStream } from './openaiService';
import { generateLocalAgentResponse } from './localKnowledge';

export async function dispatchAgentResponse({
  messages,
  settings,
  persona = 'general',
  attachments = [],
  onChunk,
  signal
}) {
  const provider = settings?.provider || 'gemini';
  const hasGeminiKey = Boolean(settings?.geminiApiKey && settings.geminiApiKey.trim());
  const hasOpenAIKey = Boolean(settings?.openaiApiKey && settings.openaiApiKey.trim());

  // 1. Try Google Gemini if configured
  if (provider === 'gemini' && hasGeminiKey) {
    try {
      return await callGeminiStream({
        apiKey: settings.geminiApiKey.trim(),
        model: settings.geminiModel || 'gemini-3.5-flash-lite',
        messages,
        persona,
        attachments,
        onChunk,
        signal
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('Gemini call failed, falling back if possible:', err);
      throw err;
    }
  }

  // 2. Try OpenAI / Ollama if configured
  if (provider === 'openai' && (hasOpenAIKey || settings?.openaiBaseUrl?.includes('localhost'))) {
    try {
      return await callOpenAIStream({
        apiKey: settings.openaiApiKey ? settings.openaiApiKey.trim() : '',
        baseUrl: settings.openaiBaseUrl || 'https://api.openai.com/v1',
        model: settings.openaiModel || 'gpt-4o-mini',
        messages,
        persona,
        attachments,
        onChunk,
        signal
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('OpenAI call failed:', err);
      throw err;
    }
  }

  // 3. Fallback to Local Smart Knowledge Engine with simulated typewriter streaming
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const localResult = generateLocalAgentResponse(lastUserMsg, persona);

  let fullOutput = '';
  if (localResult.thought) {
    fullOutput += `> 💭 **Thought Process**: ${localResult.thought}\n\n`;
  }
  fullOutput += localResult.content;

  // Stream in small realistic chunks
  const chunkSize = 18;
  let streamed = '';

  for (let i = 0; i < fullOutput.length; i += chunkSize) {
    if (signal?.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      throw err;
    }
    const chunk = fullOutput.slice(i, i + chunkSize);
    streamed += chunk;
    if (onChunk) onChunk(streamed, chunk);
    // short delay for typewriter effect
    await new Promise(r => setTimeout(r, 15));
  }

  return streamed;
}
