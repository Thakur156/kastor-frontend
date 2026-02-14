import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface ChartTypeSelectorProps {
  variant: string;
  onChartVariantChange: (value: string) => void;
}

const ChartGroupVariant: React.FC<ChartTypeSelectorProps> = ({
  variant,
  onChartVariantChange,
}) => (
  <div className="space-y-2 mt-2">
    <label htmlFor="chart" className="text-xs font-semibold text-black">
      Chart Variant:
    </label>
    <Select value={variant} onValueChange={onChartVariantChange}>
      <SelectTrigger className="border-0 bg-gray-200 h-10 focus:ring-transparent rounded-full text-sm text-black px-5 hover:border hover:border-primary">
        <SelectValue placeholder="Select a chart type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="stacked">Stacked</SelectItem>
        <SelectItem value="grouped">Grouped</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export default ChartGroupVariant;
