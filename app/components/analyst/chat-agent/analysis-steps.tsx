import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import TableComponent from "~/routes/_analyst+/chat+/TableComponent";
import SQLEditor from "./sql-editor";

const containsMarkdownTable = (text = ""): boolean => {
  const lines = (text.match(/\|.*\|/g) || []).length;
  return lines >= 3 && text.includes("\n|");
};

const parseMarkdownTable = (txt: string) => {
  const rows = txt.match(/\|.*\|/gm);
  if (!rows || rows.length < 3) return null;

  const header = rows[0]
    .split("|").map((c) => c.trim()).filter(Boolean);

  const data = rows.slice(2).map((line) => {
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    return header.reduce<Record<string, string>>((obj, h, i) => {
      obj[h] = cells[i] ?? "";
      return obj;
    }, {});
  });

  return { raw: rows.join("\n"), header, data };
};

/* parser that understands code fences (with or without closing ```) */
const renderRichText = (txt: string, keyPrefix = "step") => {
  const blocks: React.ReactNode[] = [];
  const regex = /```[ \t]*([\w+-]*)[^\S\n]*\n?([\s\S]*?)```/gim;

  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(txt)) !== null) {
    const [full, langRaw, code] = m;
    const start = m.index ?? 0;

    if (start > last) {
      const chunk = txt.slice(last, start);
      blocks.push(
        containsMarkdownTable(chunk)
          ? renderTable(chunk, `${keyPrefix}-${start}`)
          : <div key={`${keyPrefix}-txt-${start}`} className="whitespace-pre-wrap break-words">{chunk}</div>
      );
    }

    const lang = (langRaw || "").trim().toLowerCase();
    blocks.push(
      lang === "sql"
        ? <SQLEditor key={`${keyPrefix}-sql-${start}`} query={code.trim()} />
        : <pre key={`${keyPrefix}-pre-${start}`} className="bg-gray-50 text-sm font-mono whitespace-pre-wrap px-4 py-3 rounded-md border">{code.trim()}</pre>
    );

    last = start + full.length;
  }

  if (last < txt.length) {
    const tail = txt.slice(last);
    blocks.push(
      containsMarkdownTable(tail)
        ? renderTable(tail, `${keyPrefix}-tail`)
        : <div key={`${keyPrefix}-tail`} className="whitespace-pre-wrap break-words">{tail}</div>
    );
  }

  return blocks;
};

const renderTable = (txt: string, key: string) => {
  const parsed = parseMarkdownTable(txt);
  if (!parsed) return <div key={key} className="whitespace-pre-wrap break-words">{txt}</div>;

  const [before, after] = txt.split(parsed.raw);
  return (
    <div key={key}>
      {before && <div className="whitespace-pre-wrap break-words">{before}</div>}
      <TableComponent data={parsed.data} />
      {after  && <div className="whitespace-pre-wrap break-words">{after}</div>}
    </div>
  );
};

/* ---------- component -------------------------------------------------- */

export interface AnalysisEvent {
  type: string;
  content: string;
}

interface Props {
  events: AnalysisEvent[];
}

const AnalysisSteps: React.FC<Props> = ({ events }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-lg mb-3">
      {/* header */}
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-sm font-medium"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Analysis Steps
      </button>

      {/* body */}
      {open && (
        <div className="px-4 py-3 space-y-3 text-sm text-gray-800">
          {events.map((ev, i) => (
            <div key={i}>{renderRichText(ev.content, `ev-${i}`)}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisSteps;
