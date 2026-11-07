/**
 * Utilities for cleaning and formatting text in the Railway Passenger Help Desk.
 */

/**
 * Converts markdown-formatted text into clean, human-readable plain text
 * suitable for copying to the clipboard, without raw markdown symbols like **, *, ###, etc.
 */
export function stripMarkdownForCopy(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // 1. Remove code blocks markers, preserve code content
  text = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, '$1');

  // 2. Remove inline code backticks
  text = text.replace(/`([^`]+)`/g, '$1');

  // 3. Remove bold and italic markers with asterisks (***text***, **text**, *text*)
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');

  // 4. Remove standalone underscore bold/italic (preserving snake_case words like POL_REFUND_02)
  text = text.replace(/(^|\s)___([^_]+)___(?=\s|$|[.,!?;:])/g, '$1$2');
  text = text.replace(/(^|\s)__([^_]+)__(?=\s|$|[.,!?;:])/g, '$1$2');
  text = text.replace(/(^|\s)_([^_]+)_(?=\s|$|[.,!?;:])/g, '$1$2');

  // 5. Remove headers (# Header, ## Header, etc.)
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');

  // 6. Convert markdown links [Text](url) -> Text (url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // 7. Clean blockquotes
  text = text.replace(/^>\s+(.+)$/gm, '$1');

  // 8. Standardize bullet points (* or - to clean • )
  text = text.replace(/^[\*\-]\s+(.+)$/gm, '• $1');

  // 9. Clean horizontal rules (---, ***, ___)
  text = text.replace(/^(?:---|___)\s*$/gm, '');

  // 10. Trim excess empty lines (max 2 consecutive newlines)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
