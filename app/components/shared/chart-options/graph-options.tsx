import React, { useMemo, useState } from "react";
import { Button } from "../../ui/button";
import CustomTooltip from "../custom-tooltip";
import { Save, InfoIcon, Pencil } from "lucide-react";
import ChartTypeSelector from "./charts-type-selector";
import MetricsSelector from "./metrics-selector";
import MultiSelector from "./multi-selector";
import FiltersSelector from "./filters-selector";
import MetricsModal from "./metrics-modal";
import FiltersModal from "./filters-modal";
import GraphDisplay from "./graph-display";
import ChartGroupVariant from "../charts/chart-group-variant";
import { TableRow } from "~/components/analyst/catalog-tables";

// Define proper interfaces
interface SelectOption {
  value: string;
  label: string;
}

interface Metric {
  column: string;
  aggregateFunction: string;
}

interface Filter {
  column: string;
  filterType: string;
  filterValue: string;
}

interface GraphOptionsData {
  metrics: Metric[];
  dimensions: SelectOption[];
  filters: Filter[];
  chartType: string;
  chartTitle: string;
  locationOptions: SelectOption[];
}

interface ShareDataItem {
  graphOptions: GraphOptionsData;
  [key: string]: unknown;
}

interface GraphOptionsProps {
  columns: { key: string; title: string }[];
  data: TableRow[];
  shareData?: ShareDataItem[];
  setShareData?: React.Dispatch<React.SetStateAction<ShareDataItem[]>>;
  index?: number;
  graphOptions?: GraphOptionsData;
  isShared?: boolean;
  isGraphVisible?: boolean;
  handleSaveCell?: (showType: string) => void;
}

