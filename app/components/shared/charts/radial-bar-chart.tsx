import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { colorArray } from "./chart-func";
import { ChartDataItem } from "./line-chart";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
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
  variant: string;
}

// Custom Tooltip component to dynamically show all data fields
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div
        className="custom-tooltip"
        style={{ background: "#fff", padding: "5px", border: "1px solid #ccc" }}
      >
        {Object.entries(data)
          .filter(([key]) => key !== "fill")
          .map(([key, value]) => (
            <p key={key} className="tooltip-item">{`${key}: ${value}`}</p>
          ))}
      </div>
    );
  }

  return null;
};

const CustomRadialBarChart = ({
  commonProps,
  dataKeys,
  groupedData,
  handleBarClick,
}: BarChartProps) => {
  // Map data with colors
  const coloredGroupedData = groupedData.map((entry, idx) => ({
    ...entry,
    fill: colorArray[idx % colorArray.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={550}>
      <RadialBarChart
        {...commonProps}
        cx="50%"
        cy="50%"
        innerRadius="10%"
        outerRadius="90%"
        barSize={10}
        startAngle={180}
        endAngle={0}
        data={coloredGroupedData}
      >
        {/* Use the CustomTooltip here */}
        <Tooltip content={<CustomTooltip />} />
        <RadialBar background dataKey={dataKeys[0]}>
          {coloredGroupedData.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={entry.fill as string}
              onClick={() => handleBarClick(entry, idx, dataKeys[0])}
            />
          ))}
        </RadialBar>
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{
            fontSize: "8px",
            position: "relative",
            bottom: "30%",
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default CustomRadialBarChart;
