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

interface AxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

interface BarChartProps {
  commonProps: Record<string, unknown>;
  dataKeys: string[];
  handleBarClick: (
    data: ChartDataItem,
    index: number,
    dataKey: string
  ) => void;
  minDataValue: number;
  maxDataValue: number;
  groupedData: ChartDataItem[];
  variant?: string;
}

const CustomXAxisTick = (props: AxisTickProps) => {
  const { x = 0, y = 0, payload } = props;

  const text = payload?.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={-12} dy={16} textAnchor="end" fill="#666" fontSize={10}>
        {text}
      </text>
    </g>
  );
};

const HorizontalBarChart = ({
  commonProps,
  dataKeys,
  minDataValue,
  maxDataValue,
  groupedData,
  handleBarClick,
  variant = "stacked",
}: BarChartProps) => {
  // Create the colorMap dynamically
  const colorMap = createColorMap(dataKeys);

  // Add colors to the legend payload
  const legendPayload = dataKeys.map((key) => ({
    value: key,
    color: colorMap[key],
  }));

  // Calculate maxDataValue for stacked variant if needed
  const adjustedMaxDataValue =
    variant === "stacked"
      ? Math.floor(calculateStackedMaxValue(dataKeys, groupedData) * 1.2)
      : maxDataValue;

  const interval = calculateDynamicInterval(minDataValue, adjustedMaxDataValue);
  const yAxisTicks = calculateEquidistantTicks(
    minDataValue,
    adjustedMaxDataValue,
    interval
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart layout="vertical" {...commonProps}>
        <YAxis
          height={50}
          dataKey={"name"}
          interval="equidistantPreserveStart"
          tick={<CustomXAxisTick />}
          type="category"
        />

        <XAxis
          width={80}
          domain={[minDataValue, maxDataValue]}
          type="number"
          ticks={yAxisTicks}
          tickFormatter={formatNumber}
          fontSize={10}
        />
        <Tooltip content={<CustomTooltip />} />

        <Legend
          content={<CustomLegend payload={legendPayload} colorMap={colorMap} />}
        />

        {variant === "" ? (
          // Render simple bars if more than one key and not stacked
          <Bar dataKey={dataKeys[0]}>
            {groupedData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={colorMap[dataKeys[0]]}
                onClick={() => handleBarClick(entry, idx, dataKeys[0])}
              />
            ))}
          </Bar>
        ) : (
          dataKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              {...(variant === "stacked" ? { stackId: "1" } : {})}
            >
              {groupedData.map((entry, idx) => {
                const fillColor = colorMap[key]; // Get the color from the colorMap

                return (
                  <Cell
                    key={`cell-${idx}`}
                    fill={fillColor}
                    onClick={() => handleBarClick(entry, idx, key)}
                  />
                );
              })}
            </Bar>
          ))
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default HorizontalBarChart;
