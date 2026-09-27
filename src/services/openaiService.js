// OpenAI and Ollama/Compatible API streaming service

export async function callOpenAIStream({
  apiKey,
  baseUrl = 'https://api.openai.com/v1',
  model = 'gpt-4o-mini',
  messages,
  persona = 'general',
  attachments = [],
  onChunk,
  signal
}) {
  const effectiveUrl = (baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl) + '/chat/completions';

  let systemInstructionText = `You are an elite, light, clean AI Agent for coding, study, and problem solving.
Always format mathematical and scientific formulas in clean LaTeX notation using $inline$ and $$display$$ math blocks.
When writing code, use fenced code blocks with language tags like \`\`\`python, \`\`\`javascript, etc.
Be concise, clear, and friendly. Support Hindi, Hinglish, and English naturally.`;

  if (persona === 'coding') {
    systemInstructionText += `\nRole: Senior Coding Mentor. Provide clean, production-ready code with complexity analysis and edge cases.`;
  } else if (persona === 'math') {
    systemInstructionText += `\nRole: Mathematics and Science Problem Solver. Provide step-by-step proofs, formulas, and derivations.`;
  } else if (persona === 'study') {
    systemInstructionText += `\nRole: Academic Study Tutor. Explain concepts simply with intuitive analogies, summaries, and review questions.`;
  }

  const formattedMessages = [
    { role: 'system', content: systemInstructionText }
  ];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    let content = msg.content || '';

    // Append attachments to user message if present
    if (i === messages.length - 1 && attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (!att.isImage && att.content) {
          content += `\n\n--- Attached File: ${att.name} ---\n${att.content}\n--- End Attached File ---`;
        }
      }
    }

    formattedMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content
    });
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(effectiveUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature: 0.7,
      stream: true,
    }),
    signal
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(`OpenAI API Error (${response.status}): ${errorDetail}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const dataStr = trimmed.slice(6);
      if (dataStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(dataStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          if (onChunk) onChunk(fullText, delta);
        }
      } catch {
        // chunk partial
      }
    }
  }

  return fullText;
}
