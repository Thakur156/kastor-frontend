import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Legend, Tooltip, XAxis, YAxis } from "recharts";
import {
  CustomTooltip,
  CustomXAxisTick,
  renderColorfulLegendText,
  formatNumber,
  colorArray,
  calculateEquidistantTicks,
  calculateDynamicInterval,
} from "./chart-func";

interface ChartDataItem {
  name: string;
  [key: string]: number | string;
}

interface CustomAreaChartProps {
  dataKeys: string[];
  minDataValue: number;
  maxDataValue: number;
  groupedData: ChartDataItem[];
}

const CustomAreaChart = ({
  dataKeys,
  minDataValue,
  maxDataValue,
  groupedData,
}: CustomAreaChartProps) => {
  // Dynamically calculate interval
  const interval = calculateDynamicInterval(minDataValue, maxDataValue);
  const yAxisTicks = calculateEquidistantTicks(
    minDataValue,
    maxDataValue,
    interval
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={groupedData}>
        <XAxis
          dataKey="name"
          tick={<CustomXAxisTick />}
          height={50}
          interval="equidistantPreserveStart"
        />
        <YAxis
          domain={[minDataValue, maxDataValue]}
          ticks={yAxisTicks}
          width={80}
          tickFormatter={formatNumber}
          fontSize={10}
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
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colorArray[index]}
            fill={colorArray[index]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomAreaChart;
