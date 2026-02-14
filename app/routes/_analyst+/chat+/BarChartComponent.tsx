import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatNumber } from "~/components/shared/charts/chart-func";

interface ChartMeta {
  "x-axis": string;
  "data-key": string[];
}

interface ChartDataItem {
  [key: string]: string | number;
}

const BarChartComponent = ({
  chartMeta,
  data,
}: {
  chartMeta: ChartMeta;
  data: ChartDataItem[];
}) => {
  if (!chartMeta || !data || data.length === 0) return null;

  return (
    <div className="w-full h-64 bg-white border rounded-md shadow-md p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey={chartMeta["x-axis"]} />
          <YAxis tickFormatter={formatNumber} />
          <Tooltip />
          <Legend />
          {chartMeta["data-key"].map((key: string, index: number) => (
            <Bar
              key={index}
              dataKey={key}
              fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"}
              name={key}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
