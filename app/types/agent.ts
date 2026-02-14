export interface AgentOutput {
  prompt: string;
  response: string;
  derivedSQL?: string;
  chartConfig?: object;
  explanation?: string;
}
