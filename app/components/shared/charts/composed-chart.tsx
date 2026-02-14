import {
  Bar,
  Line,
  Cell,
  ComposedChart,
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
} from "./chart-func";

interface ChartDataItem {
  name: string;
  [key: string]: number | string;
}

interface ComposedChartProps {
  commonProps: Record<string, unknown>;
  dataKeys: string[];
  lineDataKey?: string;
  areaDataKey?: string;
  handleBarClick: (
    data: ChartDataItem,
    index: number,
    dataKey: string
  ) => void;
  minDataValue: number;
  maxDataValue: number;
  groupedData: ChartDataItem[];
  variant: string;
}

const CustomComposedChart = ({
  commonProps,
  dataKeys,
  lineDataKey,
  groupedData,
  handleBarClick,
  variant,
}: ComposedChartProps) => {
  // Create the colorMap dynamically
  const colorMap = createColorMap(dataKeys);

  // Add colors to the legend payload
  const legendPayload = dataKeys.map((key) => ({
    value: key,
    color: colorMap[key],
  }));

  const calculateTicksForBar = () => {
    const barKey = dataKeys[0];
    const barMax = groupedData.reduce((max, entry) => {
      const value = Number(entry[barKey]) || 0;
      return Math.max(max, value);
    }, -Infinity);

    const barInterval = calculateDynamicInterval(0, Math.ceil(barMax * 1.1));
    const barticks = calculateEquidistantTicks(
      0,
      Math.ceil(barMax * 1.1),
      barInterval
    );

    return barticks;
  };

  // Find the min and max values of lineKey from the grouped data
  const calculateTicksForLine = () => {
    const lineDataKey = dataKeys[1];

    if (!lineDataKey) return [];
    let lineMax = -Infinity;
    groupedData.forEach((item) => {
      const value = Number(item[lineDataKey]) || 0;
      if (value > lineMax) lineMax = value;
    });

    const lineInterval = calculateDynamicInterval(0, Math.ceil(lineMax * 1.1));
    const lineTicks = calculateEquidistantTicks(
      0,
      Math.ceil(lineMax * 1.1),
      lineInterval
    );

    return lineTicks;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart {...commonProps}>
        <XAxis
          interval="equidistantPreserveStart"
          dataKey="name"
          tick={<CustomXAxisTick />}
          height={50}
        />

        {/* First Y-axis on the left */}
        <YAxis
          yAxisId="left"
          width={80}
          tickFormatter={formatNumber}
          ticks={calculateTicksForBar()}
          interval="equidistantPreserveStart"
          fontSize={10}
        />

        {/* Second Y-axis on the right */}
        {lineDataKey && (
          <YAxis
            yAxisId="right"
            orientation="right"
            width={80}
            tickFormatter={formatNumber}
            ticks={calculateTicksForLine()}
            interval="equidistantPreserveStart"
            fontSize={10}
          />
        )}

        <Tooltip content={<CustomTooltip />} />

        <Legend
          content={<CustomLegend payload={legendPayload} colorMap={colorMap} />}
        />

        {dataKeys.map((key, i) => (
          <div key={key}>
            {i % 2 === 0 ? (
              <Bar
                dataKey={key}
                yAxisId="left" // Match this with the left Y-axis
                {...(variant === "stacked" ? { stackId: "1" } : {})}
              >
                {groupedData.map((entry, idx) => {
                  const fillColor = colorMap[key];
                  return (
                    <Cell
                      key={`cell-${idx}`}
                      fill={fillColor}
                      onClick={() => handleBarClick(entry, idx, key)}
                    />
                  );
                })}
              </Bar>
            ) : (
              <Line
                dataKey={key}
                yAxisId="right" // Match this with the right Y-axis
                type="monotone"
                stroke={colorMap[key]} // Different color for line
                dot={false}
              />
            )}
          </div>
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CustomComposedChart;
