import { Legend, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "./chart-func";

interface ChartAxesProps {
  minDataValue: number;
  maxDataValue: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    index: number;
  }>;
  label?: string;
}

interface LegendEntry {
  color?: string;
}

interface AxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  index?: number;
}

const ChartAxes = ({ minDataValue, maxDataValue }: ChartAxesProps) => {
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p className="label">{` ${label}`}</p>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {payload.map((entry, index: number) => {
              const color = "#6897D3";
              return (
                <li key={`item-${index}`} style={{ color }}>
                  {`${entry.name}: ${formatNumber(entry.value)}`}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return null;
  };

  const renderColorfulLegendText = (value: string, entry: LegendEntry) => {
    const { color } = entry;

    return <span style={{ color }}>{value}</span>;
  };

  const CustomXAxisTick = (props: AxisTickProps) => {
    const { x = 0, y = 0, payload, index = 0 } = props;
    const isEven = index % 2 === 0;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={isEven ? 10 : -10}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={12}
          fontWeight={isEven ? "bold" : "normal"}
        >
          {payload?.value}
        </text>
      </g>
    );
  };

  return (
    <>
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
    </>
  );
};

export default ChartAxes;
