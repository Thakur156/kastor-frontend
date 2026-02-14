import React from "react";
import MultiSelect, { StylesConfig } from "react-select";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectorProps {
  label: string;
  columns: { key: string; title: string }[];
  selectedOptions: readonly SelectOption[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>;
}

const customStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "rgb(229 231 235 / var(--tw-bg-opacity))",
    borderRadius: "20px",
    borderColor: state.isFocused ? "#004096" : "#e2e8f0", // Maintain border color on focus
    boxShadow: state.isFocused ? "0 0 0 2px rgba(0, 64, 150, 0.3)" : "none", // Add boxShadow to indicate focus state
    padding: "1px 10px",
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    minHeight: "42px",
    "&:hover": {
      borderColor: "#004096",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    fontSize: "0.875rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "0.875rem",
    color: "black",
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: "0.875rem",
    color: "#000000",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#004096"
      : state.isFocused
      ? "#e5e7eb"
      : "white",
    color: state.isSelected ? "white" : "black",
    fontSize: "0.875rem",
    padding: "10px 12px",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#004096",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#004096",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.875rem",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "white",
    fontSize: "0.875rem",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "white",
    ":hover": {
      backgroundColor: "#004096",
      color: "white",
    },
    fontSize: "0.875rem",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "10px",
    zIndex: 9999,
    fontSize: "0.875rem",
  }),
};

const MultiSelector: React.FC<MultiSelectorProps> = ({
  label,
  columns,
  selectedOptions,
  setSelectedOptions,
}) => {
  const cache = createCache({
    key: "my-select-cache",
    prepend: true,
  });
  return (
    <div className="space-y-2">
      <label
        htmlFor="chart"
        className="text-xs font-semibold text-black uppercase"
      >
        {label}:
      </label>
      <CacheProvider value={cache}>
        <MultiSelect
          placeholder={`Select ${label.toLowerCase()} here`}
          styles={customStyles}
          classNamePrefix="custom-select"
          options={columns.map((item) => ({
            label: item.title,
            value: item.key,
          }))}
          value={selectedOptions}
          onChange={(value) => {
            setSelectedOptions((value as SelectOption[]) || []);
          }}
          isOptionDisabled={(option) =>
            selectedOptions.some((selected) => selected.value === (option as SelectOption).value)
          }
          isMulti
        />
      </CacheProvider>
    </div>
  );
};

export default MultiSelector;
