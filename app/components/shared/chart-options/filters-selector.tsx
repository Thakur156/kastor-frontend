import React from "react";
import { X, ChevronRight } from "lucide-react";

interface FiltersSelectorProps {
  selectFilters: { column: string; filterType: string; filterValue: string }[];
  removeFilter: (
    column: string,
    filterType: string,
    filterValue: string
  ) => void;
  handleFilterModal: () => void;
}

const FiltersSelector: React.FC<FiltersSelectorProps> = ({
  selectFilters,
  removeFilter,
  handleFilterModal,
}) => {
  const handleRemove = (
    filterColumn: string,
    filterType: string,
    filterValue: string
  ) => {
    removeFilter(filterColumn, filterType, filterValue);
  };

  return (
    <div className="space-y-2 mt-2">
      <label
        htmlFor="filters"
        className="text-xs font-semibold text-black uppercase"
      >
        Filters:
      </label>
      <div className="relative">
        {selectFilters.length > 0 ? (
          selectFilters.map((filter) => (
            <div
              className="my-3 border-0 bg-gray-200 h-10 flex items-center justify-between focus:ring-transparent rounded-full text-sm text-black px-5"
              key={`${filter.column}-${filter.filterType}-${filter.filterValue}`}
            >
              <span>
                <strong>{filter.column}</strong> {filter.filterType}{" "}
                {filter.filterValue}
              </span>
              <button
                className="cursor-pointer"
                onClick={() =>
                  handleRemove(
                    filter.column,
                    filter.filterType,
                    filter.filterValue
                  )
                }
                aria-hidden="true"
                aria-label={`Remove filter: ${filter.column} ${filter.filterType} ${filter.filterValue}`}
              >
                <X size={15} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm">No filters selected</div>
        )}
        <div
          className="border-0 bg-gray-200 h-10 flex items-center justify-between focus:ring-transparent rounded-full text-sm text-black px-5 cursor-pointer hover:bg-gray-300 hover:border hover:border-primary"
          onClick={handleFilterModal}
          role="none"
        >
          <span>Select filters here</span>
          <ChevronRight size={15} />
        </div>
      </div>
    </div>
  );
};

export default FiltersSelector;
