import { Legend, Tooltip, XAxis, YAxis } from "recharts";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
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
}

interface CustomLegendProps {
  payload?: Array<{ value: string }>;
  colorMap?: { [key: string]: string };
}

export const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
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
        {label && <p className="label">{` ${label}`}</p>}
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

export const renderColorfulLegendText = (value: string, entry: LegendEntry) => {
  const { color } = entry;

  return <span style={{ color }}>{value}</span>;
};

export const CustomXAxisTick = (props: AxisTickProps) => {
  const { x = 0, y = 0, payload } = props;
  const rotationAngle = -45; // Slant angle for the labels

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={-10}
        dy={16}
        textAnchor="end"
        fill="#666"
        fontSize={9}
        fontWeight="bold"
        transform={`rotate(${rotationAngle})`}
      >
        {payload?.value}
      </text>
    </g>
  );
};

export const CustomLegend = ({ payload = [], colorMap = {} }: CustomLegendProps) => {
  return (
    <div
      className="custom-legend flex flex-wrap gap-[5px] justify-center mt-5"
      style={{ fontSize: "8px" }}
    >
      {payload.map((entry) => (
        <div
          key={entry.value}
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: colorMap[entry.value] || "#000",
              marginRight: "1px",
            }}
          />
          <span style={{ color: colorMap[entry.value] || "#000" }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const formatNumber = (num: number) => {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  } else {
    return Math.round(num).toString();
  }
};

export const commonAxes = (
  <>
    <XAxis
      interval="equidistantPreserveStart"
      dataKey="name"
      tick={<CustomXAxisTick />}
      height={50}
    />
    <YAxis interval="equidistantPreserveStart" tickCount={10} fontSize={10} />
    <Tooltip content={<CustomTooltip />} />
    <Legend
      formatter={renderColorfulLegendText}
      iconType="circle"
      iconSize={10}
    />
  </>
);

// Create the colorMap dynamically
export const createColorMap = (keys: string[]) => {
  const colorMap: { [key: string]: string } = {};
  keys.forEach((key, i) => {
    colorMap[key] = colorArray[i];
  });
  return colorMap;
};

// Color array for the chart
export const colorArray = [
  "#6897D3",
  "#32CD32",
  "#FF6347",
  "#4682B4",
  "#FFD700",
  "#00CED1",
  "#7B68EE",
  "#FF4500",
  "#40E0D0",
  "#9ACD32",
  "#20B2AA",
  "#FF7F50",
  "#008080",
  "#9370DB",
  "#00FA9A",
  "#6A5ACD",
  "#FF1493",
  "#5F9EA0",
  "#98FB98",
  "#1E90FF",
  "#FF69B4",
  "#00FF7F",
  "#4B0082",
  "#ADFF2F",
  "#FF8C00",
  "#AFEEEE",
  "#8A2BE2",
  "#87CEFA",
  "#9400D3",
  "#66CDAA",
  "#FFB6C1",
  "#3CB371",
  "#B0C4DE",
  "#DC143C",
  "#ADD8E6",
  "#4682B4",
  "#7FFF00",
  "#B0E0E6",
  "#FF4500",
  "#00BFFF",
  "#FFD700",
  "#20B2AA",
  "#FFA07A",
  "#8FBC8F",
  "#D2691E",
  "#FFDEAD",
  "#C71585",
  "#FF00FF",
  "#A0522D",
  "#8B0000",
  "#BC8F8F",
  "#B8860B",
  "#E9967A",
  "#DB7093",
  "#DDA0DD",
  "#CD5C5C",
  "#FA8072",
  "#F08080",
  "#FF6347",
  "#FFDAB9",
  "#EEE8AA",
  "#98FB98",
  "#DAA520",
  "#D2B48C",
  "#F4A460",
  "#2F4F4F",
  "#778899",
  "#708090",
  "#B0C4DE",
  "#6495ED",
  "#4682B4",
  "#5F9EA0",
  "#00CED1",
  "#48D1CC",
  "#87CEFA",
  "#7FFFD4",
  "#32CD32",
  "#00FF7F",
  "#ADFF2F",
  "#8B4513",
  "#FFB347",
  "#F0E68C",
  "#DEB887",
  "#FFE4C4",
  "#90EE90",
  "#DA70D6",
  "#9370DB",
  "#D8BFD8",
  "#F5DEB3",
  "#EE82EE",
  "#FF1493",
  "#BDB76B",
  "#8FBC8F",
  "#AFEEEE",
  "#B0E0E6",
  "#ADD8E6",
  "#4682B4",
  "#DDA0DD",
  "#3CB371",
  "#6B8E23",
  "#BC8F8F",
  "#D2691E",
  "#FFD700",
  "#40E0D0",
  "#BA55D3",
  "#CD5C5C",
  "#9932CC",
  "#7B68EE",
  "#00CED1",
  "#FFE4E1",
  "#8A2BE2",
  "#F5F5DC",
  "#8B0000",
  "#FF69B4",
  "#FF7F50",
  "#00BFFF",
  "#AFEEEE",
  "#8B4513",
  "#D2B48C",
  "#BDB76B",
  "#5F9EA0",
  "#9ACD32",
  "#FFDEAD",
  "#00FA9A",
  "#DC143C",
  "#FF00FF",
  "#FF6347",
  "#FFA07A",
  "#8A2BE2",
  "#DB7093",
  "#9932CC",
  "#8B008B",
  "#FF4500",
  "#FFA500",
  "#FF6347",
  "#00CED1",
  "#FFD700",
  "#32CD32",
  "#7FFFD4",
  "#FF7F50",
  "#DAA520",
  "#FA8072",
  "#A0522D",
  "#00FA9A",
  "#E6E6FA",
  "#AFEEEE",
  "#FF4500",
  "#FF6347",
  "#BA55D3",
  "#8B4513",
  "#FFE4C4",
  "#F08080",
  "#DB7093",
  "#87CEEB",
  "#778899",
  "#6B8E23",
  "#D2691E",
  "#CD5C5C",
  "#4682B4",
  "#FFA500",
  "#5F9EA0",
  "#9ACD32",
  "#FFDEAD",
  "#DB7093",
  "#7FFFD4",
  "#FFDAB9",
  "#FF4500",
  "#8B0000",
  "#CD5C5C",
  "#F0E68C",
  "#9370DB",
  "#4682B4",
  "#DC143C",
  "#FF69B4",
  "#FFE4C4",
  "#8B4513",
  "#B8860B",
  "#FFEFD5",
  "#FF1493",
  "#87CEFA",
  "#FF8C00",
  "#DB7093",
  "#BC8F8F",
  "#3CB371",
  "#9ACD32",
  "#ADD8E6",
  "#8B008B",
  "#BA55D3",
  "#FF7F50",
  "#00FA9A",
  "#FFD700",
  "#8A2BE2",
  "#DB7093",
  "#E6E6FA",
  "#FFE4C4",
  "#B8860B",
  "#BC8F8F",
  "#4682B4",
  "#FF6347",
  "#CD5C5C",
  "#FF4500",
  "#8A2BE2",
  "#FFA07A",
  "#AFEEEE",
  "#FF4500",
  "#FFEFD5",
  "#FFDAB9",
  "#B8860B",
  "#FF69B4",
  "#8B4513",
  "#FFDAB9",
  "#DDA0DD",
  "#DC143C",
  "#5F9EA0",
  "#DA70D6",
  "#D2691E",
  "#7FFF00",
  "#7B68EE",
  "#DDA0DD",
  "#BC8F8F",
  "#F08080",
  "#DB7093",
  "#9370DB",
  "#FF6347",
  "#4682B4",
  "#FFD700",
  "#00FA9A",
  "#D2B48C",
  "#3CB371",
  "#BDB76B",
  "#FFE4C4",
  "#BA55D3",
  "#7B68EE",
  "#FF4500",
  "#FF6347",
  "#FFDAB9",
  "#B8860B",
  "#FF4500",
  "#FFA500",
  "#FFD700",
];

export const calculateDynamicInterval = (min: number, max: number) => {
  const range = max - min;
  if (range <= 10) return 1;
  return Math.ceil(range / 10);
};

export const calculateEquidistantTicks = (
  min: number,
  max: number,
  interval: number
) => {
  const ticks = [];
  for (let value = min; value <= max; value += interval) {
    ticks.push(value);
  }
  return ticks;
};

// Function to calculate the maximum value for stacked bars
export const calculateStackedMaxValue = (
  dataKeys: string[], 
  groupedData: Array<{ [key: string]: number | string }>
): number => {
  return Math.max(
    ...groupedData.map((entry) =>
      dataKeys.reduce((sum, key) => sum + (Number(entry[key]) || 0), 0)
    )
  );
};
