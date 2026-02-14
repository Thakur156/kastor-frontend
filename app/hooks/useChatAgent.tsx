import { useState, useRef } from "react";
import { getCookie, removeCookie } from "typescript-cookie";
import { v4 as uuidv4 } from "uuid";
import { parseAgentContent, AnalysisEvent } from "~/utils/parseAgentChunks";
import { TableRow } from "~/components/analyst/catalog-tables";

declare global {
  interface Window {
    ENV: {
      BASE_API_URL: string;
    };
  }
}

interface ChartMeta {
  type: "SimpleLineChart" | "BarChart" | "AreaChart";
  [key: string]: unknown;
}

interface SSEFinalData {
  data: unknown[];
  data_type: "table" | "chart";
  chart_details?: { chart_title?: string };
  chart_meta?: unknown;
}

interface SSEPayload {
  content?: string;
  final_data?: SSEFinalData;
}

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  type?: "error" | "thinking" | "table" | "chart" | "system" | "text";
  request_id: string;
  feedback?: number;
  tableData?: TableRow[];
  chartMeta?: ChartMeta;
  chartData?: TableRow[];
  analysisEvents?: AnalysisEvent[];
  hasAnalysis?: boolean;
}

export function useChatAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ─── 1) sendMessage ───────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim()) return;

    const request_id = uuidv4();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input, request_id },
    ]);
    setInput("");
    setLoading(true);

    const thinkingId = uuidv4();
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        content: "Thinking...",
        type: "thinking",
        request_id: thinkingId,
        feedback: 0,
      },
    ]);

    abortControllerRef.current = new AbortController();
    try {
      const idToken = getCookie("idToken");
      if (!idToken) throw new Error("Authentication token not found!");

      const res = await fetch(
        `${window.ENV.BASE_API_URL}/agents/chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: input, request_id }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          removeCookie("idToken");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buffer = "";
      let done = false;

      let responseText = "";
      const analysisEvents: AnalysisEvent[] = [];

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        buffer += dec.decode(value, { stream: true });

        // process complete SSE "data:" events delimited by "\n\n"
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const eventStr = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);

          if (!eventStr.startsWith("data:")) continue;
          const jsonText = eventStr.slice(5).trim();

          let payload: SSEPayload;
          try {
            payload = JSON.parse(jsonText) as SSEPayload;
          } catch (e: unknown) {
            // retry if it's simply truncated JSON
            if (
              e instanceof SyntaxError &&
              /Unexpected end/.test(e.message)
            ) {
              buffer = eventStr + "\n\n" + buffer;
              break;
            }
            console.warn("Skipping malformed JSON chunk:", e);
            continue;
          }

          // extract only the fields we trust
          const content = typeof payload.content === "string"
            ? payload.content
            : undefined;
          const final_data = payload.final_data;

          // parse analysis events + text
          if (content) {
            const { responseText: chunkText, analysisEvents: chunkEvents } =
              parseAgentContent(content);

            if (chunkEvents.length) {
              analysisEvents.push(...chunkEvents);
            }
            if (chunkText) {
              responseText += (responseText ? " " : "") + chunkText;
            }

            // update our "thinking" in-flight
            setMessages((prev) => {
              const copy = [...prev];
              const i = copy.findIndex((m) => m.type === "thinking");
              if (i > -1) {
                copy[i] = {
                  ...copy[i],
                  content: responseText,
                  analysisEvents,
                  hasAnalysis: analysisEvents.length > 0,
                };
              }
              return copy;
            });
          }

          // handle final_data (tables / charts)
          if (final_data?.data != null) {
            setMessages((prev) => [
              ...prev,
              {
                role: "bot",
                content:
                  final_data.chart_details?.chart_title || "Data",
                request_id,
                type: final_data.data_type,
                tableData:
                  final_data.data_type === "table"
                    ? (final_data.data as TableRow[])
                    : undefined,
                chartMeta:
                  final_data.data_type === "chart"
                    ? (final_data.chart_meta as ChartMeta)
                    : undefined,
                chartData:
                  final_data.data_type === "chart"
                    ? (final_data.data as TableRow[])
                    : undefined,
                feedback: 0,
              },
            ]);
          }
        }
      }

      // finalize the "thinking" placeholder
      setMessages((prev) => {
        const copy = [...prev];
        const i = copy.findIndex((m) => m.type === "thinking");
        if (i > -1) {
          copy[i] = {
            ...copy[i],
            role: "bot",
            type: "text",
            content: responseText || "No response from server.",
            analysisEvents,
            hasAnalysis: analysisEvents.length > 0,
          };
        }
        return copy;
      });

      setLoading(false);
    } catch (err: unknown) {
      // safely extract message
      const message =
        err instanceof Error ? err.message : String(err);
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "thinking"),
        {
          role: "bot",
          content: message,
          type: "error",
          request_id: uuidv4(),
          feedback: 0,
        },
      ]);
      setLoading(false);
    }
  };

  // ─── 2) cancelRequest ─────────────────────────────────────────────────────
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "thinking"),
        {
          role: "bot",
          content: "Request cancelled.",
          request_id: uuidv4(),
          feedback: 0,
        },
      ]);
    }
  };

  // ─── 3) sendFeedback ──────────────────────────────────────────────────────
  const sendFeedback = async (index: number, value: number) => {
    const copy = [...messages];
    const msg = copy[index];
    if (!msg || msg.role !== "bot") return;

    const original = msg.feedback ?? 0;
    const next = original === value ? 0 : value;
    copy[index].feedback = next;
    setMessages(copy);

    try {
      const idToken = getCookie("idToken");
      if (!idToken) throw new Error("Authentication token not found!");

      const res = await fetch(
        `${window.ENV.BASE_API_URL}/agents/feedback`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback: next, query: msg.content }),
        }
      );
      if (!res.ok) throw new Error("Failed to send feedback");
    } catch (err: unknown) {
      console.error("Feedback error:", err);
      // rollback
      copy[index].feedback = original;
      setMessages(copy);
    }
  };

  return {
    messages,
    loading,
    input,
    setInput,
    sendMessage,
    cancelRequest,
    sendFeedback,
  };
}
