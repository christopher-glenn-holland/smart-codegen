/* File: /home/cholland/repos/smart-codegen/frontend/src/utils/messageUtils.js */

export const processResponseMessage = (message) => {
  if (!message) return { parts: [] };

  const parts = [];
  const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
  const filePathRegex = /\/\* File: (.*?) \*\//g;

  let lastIndex = 0;
  let match;

  // Extract code blocks
  while ((match = codeRegex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      let textPart = message.substring(lastIndex, match.index).trim();
      // Extract text parts, considering file path within text
      let textMatch;
      while ((textMatch = filePathRegex.exec(textPart)) !== null) {
        const textBeforeFile = textPart.substring(0, textMatch.index).trim();
        if (textBeforeFile) {
          parts.push({ type: 'text', content: textBeforeFile });
        }
        const filePath = textMatch[1].trim();
        const remainingText = textPart.substring(textMatch.index + textMatch[0].length).trim();
        parts.push({ type: 'code', content: `/* File: ${filePath} */\n${remainingText}`, language: 'javascript', filePath });
        textPart = ''; // Reset text part after handling file path
      }
      if (textPart) {
        parts.push({ type: 'text', content: textPart });
      }
    }
    const codeContent = match[2].trim();
    const filePathMatch = filePathRegex.exec(codeContent);
    let filePath = null;
    if (filePathMatch) {
      filePath = filePathMatch[1].trim();
    }
    parts.push({ type: 'code', content: codeContent, language: match[1].trim(), filePath });
    lastIndex = codeRegex.lastIndex;
  }

  // Handle remaining text after the last code block
  if (lastIndex < message.length) {
    let remainingText = message.substring(lastIndex).trim();
    let textMatch;
    while ((textMatch = filePathRegex.exec(remainingText)) !== null) {
      const textBeforeFile = remainingText.substring(0, textMatch.index).trim();
      if (textBeforeFile) {
        parts.push({ type: 'text', content: textBeforeFile });
      }
      const filePath = textMatch[1].trim();
      const remainingContent = remainingText.substring(textMatch.index + textMatch[0].length).trim();
      parts.push({ type: 'code', content: `/* File: ${filePath} */\n${remainingContent}`, language: 'javascript', filePath });
      remainingText = ''; // Reset remaining text after handling file path
    }
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText });
    }
  }

  return { parts };
};
