import {
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip, colorArray } from "./chart-func";
import { ChartDataItem } from "./line-chart";

interface CustomPieChartProps {
  groupedData: ChartDataItem[];
  dataKeys: string[];
  handleBarClick: (
    data: ChartDataItem,
    index: number,
    dataKey: string
  ) => void;
}

const CustomPieChart = ({
  groupedData,
  dataKeys,
  handleBarClick,
}: CustomPieChartProps) => {
  // Calculate total value for each dataKey to be used for percentage calculation
  const totalValues = dataKeys.reduce((acc, key) => {
    const total = groupedData.reduce((sum, entry) => sum + Number(entry[key] || 0), 0);
    acc[key] = total;
    return acc;
  }, {} as { [key: string]: number });

  // Custom label to show percentages
  const renderLabel = (entry: ChartDataItem, index: number, key: string) => {
    const percentage = ((Number(entry[key]) / totalValues[key]) * 100).toFixed(1); // Calculate percentage
    return `${percentage}%`; // Return the formatted percentage
  };

  return (
    <ResponsiveContainer width="100%" height={"100%"}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{
            fontSize: "8px",
            bottom: "15%",
          }}
        />
        {dataKeys.map((key, index) => (
          <Pie
            key={key}
            data={groupedData}
            dataKey={key}
            nameKey="name"
            cx="50%"
            cy="50%"
            legendType="circle"
            outerRadius={130 + index * 20}
            label={(entry) => renderLabel(entry, index, key)}
            onClick={(data, idx) => handleBarClick(data, idx, key)}
          >
            {groupedData.map((entry, idx) => {
              const fillColor = colorArray[idx];

              return (
                <Cell
                  key={`cell-${idx}`}
                  fill={fillColor}
                  onClick={() => handleBarClick(entry, idx, key)}
                />
              );
            })}
          </Pie>
        ))}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
