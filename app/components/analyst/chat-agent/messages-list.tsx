import React, { useEffect } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

import AnalysisSteps from "./analysis-steps";
import TableComponent from "~/routes/_analyst+/chat+/TableComponent";
import LineChartComponent from "~/routes/_analyst+/chat+/LineChartComponent";
import BarChartComponent from "~/routes/_analyst+/chat+/BarChartComponent";
import AreaChartComponent from "~/routes/_analyst+/chat+/AreaChartComponent";
import SQLEditor from "./sql-editor";
import { TableRow } from "../catalog-tables";

/* ── helpers (exported) ───────────────────────────────────────────────── */

export const containsMarkdownTable = (text: string | undefined): boolean => {
  if (!text) return false;
  const rows = (text.match(/\|.*\|/g) || []).length;
  return rows >= 3 && text.includes("\n|");
};

export const parseMarkdownTable = (
  txt: string,
): { tableData: Record<string, string>[]; columns: { key: string; title: string }[]; raw: string } | null => {
  const lines = txt.match(/\|.*\|/gm);
  if (!lines || lines.length < 3) return null;

  const header = lines[0]
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  const tableData = lines.slice(2).map((row) => {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    return header.reduce<Record<string, string>>((obj, h, idx) => {
      obj[h] = cells[idx] ?? "";
      return obj;
    }, {});
  });

  return {
    tableData,
    columns: header.map((h) => ({ key: h, title: h })),
    raw: lines.join("\n"),
  };
};

/* ── chart types ──────────────────────────────────────────────────────── */

interface ChartMeta {
  type: "SimpleLineChart" | "BarChart" | "AreaChart";
  [key: string]: unknown;
}

/* ── message types ────────────────────────────────────────────────────── */

export interface ChatMessage {
  role: "user" | "bot" | "system";
  type?: "error" | "thinking" | "table" | "chart" | "system" | "text";
  content: string;
  request_id?: string;
  feedback?: number;

  /* optional blobs for special message types */
  tableData?: TableRow[];
  chartData?: TableRow[];
  chartMeta?: ChartMeta;

  /* chain-of-thought */
  hasAnalysis?: boolean;
  analysisEvents?: { type: string; content: string }[];
}

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sendFeedback: (index: number, value: number) => void;
}

/* ── main list component ──────────────────────────────────────────────── */

