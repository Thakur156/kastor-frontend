import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  formatNumber,
  CustomTooltip,
  CustomXAxisTick,
  createColorMap,
  CustomLegend,
  calculateDynamicInterval,
  calculateEquidistantTicks,
} from "./chart-func";

interface DataPoint {
  name: string;
  [key: string]: number | string;
}

interface CustomScatterChartProps {
  commonProps: Record<string, unknown>;
  dataKeys: string[];
  handleBarClick: (
    data: DataPoint,
    index: number,
    dataKey: string
  ) => void;
  minDataValue: number;
  maxDataValue: number;
  groupedData: DataPoint[];
  variant: string;
}

const CustomScatterChart = ({
  commonProps,
  dataKeys,
  minDataValue,
  maxDataValue,
  groupedData,
  handleBarClick,
}: CustomScatterChartProps) => {
  const colorMap = useMemo(() => createColorMap(dataKeys), [dataKeys]);

  const legendPayload = useMemo(
    () =>
      dataKeys.map((key) => ({
        value: key,
        color: colorMap[key],
      })),
    [dataKeys, colorMap]
  );

  const interval = calculateDynamicInterval(minDataValue, maxDataValue);
  const yAxisTicks = calculateEquidistantTicks(
    minDataValue,
    maxDataValue,
    interval
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart {...commonProps}>
        <XAxis
          dataKey="name"
          tick={<CustomXAxisTick />}
          height={50}
          range={[100, 250]}
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
          content={<CustomLegend payload={legendPayload} colorMap={colorMap} />}
        />
        {dataKeys.map((key) => (
          <Scatter
            key={key}
            name={key}
            data={groupedData}
            fill={colorMap[key]}
            dataKey={key}
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
          </Scatter>
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default CustomScatterChart;