function GraphOptions({
  columns,
  data,
  shareData = [],
  setShareData = () => {},
  index = 0,
  graphOptions,
  isShared = false,
  isGraphVisible = false,
  handleSaveCell,
}: GraphOptionsProps) {
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [selectMetrics, setSelectMetrics] = useState<Metric[]>(
    graphOptions ? graphOptions.metrics : []
  );
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(
    graphOptions ? graphOptions.dimensions : []
  );
  const [locationOption, setLocationOption] = useState<SelectOption[]>(
    graphOptions?.locationOptions ? graphOptions.locationOptions.map(option => ({
      value: option.value,
      label: option.value
    })) : []
  );

  const [showGraph, setShowGraph] = useState(!!isGraphVisible);
  const [chartType, setChartType] = useState(
    graphOptions ? graphOptions.chartType : ""
  );
  const [chartVariant, setChartVariant] = useState<string>(
    isShared ? "stacked" : ""
  );
  const [selectFilters, setSelectFilters] = useState<Filter[]>(
    graphOptions ? graphOptions.filters : []
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [chartTitle, setChartTitle] = useState(
    graphOptions?.chartTitle || "Untitled Chart"
  );
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  const isColumnNumeric = (columnKey: string) =>
    data.every((item) => !isNaN(Number(item[columnKey])));

  const handleFilterModal = () => {
    setIsFilterModalOpen(!isFilterModalOpen);
  };

  const handleRemoveFilter = (
    column: string,
    filterType: string,
    filterValue: string
  ) => {
    setSelectFilters((prevFilters) =>
      prevFilters.filter(
        (filter) =>
          !(
            filter.column === column &&
            filter.filterType === filterType &&
            filter.filterValue === filterValue
          )
      )
    );
  };

  const handleFilters = (
    column: string,
    filterType: string,
    filterValue: string
  ) => {
    if (!column || !filterValue) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        filter: "Please select a column and provide a filter value.",
      }));
      return;
    }

    if (
      selectFilters.some(
        (filter) =>
          filter.column === column &&
          filter.filterType === filterType &&
          filter.filterValue === filterValue
      )
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        filter: "The selected filter already exists.",
      }));
      return;
    }

    setErrors((prevErrors) => ({ ...prevErrors, filter: "" }));
    setSelectFilters((prevFilters) => [
      ...prevFilters,
      { column, filterType, filterValue },
    ]);
    setIsFilterModalOpen(false);
    setShowGraph(false);
  };

  const handleMetricModal = () => {
    setIsMetricModalOpen(!isMetricModalOpen);
  };

  const handleMetrics = (column: string, aggregateFunction: string) => {
    if (!column) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        metric: "Please select a column.",
      }));
      return;
    }

    if (
      selectMetrics.some(
        (metric) =>
          metric.column === column &&
          metric.aggregateFunction === aggregateFunction
      )
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        metric: "The selected metric already exists.",
      }));
      return;
    }

    setErrors((prevErrors) => ({ ...prevErrors, metric: "" }));
    setSelectMetrics((prevMetrics) => [
      ...prevMetrics,
      { column, aggregateFunction },
    ]);
    setIsMetricModalOpen(false);
    setShowGraph(false);
  };

  const removeMetric = (column: string) => {
    setSelectMetrics((prevMetrics) => {
      const updatedMetrics = prevMetrics.filter(
        (metric) => metric.column !== column
      );
      return updatedMetrics;
    });
  };

  const availableColumns = useMemo(() => columns, [columns]);

  // Separate numeric and non-numeric columns
  const numericColumns = useMemo(() => {
    if (!data.length) return [];
    return columns.filter((column) =>
      data.every((item) => typeof item[column.key] === "number")
    );
  }, [columns, data]);

  const nonNumericColumns = useMemo(() => {
    if (!data.length) return [];
    return columns.filter(
      (column) => !data.every((item) => typeof item[column.key] === "number")
    );
  }, [columns, data]);

  const handleDrawGraph = () => {
    if (!chartType) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        chart: "Please select at least one chart type.",
      }));
      return;
    }

    // Check if at least one metric is selected -> optional for heatmap
    if (selectMetrics.length === 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        metric: "Please select at least one metric.",
      }));
      return;
    }

    // Check if at least one dimension is selected -> optional for heatmap
    if (selectedOptions.length === 0 && chartType !== "heatmap") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dimension: "Please select at least one dimension.",
      }));
      return;
    }

    setErrors((prevErrors) => ({ ...prevErrors, drawGraph: "" }));

    const updatedGraphOptions = {
      metrics: selectMetrics,
      dimensions: selectedOptions,
      filters: selectFilters,
      chartType: chartType,
      chartTitle: chartTitle,
      locationOptions: locationOption,
    };

    console.log("graph options", updatedGraphOptions, locationOption);

    const updatedShareData = [...shareData];
    updatedShareData[index].graphOptions = updatedGraphOptions;

    setShareData(updatedShareData);

    setShowGraph(true);
    setIsFirstTime(false);
    setErrors({});
  };

  const filteredData = useMemo(() => {
    if (selectFilters.length === 0) return data;

    return data.filter((item) => {
      return selectFilters.every((filter) => {
        const itemValue = item[filter.column];
        const filterValue = filter.filterValue;

        // Ensure both values are treated as strings for non-numeric comparisons
        const parsedItemValue =
          typeof itemValue === "string" ? itemValue : String(itemValue);
        const parsedFilterValue =
          typeof filterValue === "string" ? filterValue : String(filterValue);

        switch (filter.filterType) {
          case "equal":
            return parsedItemValue === parsedFilterValue;

          case "notEqual":
            return parsedItemValue !== parsedFilterValue;

          case "contains":
            return parsedItemValue
              .toLowerCase()
              .includes(parsedFilterValue.toLowerCase());

          case "beginsWith":
            return parsedItemValue
              .toLowerCase()
              .startsWith(parsedFilterValue.toLowerCase());

          case "endsWith":
            return parsedItemValue
              .toLowerCase()
              .endsWith(parsedFilterValue.toLowerCase());

          case "between":
            // "Between" handling for non-numeric fields (e.g., dates or strings)
            // Assuming parsedFilterValue is an array of [start, end] for "between"
            if (Array.isArray(parsedFilterValue)) {
              return (
                parsedItemValue >= parsedFilterValue[0] &&
                parsedItemValue <= parsedFilterValue[1]
              );
            }
            return true;

          // Handling numeric comparisons
          case "lessThan":
            return parseFloat(String(itemValue)) < parseFloat(filterValue);

          case "lessOrEqual":
            return parseFloat(String(itemValue)) <= parseFloat(filterValue);

          case "greaterThan":
            return parseFloat(String(itemValue)) > parseFloat(filterValue);

          case "greaterOrEqual":
            return parseFloat(String(itemValue)) >= parseFloat(filterValue);

          default:
            return true;
        }
      });
    });
  }, [data, selectFilters]);

  const handleSaveChartTitle = () => {
    const updatedShareData = [...shareData];
    updatedShareData[index].graphOptions.chartTitle = chartTitle;
    setIsTitleEditing(false);
  };

  return (
    <section className="bg-white rounded-[20px] border border-Stroke p-2 ">
      <div className="flex items-center justify-between">
        {/* Sidebar Toggle Button */}
        <div className="flex items-center gap-2 px-5 py-2"></div>

        {/* Tooltip Icons Section */}
        <div className="flex items-center gap-2 px-5 py-2">
          <CustomTooltip
            trigger={
              <Save
                size={20}
                onClick={() => {
                  handleSaveCell && handleSaveCell("graph");
                }}
              />
            }
            content="Save graph"
          />
        </div>
      </div>
      <div className="flex lg:items-start justify-between lg:flex-row flex-col relative">
        {!isShared && (
          <div className="h-full lg:w-[35%] w-full  px-4  rounded-[20px]">
            <div>
              <h4 className="text-md font-bold mb-2 uppercase">
                Visualize the Query Output
              </h4>
              <div>
                <ChartTypeSelector
                  chartType={chartType}
                  onChartTypeChange={(value) => {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      chart: "",
                    }));
                    setChartType(value);
                    setShowGraph(false);
                  }}
                />
                {errors.chart && (
                  <p className="text-red-500 text-sm">{errors.chart}</p>
                )}
                {(chartType === "barchart" ||
                  chartType === "horizontalbarchart") && (
                  <ChartGroupVariant
                    variant={chartVariant}
                    onChartVariantChange={(value) => {
                      setChartVariant(value);
                      setShowGraph(false);
                    }}
                  />
                )}
                {chartType === "heatmap" && (
                  <MultiSelector
                    label="Location Column"
                    columns={columns}
                    selectedOptions={locationOption}
                    setSelectedOptions={(value) => {
                      setLocationOption(value);
                      setShowGraph(false);
                    }}
                  />
                )}
                <MetricsSelector
                  selectMetrics={selectMetrics}
                  removeMetric={removeMetric}
                  handleMetricModal={handleMetricModal}
                />
                {errors.metric && (
                  <p className="text-red-500 text-sm">{errors.metric}</p>
                )}
                <MultiSelector
                  label="Dimensions"
                  columns={columns}
                  selectedOptions={selectedOptions}
                  setSelectedOptions={(value) => {
                    setSelectedOptions(value);
                    setShowGraph(false);
                  }}
                />
                {errors.dimension && (
                  <p className="text-red-500 text-sm">{errors.dimension}</p>
                )}
                <FiltersSelector
                  selectFilters={selectFilters}
                  removeFilter={handleRemoveFilter}
                  handleFilterModal={handleFilterModal}
                />
              </div>

              {/* Draw Graph Button */}
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={handleDrawGraph}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 !mb-2"
                >
                  Draw Graph
                </Button>
                {errors.drawGraph && (
                  <p className="text-red-500 text-sm">{errors.drawGraph}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pass both numeric and non-numeric columns to FiltersModal */}
        <MetricsModal
          isOpen={isMetricModalOpen}
          onClose={handleMetricModal}
          availableColumns={availableColumns}
          selectMetrics={selectMetrics}
          handleMetrics={handleMetrics}
          isColumnNumeric={isColumnNumeric}
        />

        <FiltersModal
          isOpen={isFilterModalOpen}
          onClose={handleFilterModal}
          numericColumns={numericColumns}
          nonNumericColumns={nonNumericColumns}
          handleFilters={handleFilters}
          error={errors.filter}
        />

        {showGraph ? (
          <div className="flex-1">
            <div className="flex items-center gap-2 justify-center mb-5">
              {!isShared && isTitleEditing ? (
                <input
                  // style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px" }}
                  disabled={!isTitleEditing}
                  onBlur={handleSaveChartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  value={chartTitle}
                  className="border px-2 py-1 rounded"
                />
              ) : (
                <h3>{chartTitle}</h3>
              )}
              {!isShared && (
                <Pencil
                  size={16}
                  onClick={() => setIsTitleEditing(true)}
                  className="cursor-pointer"
                />
              )}
            </div>
            <GraphDisplay
              data={filteredData}
              columns={selectedOptions.map((selectedOption) => ({
                key: selectedOption.value,
                title: selectedOption.label,
              }))}
              aggregateFunctions={selectMetrics}
              chartType={chartType}
              variant={chartVariant}
              locationOption={locationOption.map(option => ({
                value: option.value,
                label: option.label
              }))}
            />
          </div>
        ) : (
          !isFirstTime && (
            <div className=" text-black bg-gray-200 p-4 rounded-lg flex-1 mt-2">
              <div className="flex items-center gap-3">
                <InfoIcon size={60} color="#3498db" />
                <div>
                  <h2 className="text-xl font-semibold">
                    Required control values updated
                  </h2>
                  <p className="text-sm">
                    Values have been updated in the control panel. Run the
                    filters by clicking the &ldquo;Draw Graph&rdquo; button.
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default GraphOptions;
