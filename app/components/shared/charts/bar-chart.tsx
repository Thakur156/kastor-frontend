import {
  Bar,
  Cell,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatNumber,
  CustomTooltip,
  CustomXAxisTick,
  CustomLegend,
  createColorMap,
  calculateDynamicInterval,
  calculateEquidistantTicks,
  calculateStackedMaxValue,
} from "./chart-func";

interface ChartDataItem {
  name: string;
  [key: string]: number | string;
}

interface BarChartProps {
  commonProps: Record<string, unknown>;
  dataKeys: string[]; // Array of data keys for stacking
  handleBarClick: (
    data: ChartDataItem,
    index: number,
    dataKey: string
  ) => void;
  minDataValue: number;
  maxDataValue?: number; // Make maxDataValue optional to override if stacked
  groupedData: ChartDataItem[];
  variant: string;
}

const CustomBarChart = ({
  commonProps,
  dataKeys,
  minDataValue,
  maxDataValue,
  groupedData,
  handleBarClick,
  variant,
}: BarChartProps) => {
  // Calculate color map dynamically
  const colorMap = createColorMap(dataKeys);

  // Calculate maxDataValue for stacked variant if needed
  const adjustedMaxDataValue =
    variant === "stacked"
      ? Math.floor(calculateStackedMaxValue(dataKeys, groupedData) * 1.2)
      : maxDataValue;

  // Dynamically calculate interval and ticks based on adjusted max value
  const interval = calculateDynamicInterval(minDataValue, adjustedMaxDataValue);
  const yAxisTicks = calculateEquidistantTicks(
    minDataValue,
    adjustedMaxDataValue,
    interval
  );

  // Add colors to the legend payload
  const legendPayload = dataKeys.map((key) => ({
    value: key,
    color: colorMap[key],
    type: "square",
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart {...commonProps} data={groupedData}>
        <XAxis
          dataKey="name"
          tick={<CustomXAxisTick />}
          height={50}
          interval="equidistantPreserveStart"
        />
        <YAxis
          domain={[minDataValue, adjustedMaxDataValue]}
          width={80}
          tickFormatter={formatNumber}
          ticks={yAxisTicks}
          fontSize={10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          content={<CustomLegend payload={legendPayload} colorMap={colorMap} />}
        />

        {variant === "" ? (
          <Bar dataKey={dataKeys[0]} fill={colorMap[dataKeys[0]]}>
            {groupedData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={colorMap[dataKeys[0]]}
                onClick={() =>
                  handleBarClick(entry, idx, dataKeys[0])
                }
              />
            ))}
          </Bar>
        ) : (
          dataKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={variant === "stacked" ? "1" : undefined}
            >
              {groupedData.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={colorMap[key]}
                  onClick={() => handleBarClick(entry, idx, key)}
                />
              ))}
            </Bar>
          ))
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