const MessageList: React.FC<Props> = ({
  messages,
  loading,
  messagesEndRef,
  sendFeedback,
}) => {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, messagesEndRef]);

  return (
    <div className="flex-1 overflow-y-auto pl-4 pt-4 space-y-4 bg-white">
      {messages.length === 0 && !loading && (
        <div className="text-gray-500 text-center italic">
          How can I help you with your data today?
        </div>
      )}

      {messages.map((m, idx) => (
        <Message
          key={m.request_id ?? idx}
          message={m}
          index={idx}
          sendFeedback={sendFeedback}
        />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

/* ── single message component ─────────────────────────────────────────── */

const Message: React.FC<{
  message: ChatMessage;
  index: number;
  sendFeedback: (index: number, value: number) => void;
}> = ({ message, index, sendFeedback }) => {
  /* ----- strip annoying prefixes ------------------------------------- */
  const content = message.content.replace(
    /^\s*(Run\s*started|RunStarted|Processing\s*started)[^A-Za-z0-9]*/i,
    "",
  );

  /* ----- CSS classes -------------------------------------------------- */
  const container =
    message.type === "error"
      ? "bg-red-50 text-red-800 border border-red-200"
      : message.type === "thinking"
      ? "bg-white text-gray-800"
      : message.role === "user"
      ? "bg-gray-100 text-gray-800 self-end ml-auto max-w-[75%]"
      : "bg-white text-gray-800 border-l-2 border-black pl-2";

  /* ----- helper renders ---------------------------------------------- */
  const Pre = ({ children }: { children: string }) => (
    <pre className="bg-gray-50 text-sm font-mono whitespace-pre-wrap px-4 py-3 rounded-md border border-gray-200 my-2">
      {children}
    </pre>
  );

  const TableOrText = (txt: string, key: string) => {
    const parsed = parseMarkdownTable(txt);
    if (!parsed) {
      return (
        <div key={key} className="whitespace-pre-wrap break-words">
          {txt}
        </div>
      );
    }
    const [before, after] = txt.split(parsed.raw);
    return (
      <div key={key}>
        {before && (
          <div className="whitespace-pre-wrap break-words">{before}</div>
        )}
        <TableComponent data={parsed.tableData} />
        {after && (
          <div className="whitespace-pre-wrap break-words">{after}</div>
        )}
      </div>
    );
  };

  const renderWithFences = (txt: string) => {
    const regex = /```[ \t]*([\w+-]*)[^\S\n]*\n?([\s\S]*?)```/gim;
    const nodes: React.ReactNode[] = [];

    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = regex.exec(txt)) !== null) {
      const [full, langRaw, code] = m;
      const start = m.index ?? 0;

      /* prepend plain chunk */
      if (start > last) {
        const chunk = txt.slice(last, start);
        nodes.push(
          containsMarkdownTable(chunk)
            ? TableOrText(chunk, `chunk-${start}`)
            : (
              <div
                key={`chunk-${start}`}
                className="whitespace-pre-wrap break-words"
              >
                {chunk}
              </div>
            ),
        );
      }

      /* fenced code */
      const lang = (langRaw || "").trim().toLowerCase();
      nodes.push(
        lang === "sql"
          ? <SQLEditor key={`sql-${start}`} query={code.trim()} />
          : <Pre key={`pre-${start}`}>{code.trim()}</Pre>,
      );

      last = start + full.length;
    }

    /* tail */
    if (last < txt.length) {
      const tail = txt.slice(last);
      nodes.push(
        containsMarkdownTable(tail)
          ? TableOrText(tail, "tail")
          : (
            <div key="tail" className="whitespace-pre-wrap break-words">
              {tail}
            </div>
          ),
      );
    }

    return nodes;
  };

  /* ----- special cases ----------------------------------------------- */
  if (message.type === "system") {
    return (
      <div className="text-gray-500 text-sm italic text-center py-2 flex gap-2 items-center justify-center">
        <span className="text-lg">⚙️</span>
        <span>{content}</span>
      </div>
    );
  }

  if (message.type === "thinking") {
    return (
      <div className={`p-3 rounded-lg ${container}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin h-4 w-4" />
          <span>{content}</span>
        </div>
      </div>
    );
  }

  /* ----- regular render ---------------------------------------------- */
  return (
    <div className={`p-3 rounded-lg relative ${container}`}>
      {message.hasAnalysis && message.analysisEvents?.length && (
        <AnalysisSteps events={message.analysisEvents} />
      )}

      {renderWithFences(content)}

      {/* specialised types */}
      {message.type === "table" && message.tableData && (
        <div className="overflow-auto border rounded-md shadow mt-2">
          <TableComponent data={message.tableData} />
        </div>
      )}

      {message.type === "chart" && message.chartData && (
        <>
          {message.chartMeta?.type === "SimpleLineChart" && (
            <LineChartComponent
              data={message.chartData}
              chartMeta={message.chartMeta}
            />
          )}
          {message.chartMeta?.type === "BarChart" && (
            <BarChartComponent
              data={message.chartData}
              chartMeta={message.chartMeta}
            />
          )}
          {message.chartMeta?.type === "AreaChart" && (
            <AreaChartComponent
              data={message.chartData}
              chartMeta={message.chartMeta}
            />
          )}
        </>
      )}

      {/* thumbs feedback */}
      {message.role === "bot" && (
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={() => sendFeedback(index, 1)}>
            <ThumbsUp
              size={18}
              className={`cursor-pointer ${
                message.feedback === 1 ? "text-black" : "text-gray-400"
              } hover:text-black transition`}
            />
          </button>
          <button onClick={() => sendFeedback(index, -1)}>
            <ThumbsDown
              size={18}
              className={`cursor-pointer ${
                message.feedback === -1 ? "text-black" : "text-gray-400"
              } hover:text-black transition`}
            />
          </button>
        </div>
      )}
    </div>
  );
};
