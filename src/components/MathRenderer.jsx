import React from 'react';
import katex from 'katex';

export default function MathRenderer({ content, className = '' }) {
  if (!content) return null;

  // Split content by display math $$...$$ first, then inline math $...$
  const renderMathAndText = (text) => {
    // Regex matches $$...$$ or $...$ (avoiding double matches)
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    const parts = text.split(mathRegex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto py-2 text-center text-slate-800"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <pre key={index} className="my-2 p-2 bg-slate-100 rounded text-sm text-red-600">
              {math}
            </pre>
          );
        }
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-1 align-baseline text-slate-900"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="text-red-500 font-mono text-sm">${math}$</span>;
        }
      } else {
        // Plain text with inline formatting
        return <span key={index}>{renderInlineMarkdown(part)}</span>;
      }
    });
  };

  // Helper for inline markdown like **bold**, *italic*, `code`, and links
  const renderInlineMarkdown = (rawText) => {
    if (!rawText) return null;

    // Split on inline code `...`
    const codeParts = rawText.split(/(`[^`\n]+`)/g);

    return codeParts.map((subPart, i) => {
      if (subPart.startsWith('`') && subPart.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 text-xs font-mono bg-slate-100 text-slate-800 border border-slate-200/80 rounded"
          >
            {subPart.slice(1, -1)}
          </code>
        );
      }

      // Format bold **...**
      const boldParts = subPart.split(/(\*\*[^*]+?\*\*)/g);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return <strong key={j} className="font-semibold text-slate-900">{bPart.slice(2, -2)}</strong>;
        }
        return bPart;
      });
    });
  };

  return <div className={`leading-relaxed ${className}`}>{renderMathAndText(content)}</div>;
}
