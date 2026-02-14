import { useMemo } from "react";
import ChartContainer from "./chart-container";
import { TableRow } from "~/components/analyst/catalog-tables";

interface AggregateChartData {
  name: string;
  [key: string]: unknown;
}

interface AggregateChartsProps {
  data: TableRow[];
  columns: { key: string; title: string }[];
  aggregateFunctions: { column: string; aggregateFunction: string }[];
  chartType: string;
  variant: string;
  filteredData: TableRow[];
}

export default function AggregateCharts({
  data = [],
  columns = [],
  aggregateFunctions = [],
  chartType = "barchart",
  variant = "stacked",
  filteredData,
}: AggregateChartsProps) {
  const {
    groupedData,
    groupingDimensionValues,
    minDataValue,
    maxDataValue,
    areachartData,
  } = useMemo(() => {
    try {
      if (data.length === 0 || columns.length === 0) {
        return {
          groupedData: [],
          groupingDimensionValues: [],
          minDataValue: 0,
          maxDataValue: 0,
        };
      }

      const xAxisDimensionKey = columns.length > 0 ? columns[0].key : null;
      const groupingDimensionKey = columns.length > 1 ? columns[1].key : null;

      if (!xAxisDimensionKey) {
        // Cannot create meaningful graph without at least one dimension
        return {
          groupedData: [],
          groupingDimensionValues: [],
          minDataValue: 0,
          maxDataValue: 0,
        };
      }

      const groupedDataMap = new Map<string, AggregateChartData>();
      const groupingDimensionValuesSet = new Set<string>();

      let minDataValue = Infinity;
      let maxDataValue = -Infinity;

      const areachartData = data.map((item) => {
        const mappedObject: AggregateChartData = {
          name: String(item[columns[0].key]),
        };

        // Map each column to its corresponding value from data
        columns.forEach((column) => {
          mappedObject[column.key] = item[column.key] as number | string;
        });

        if (aggregateFunctions.length > 0) {
          // Add the 'duration' value to the first column
          mappedObject[columns[0].key] = item[aggregateFunctions[0].column] as number | string;
        }

        return mappedObject;
      });

      data.forEach((item) => {
        const xAxisValue = String(item[xAxisDimensionKey]);

        if (!groupedDataMap.has(xAxisValue)) {
          groupedDataMap.set(xAxisValue, { name: xAxisValue });
        }

        const groupData = groupedDataMap.get(xAxisValue)!;

        if (groupingDimensionKey) {
          const groupValue = String(item[groupingDimensionKey]);
          groupingDimensionValuesSet.add(groupValue);

          aggregateFunctions.forEach((aggFunc) => {
            const metricKey = `${groupValue}`;

            if (!Array.isArray(groupData[metricKey])) {
              groupData[metricKey] = [];
            }

            (groupData[metricKey] as unknown[]).push(item[aggFunc.column]);
          });
        } else if (aggregateFunctions.length > 0) {
          aggregateFunctions.forEach((aggFunc) => {
            const metricKey = aggFunc.column;

            if (!Array.isArray(groupData[metricKey])) {
              groupData[metricKey] = [];
            }

            (groupData[metricKey] as unknown[]).push(item[aggFunc.column]);
          });
        } else {
          // If no aggregate functions provided, use original values
          Object.keys(item).forEach((key) => {
            if (key !== xAxisDimensionKey) {
              groupData[key] = item[key];
            }
          });
        }
      });

      const groupedData: AggregateChartData[] = [];

      groupedDataMap.forEach((groupData) => {
        const result: AggregateChartData = { name: groupData.name };

        Object.keys(groupData).forEach((key) => {
          if (key !== "name") {
            const values = Array.isArray(groupData[key])
              ? (groupData[key] as unknown[])
              : [groupData[key]];

            let aggregateValue = values[0] as number;

            if (aggregateFunctions.length > 0) {
              const aggFunc = aggregateFunctions[0];

              switch (aggFunc.aggregateFunction) {
                case "sum":
                  aggregateValue = values.reduce(
                    (acc, value) => (acc as number) + (value as number),
                    0
                  ) as number;
                  break;
                case "average":
                  aggregateValue =
                    (values.reduce((acc, value) => (acc as number) + (value as number), 0) as number) /
                    values.length;
                  break;
                case "max":
                  aggregateValue = Math.max(...(values as number[]));
                  break;
                case "min":
                  aggregateValue = Math.min(...(values as number[]));
                  break;
                case "count":
                  aggregateValue = values.length;
                  break;
                default:
                  break;
              }
            }

            result[key] = aggregateValue;

            if (aggregateValue < minDataValue) minDataValue = aggregateValue;
            if (aggregateValue > maxDataValue) maxDataValue = aggregateValue;
          }
        });

        groupedData.push(result);
      });

      const groupingDimensionValues = Array.from(groupingDimensionValuesSet);

      return {
        groupedData,
        groupingDimensionValues,
        minDataValue,
        maxDataValue,
        areachartData,
      };
    } catch (error) {
      console.error("Error in useMemo:", error);
      return {
        groupedData: [],
        groupingDimensionValues: [],
        minDataValue: 0,
        maxDataValue: 0,
      };
    }
  }, [data, columns, aggregateFunctions]);

  const handleBarClick = (
    data: AggregateChartData,
    index: number,
    dataKey: string
  ) => {
    // Chart click handler - currently not implemented
    console.log("Chart clicked:", { data, index, dataKey });
  };
  return (
    <div className="h-[70vh] w-full" style={{ position: "relative" }}>
      {groupedData.length > 0 ||
      (filteredData.length > 0 && chartType === "heatmap") ? (
        <ChartContainer
          groupedData={groupedData as { name: string; [key: string]: number | string }[]}
          chartType={chartType}
          variant={variant}
          dataKeys={
            groupingDimensionValues.length > 0
              ? groupingDimensionValues
              : aggregateFunctions.map((aggFunc) => aggFunc.column)
          }
          minDataValue={minDataValue}
          maxDataValue={maxDataValue}
          handleBarClick={handleBarClick as (data: { name: string; [key: string]: number | string }, index: number, dataKey: string) => void}
          areaChartData={areachartData as { name: string; [key: string]: number | string }[]}
          filteredData={filteredData}
        />
      ) : (
        <div
          className="flex items-center justify-center h-full"
          style={{ textAlign: "center", paddingTop: "20px" }}
        >
          No data available to display the chart.
        </div>
      )}
    </div>
  );
}
