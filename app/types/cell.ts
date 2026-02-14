import { AgentOutput } from "./agent";

interface BaseCell {
  id: string;
  type: "sql" | "chart" | "markdown" | "canvas";
  createdAt: string;
  updatedAt: string;
}

export interface SQLCell extends BaseCell {
  type: "sql";
  query: string;
  execution?: {
    snapshotId?: string;
    executedAt?: string;
    durationMs?: number;
    status?: "success" | "error";
  };
}

export interface ChartCell extends BaseCell {
  type: "chart";
  chartConfig: object;
  dataSourceRef: string;
}

export interface MarkdownCell extends BaseCell {
  type: "markdown";
  content: string;
}

export interface CanvasCell extends BaseCell {
  type: "canvas";
  agentOutput: AgentOutput;
}

export type Cell = SQLCell | ChartCell | MarkdownCell | CanvasCell;
