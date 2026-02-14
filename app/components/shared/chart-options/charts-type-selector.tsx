import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface ChartTypeSelectorProps {
  chartType: string;
  onChartTypeChange: (value: string) => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  chartType,
  onChartTypeChange,
}) => (
  <div className="space-y-2 mt-2">
    <label htmlFor="chart" className="text-xs font-semibold text-black">
      CHART TYPE:
    </label>
    <Select value={chartType} onValueChange={onChartTypeChange}>
      <SelectTrigger className="border-0 bg-gray-200 h-10 focus:ring-transparent rounded-full text-sm text-black px-5 hover:border hover:border-primary">
        <SelectValue placeholder="Select a chart type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="barchart">Bar Chart</SelectItem>
        <SelectItem value="horizontalbarchart">Horizontal Bar Chart</SelectItem>
        <SelectItem value="radialbarchart">Radial Bar Chart</SelectItem>
        <SelectItem value="areachart">Area Chart</SelectItem>
        <SelectItem value="linechart">Line Chart</SelectItem>
        <SelectItem value="piechart">Pie Chart</SelectItem>
        <SelectItem value="scatterchart">Scatterplot</SelectItem>
        <SelectItem value="composedchart">Combination Chart</SelectItem>
        <SelectItem value="heatmap">HeatMap</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export default ChartTypeSelector;
