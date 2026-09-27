// Google Gemini API integration with streaming, persona support, and auto-fallback
const FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];

export async function callGeminiStream({
  apiKey,
  model = 'gemini-3.5-flash-lite',
  messages,
  persona = 'general',
  attachments = [],
  onChunk,
  signal
}) {
  if (!apiKey) {
    throw new Error('Gemini API key is required. Please set it in Settings.');
  }

  // Auto-upgrade legacy deprecated models
  let activeModel = model;
  if (
    activeModel === 'gemini-2.0-flash' ||
    activeModel === 'gemini-2.5-flash' ||
    activeModel === 'gemini-1.5-flash' ||
    activeModel === 'gemini-1.5-pro'
  ) {
    activeModel = 'gemini-3.5-flash-lite';
  }

  // System instructions depending on active persona
  let systemInstructionText = `You are Nexus, a high-performance, clean, and helpful AI assistant.
Keep your responses structured, clear, and direct.
When writing mathematical or scientific formulas, ALWAYS format math using standard LaTeX notation:
Use single dollar signs for inline math like $E = mc^2$ or $\\frac{a}{b}$.
Use double dollar signs on separate lines for display math blocks like:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
When writing code, always specify the language in markdown code blocks like \`\`\`python or \`\`\`javascript, and write clean, readable code with comments.
Support questions in English, Hindi, and Hinglish naturally.`;

  if (persona === 'coding') {
    systemInstructionText += `\nYou are in CODING MENTOR mode. Focus on clean architecture, optimal algorithmic time/space complexity, edge cases, bug prevention, and readable code. Always explain non-obvious logic.`;
  } else if (persona === 'math') {
    systemInstructionText += `\nYou are in MATH & SCIENCE SOLVER mode. Provide detailed step-by-step derivations, explicitly state formulas and theorems, define variables, and highlight the final answer.`;
  } else if (persona === 'study') {
    systemInstructionText += `\nYou are in STUDY TUTOR mode. Break down complex topics into simple intuitive concepts, use everyday analogies, create summary checklists, and provide key review questions.`;
  }

  // Convert conversation messages to Gemini format
  const contents = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role === 'user' ? 'user' : 'model';
    const parts = [];

    // Text content
    if (msg.content) {
      parts.push({ text: msg.content });
    }

    // Attachments for the last user message
    if (i === messages.length - 1 && attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.isImage && att.base64) {
          parts.push({
            inlineData: {
              mimeType: att.type || 'image/jpeg',
              data: att.base64.split(',')[1] || att.base64
            }
          });
        } else if (att.content) {
          parts.push({
            text: `\n\n--- Attached File: ${att.name} ---\n${att.content}\n--- End Attached File ---\n`
          });
        }
      }
    }

    if (parts.length > 0) {
      contents.push({ role, parts });
    }
  }

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  };

  const candidateModels = [
    activeModel,
    ...FALLBACK_MODELS.filter(m => m !== activeModel)
  ];

  let lastError = null;

  for (let attempt = 0; attempt < candidateModels.length; attempt++) {
    const currentModel = candidateModels[attempt];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      continue;
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errJson = await response.json();
        errorDetail = errJson.error?.message || response.statusText;
      } catch {
        errorDetail = response.statusText;
      }

      // If 404 (model deprecated / not found) or 503 (high demand) and more candidates exist, try fallback
      if (
        (response.status === 404 ||
          response.status === 503 ||
          errorDetail.includes('no longer available') ||
          errorDetail.includes('high demand')) &&
        attempt < candidateModels.length - 1
      ) {
        console.warn(`Model ${currentModel} returned ${response.status} (${errorDetail}), trying fallback model ${candidateModels[attempt + 1]}...`);
        lastError = new Error(`Gemini API Error (${response.status}): ${errorDetail}`);
        continue;
      }

      throw new Error(`Gemini API Error (${response.status}): ${errorDetail}`);
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
          const candidates = parsed.candidates;
          if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
              if (part.text) {
                fullText += part.text;
                if (onChunk) onChunk(fullText, part.text);
              }
            }
          }
        } catch {
          // incomplete json chunk
        }
      }
    }

    return fullText;
  }

  if (lastError) throw lastError;
  return '';
}
