import React from "react";
import AggregateCharts from "../charts/aggregate-charts";
import { TableRow } from "~/components/analyst/catalog-tables";

interface LocationOption {
  value: string;
  [key: string]: unknown;
}

interface GraphDisplayProps {
  data: TableRow[];
  columns: { key: string; title: string }[];
  aggregateFunctions: { column: string; aggregateFunction: string }[];
  chartType: string;
  variant?: string;
  locationOption?: LocationOption[];
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({
  data,
  columns,
  aggregateFunctions,
  chartType,
  variant = "stacked",
  locationOption = [],
}) => {
  const filteredData = data.map((flight) => {
    // Copy the original flight object to keep all the fields intact
    const filteredFlight: TableRow = {};

    // Modify or add fields based on locationOption
    locationOption.forEach((option) => {
      filteredFlight[option.value] = flight[option.value];
      filteredFlight["intensity"] = aggregateFunctions[0]?.column
        ? flight[aggregateFunctions[0]?.column]
        : 0;
    });

    return filteredFlight;
  });

  return (
    <div className="h-full w-full flex items-end justify-end">
      <AggregateCharts
        data={data}
        columns={columns}
        aggregateFunctions={aggregateFunctions}
        chartType={chartType}
        variant={variant}
        filteredData={filteredData}
      />
    </div>
  );
};

export default GraphDisplay;
