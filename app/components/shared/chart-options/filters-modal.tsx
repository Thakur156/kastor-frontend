import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  numericColumns: { key: string; title: string }[];
  nonNumericColumns: { key: string; title: string }[];
  handleFilters: (
    column: string,
    filterType: string,
    filterValue: string
  ) => void;
  error: string;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  numericColumns,
  nonNumericColumns,
  handleFilters,
  error,
}) => {
  const [filterColumn, setFilterColumn] = useState<string | undefined>(
    undefined
  );
  const [filterType, setFilterType] = useState("equal");
  const [filterValue, setFilterValue] = useState<string | string[]>("");

  useEffect(() => {
    if (numericColumns.length > 0 || nonNumericColumns.length > 0) {
      setFilterColumn(numericColumns[0]?.key || nonNumericColumns[0]?.key);
    }
  }, [numericColumns, nonNumericColumns]);

  if (!isOpen) return null;

  // Check if the selected column is non-numeric
  const isColumnNonNumeric = nonNumericColumns.some(
    (col) => col.key === filterColumn
  );

  // Define filter options based on column type
  const numericFilterTypes = [
    { value: "equal", label: "Equal to (=)" },
    { value: "notEqual", label: "Not equal to (≠)" },
    { value: "lessThan", label: "Less than (<)" },
    { value: "lessOrEqual", label: "Less or equal (≤)" },
    { value: "greaterThan", label: "Greater than (>)" },
    { value: "greaterOrEqual", label: "Greater or equal (≥)" },
    { value: "between", label: "Between" },
  ];

  const nonNumericFilterTypes = [
    { value: "equal", label: "Equal to" },
    { value: "notEqual", label: "Does not equal" },
    { value: "contains", label: "Contains" },
    { value: "beginsWith", label: "Begins with" },
    { value: "endsWith", label: "Ends with" },
    { value: "between", label: "Between" },
  ];

  const filterTypes = isColumnNonNumeric
    ? nonNumericFilterTypes
    : numericFilterTypes;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">Select Filter</h2>
          <span
            className="border p-1 rounded-full cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          >
            <X size={20} />
          </span>
        </div>

        {/* Column Selector */}
        <div className="space-y-2 mt-2">
          <label
            htmlFor="filter-column"
            className="text-xs font-semibold text-black"
          >
            COLUMN:
          </label>
          <Select
            value={filterColumn}
            onValueChange={(value) => setFilterColumn(value)}
          >
            <SelectTrigger className="border-0 bg-gray-200 h-10 focus:ring-transparent rounded-full text-sm text-black px-5">
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {[...numericColumns, ...nonNumericColumns].map((column) => (
                <SelectItem key={column.key} value={column.key}>
                  {column.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Type Selector */}
        {filterColumn && (
          <div className="space-y-2 mt-2">
            <label
              htmlFor="filter-type"
              className="text-xs font-semibold text-black"
            >
              FILTER TYPE:
            </label>
            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value);
                setFilterValue("");
              }}
            >
              <SelectTrigger className="border-0 bg-gray-200 h-10 focus:ring-transparent rounded-full text-sm text-black px-5">
                <SelectValue placeholder="Select a filter type" />
              </SelectTrigger>
              <SelectContent>
                {filterTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filter Value Input */}
        {filterType && (
          <div className="space-y-2 mt-2">
            <label
              htmlFor="filter-value"
              className="text-xs font-semibold text-black"
            >
              FILTER VALUE:
            </label>
            {/* Input for "Between" filter type */}
            {filterType === "between" ? (
              <div className="flex space-x-2">
                <input
                  placeholder="Start value"
                  type={isColumnNonNumeric ? "text" : "number"}
                  className="border-0 bg-gray-200 h-10 w-full focus:ring-transparent rounded-full text-sm text-black px-5"
                  value={Array.isArray(filterValue) ? filterValue[0] : ""}
                  onChange={(e) => {
                    const startValue = e.target.value;
                    setFilterValue([
                      startValue,
                      Array.isArray(filterValue) ? filterValue[1] : "",
                    ]);
                  }}
                />
                <input
                  placeholder="End value"
                  type={isColumnNonNumeric ? "text" : "number"}
                  className="border-0 bg-gray-200 h-10 w-full focus:ring-transparent rounded-full text-sm text-black px-5"
                  value={Array.isArray(filterValue) ? filterValue[1] : ""}
                  onChange={(e) => {
                    const endValue = e.target.value;
                    setFilterValue([
                      Array.isArray(filterValue) ? filterValue[0] : "",
                      endValue,
                    ]);
                  }}
                />
              </div>
            ) : (
              <input
                placeholder="Enter filter value"
                type={isColumnNonNumeric ? "text" : "number"}
                className="border-0 bg-gray-200 h-10 w-full focus:ring-transparent rounded-full text-sm text-black px-5"
                value={typeof filterValue === "string" ? filterValue : ""}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Modal Actions */}
        <div className="mt-3 flex justify-between items-center">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleFilters(
                filterColumn || "",
                filterType,
                Array.isArray(filterValue)
                  ? filterValue.join(" - ")
                  : filterValue
              )
            }
            disabled={!filterColumn || !filterType || !filterValue}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
