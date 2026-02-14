import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateDynamicInterval,
  calculateEquidistantTicks,
  colorArray,
  CustomTooltip,
  CustomXAxisTick,
  formatNumber,
  renderColorfulLegendText,
} from "./chart-func";

export interface ChartDataItem {
  name: string;
  [key: string]: number | string;
}

interface CustomLineChartProps {
  commonProps: Record<string, unknown>;
  dataKeys: string[];
  handleBarClick: (
    data: ChartDataItem,
    index: number,
    dataKey: string
  ) => void;
  minDataValue: number;
  maxDataValue: number;
}

const CustomLineChart = ({
  commonProps,
  minDataValue,
  maxDataValue,
  dataKeys,
}: CustomLineChartProps) => {
  const interval = calculateDynamicInterval(minDataValue, maxDataValue);
  const yAxisTicks = calculateEquidistantTicks(
    minDataValue,
    maxDataValue,
    interval
  );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart {...commonProps}>
        <XAxis
          dataKey="name"
          tick={<CustomXAxisTick />}
          height={50}
          interval="equidistantPreserveStart"
        />
        <YAxis
          domain={[minDataValue, maxDataValue]}
          width={80}
          tickFormatter={formatNumber}
          interval="equidistantPreserveStart"
          fontSize={10}
          ticks={yAxisTicks}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={renderColorfulLegendText}
          iconType="circle"
          iconSize={6}
          wrapperStyle={{
            fontSize: "8px",
          }}
        />
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            strokeWidth={2}
            stroke={colorArray[index]}
            dot={{
              stroke: colorArray[index],
            }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
