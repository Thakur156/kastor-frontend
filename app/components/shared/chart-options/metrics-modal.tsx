import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface MetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableColumns: { key: string; title: string }[];
  selectMetrics: { column: string; aggregateFunction: string }[];
  handleMetrics: (column: string, aggregateFunction: string) => void;
  isColumnNumeric: (columnKey: string) => boolean;
}

const MetricsModal: React.FC<MetricsModalProps> = ({
  isOpen,
  onClose,
  availableColumns,
  selectMetrics,
  handleMetrics,
  isColumnNumeric,
}) => {
  const [selectedColumn, setSelectedColumn] = React.useState<
    string | undefined
  >("");
  const [aggregateFunction, setAggregateFunction] = React.useState("");

  useEffect(() => {
    if (selectedColumn && !isColumnNumeric(selectedColumn)) {
      setAggregateFunction("count");
    } else {
      setAggregateFunction("");
    }
  }, [selectedColumn, isColumnNumeric]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">Select Metrics</h2>
          <span
            className="border p-1 rounded-full cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          >
            <X size={20} />
          </span>
        </div>

        <div className="space-y-2 mt-2">
          <label
            htmlFor="metric-column"
            className="text-xs font-semibold text-black"
          >
            COLUMN:
          </label>
          <Select
            value={selectedColumn}
            onValueChange={(value) => {
              setSelectedColumn(value);
            }}
          >
            <SelectTrigger className="border-0 bg-gray-200 h-10 focus:ring-transparent rounded-full text-sm text-black px-5">
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.length > 0 ? (
                availableColumns.map((column) => (
                  <SelectItem
                    key={column.key}
                    value={column.key}
                    disabled={selectMetrics.some(
                      (metric) => metric.column === column.key
                    )}
                  >
                    {column.title}
                  </SelectItem>
                ))
              ) : (
                <span className="my-1 !text-xs flex items-center justify-center">
                  No columns found
                </span>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 mt-2">
          <label
            htmlFor="aggregate-function"
            className="text-xs font-semibold text-black"
          >
            AGGREGATE FUNCTION:
          </label>
          <Select
            value={aggregateFunction}
            onValueChange={(value) => {
              setAggregateFunction(value);
            }}
          >
            <SelectTrigger className="border-0 bg-gray-200 h-10 focus:ring-transparent rounded-full text-sm text-black px-5">
              <SelectValue placeholder="Select an aggregate function" />
            </SelectTrigger>
            <SelectContent>
              {isColumnNumeric(selectedColumn || "") ? (
                <>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="max">Max</SelectItem>
                  <SelectItem value="min">Min</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                </>
              ) : (
                <SelectItem value="count">Count</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleMetrics(selectedColumn || "", aggregateFunction)
            }
            disabled={availableColumns.length === 0 || !selectedColumn}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetricsModal;
