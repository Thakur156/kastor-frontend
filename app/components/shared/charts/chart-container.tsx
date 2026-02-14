import React from "react";

import BarChartComponent from "./bar-chart";
import HorizontalChartComponent from "./horizontal-bar-chart";
import LineChartComponent from "./line-chart";
import AreaChartComponent from "./area-chart";
import PieChartComponent from "./pie-chart";
import ScatterChartComponent from "./scatter-charts";
import ComposedChartComponent from "./composed-chart";
import RadialBarChartComponent from "./radial-bar-chart";
//import HeatMapChart from "./heatmap-chart";
import { TableRow } from "~/components/analyst/catalog-tables";

interface ChartDataItem {
  name: string;
  [key: string]: number | string;
}

interface ChartContainerProps {
  groupedData: ChartDataItem[];
  chartType: string;
  variant: string;
  dataKeys: string[];
  minDataValue: number;
  maxDataValue: number;
  handleBarClick: (
    data: ChartDataItem,
    index: number,
    dataKey: string
  ) => void;
  areaChartData: ChartDataItem[];
  filteredData: TableRow[];
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  groupedData,
  chartType,
  dataKeys,
  minDataValue,
  maxDataValue,
  handleBarClick,
  variant,
  areaChartData,
}) => {
  if (chartType !== "linechart") {
    minDataValue = 0;
  } else {
    minDataValue;
  }

  maxDataValue = Math.ceil(maxDataValue * 1.1);

  const commonProps = {
    data: groupedData,
    margin: { top: 10, right: 0, left: 0, bottom: 30 },
  };

  if (groupedData.length === 0 && chartType !== "heatmap") {
    return (
      <div style={{ textAlign: "center", paddingTop: "20px" }}>
        No data available to display the chart.
      </div>
    );
  }

  switch (chartType) {
    case "barchart":
      return (
        <>
          <BarChartComponent
            commonProps={commonProps}
            dataKeys={dataKeys}
            handleBarClick={handleBarClick}
            minDataValue={minDataValue}
            maxDataValue={maxDataValue}
            groupedData={groupedData}
            variant={variant}
          />
        </>
      );
    case "horizontalbarchart":
      return (
        <>
          <HorizontalChartComponent
            commonProps={commonProps}
            dataKeys={dataKeys}
            handleBarClick={handleBarClick}
            minDataValue={minDataValue}
            maxDataValue={maxDataValue}
            groupedData={groupedData}
            variant={variant}
          />
        </>
      );
    case "radialbarchart":
      return (
        <>
          <RadialBarChartComponent
            commonProps={commonProps}
            dataKeys={dataKeys}
            handleBarClick={handleBarClick}
            minDataValue={minDataValue}
            maxDataValue={maxDataValue}
            groupedData={groupedData}
            variant={variant}
          />
        </>
      );
    case "linechart":
      return (
        <>
          <LineChartComponent
            commonProps={commonProps}
            dataKeys={dataKeys}
            minDataValue={minDataValue}
            maxDataValue={maxDataValue}
            handleBarClick={handleBarClick}
          />
        </>
      );
    case "areachart":
      return (
        <>
          <AreaChartComponent
            commonProps={commonProps}
            dataKeys={dataKeys}
            handleBarClick={handleBarClick}
            minDataValue={minDataValue}
            maxDataValue={maxDataValue}
            areaChartData={areaChartData}
            groupedData={groupedData}
          />
        </>
      );
    case "piechart":
      return (
        <>
          <PieChartComponent
            groupedData={groupedData}
            dataKeys={dataKeys}
            handleBarClick={handleBarClick}
          />
        </>
      );
    case "scatterchart":
      return (
        <>
          <ScatterChartComponent
            commonProps={commonProps}
            dataKeys={dataKeys}
            handleBarClick={handleBarClick}
            minDataValue={minDataValue}
            maxDataValue={maxDataValue}
            groupedData={groupedData}
            variant={variant}
          />
        </>
      );
    case "composedchart":
      return (
        <>
          <ComposedChartComponent
            commonProps={commonProps}
            dataKeys={dataKeys}
            lineDataKey={dataKeys[1]}
            handleBarClick={handleBarClick}
            minDataValue={minDataValue}
            maxDataValue={maxDataValue}
            groupedData={groupedData}
            variant={variant}
          />
        </>
      );
    case "heatmap":
      return (
        <>
          {/* {renderTitle()} */}
          {/* <HeatMapChart filteredData={filteredData} /> */}
        </>
      );
    default:
      return (
        <div style={{ textAlign: "center", paddingTop: "20px" }}>
          Invalid chart type selected.
        </div>
      );
  }
};

export default ChartContainer;
