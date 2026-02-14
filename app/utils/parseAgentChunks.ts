export interface AnalysisEvent {
  type: string;
  content: string;
}

export interface ParseResult {
  responseText: string;
  analysisEvents: AnalysisEvent[];
}

/**
 * Parse a raw SSE‐chunk payload, extracting all **Event:** markers
 * into a structured list and pulling out any free text as responseText.
 */
export function parseAgentContent(raw: string): ParseResult {
  const analysisEvents: AnalysisEvent[] = [];
  let responseText = "";
  let lastIdx = 0;

  // Match **Event: Type** content until next **Event:** or end of string
  const eventRegex = /\*\*Event:\s*([A-Za-z]+)\*\*\s*(.*?)(?=(?:\*\*Event:)|$)/gs;
  let match: RegExpExecArray | null;

  while ((match = eventRegex.exec(raw)) !== null) {
    const [, eventType, eventContent] = match;
    const content = eventContent.trim();

    if (eventType === "RunStarted" && content) {
      const parts = content.match(/^([^a-zA-Z]*)(.*)$/s);
      if (parts) {
        // append the “real” text to responseText
        if (parts[2]) {
          responseText += (responseText ? " " : "") + parts[2].trim();
        }
        analysisEvents.push({
          type: eventType,
          content: parts[1].trim(),
        });
      } else {
        analysisEvents.push({ type: eventType, content });
      }
    } else {
      analysisEvents.push({ type: eventType, content });
    }

    lastIdx = match.index + match[0].length;
  }

  const remainder = raw.slice(lastIdx).trim();
  if (remainder) {
    responseText += (responseText ? " " : "") + remainder;
  }

  return { responseText, analysisEvents };
}
