import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  Search,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from "lucide-react";

interface TableRow {
  [key: string]: unknown;
}

interface TableComponentProps {
  data: TableRow[];
  title?: string;
}

interface IndeterminateCheckboxProps {
  indeterminate?: boolean;
  checked?: boolean;
  onChange?: (event: unknown) => void;
  disabled?: boolean;
}

const TableComponent = ({ data, title = "Table" }: TableComponentProps) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isColumnVisibilityOpen, setIsColumnVisibilityOpen] = useState(false);

  const columnHelper = createColumnHelper<TableRow>();

  // Create selection column and automatically generate data columns
  const columns = useMemo(() => {
    // Handle empty data case in useMemo
    if (!data || !data.length) {
      return [];
    }

    // First, create selection column
    const selectionColumn = columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="px-1">
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      enableSorting: false,
      enableResizing: false,
      minSize: 40,
      maxSize: 60,
    });

    // Then create columns from data
    const dataColumns = Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: () => {
        // Format header text - convert camelCase to Title Case with spaces
        const formatted = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        return <div className="flex items-center">{formatted}</div>;
      },
      cell: (info: { getValue: () => unknown }) => {
        const value = info.getValue();
        // Format cell values based on their type
        if (value === null || value === undefined) return "-";
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (typeof value === "number") return value.toLocaleString();
        // Color code cells based on value patterns
        if (typeof value === "string") {
          if (value.toLowerCase().includes("high"))
            return <span className="text-red-600 font-medium">{value}</span>;
          if (value.toLowerCase().includes("low"))
            return <span className="text-indigo-600 font-medium">{value}</span>;
          if (value.toLowerCase().includes("medium"))
            return <span className="text-amber-600 font-medium">{value}</span>;
        }
        return String(value);
      },
      enableResizing: false,
      size: 80,
    }));

    return [selectionColumn, ...dataColumns];
  }, [data, columnHelper]);

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    enableColumnResizing: false,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  // Custom checkbox component for row selection
  function IndeterminateCheckbox({
    indeterminate,
    checked = false,
    onChange,
    disabled = false,
    ...rest
  }: IndeterminateCheckboxProps) {
    return (
      <button
        type="button"
        className={`text-indigo-600 focus:outline-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={disabled ? undefined : onChange}
        {...rest}
      >
        {checked ? (
          <CheckSquare size={18} className="transition-all" />
        ) : (
          <Square
            size={18}
            className={`transition-all ${
              indeterminate ? "text-indigo-400" : ""
            }`}
          />
        )}
      </button>
    );
  }

  // Handle empty data gracefully
  if (!data || !data.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-md p-4 text-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-lg">
      {/* Table Header with Title, Search and Column Visibility */}
      <div className="p-4 border-b border-gray-200 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={globalFilter || ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search all columns..."
              className="w-full p-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setIsColumnVisibilityOpen(!isColumnVisibilityOpen)}
              className="p-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 text-gray-700 flex items-center gap-1"
              aria-expanded={isColumnVisibilityOpen}
              aria-haspopup="true"
            >
              <SlidersHorizontal size={16} />
            </button>

            {isColumnVisibilityOpen && (
              <div className="absolute right-0 z-50 mt-2  origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                    Toggle Columns
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {table.getAllLeafColumns().map((column) => {
                      // Skip selection column from toggle menu
                      if (column.id === "select") return null;

                      return (
                        <div key={column.id} className="px-1 py-1">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={column.getIsVisible()}
                              onChange={column.getToggleVisibilityHandler()}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {column.id
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="bg-indigo-50 p-3 flex justify-between items-center">
          <div className="text-sm text-indigo-800">
            <span className="font-medium">
              {Object.keys(rowSelection).length}
            </span>{" "}
            {Object.keys(rowSelection).length === 1 ? "row" : "rows"} selected
          </div>
          <button
            onClick={() => setRowSelection({})}
            className="text-sm text-indigo-700 hover:text-indigo-900 font-medium"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table Container */}
      <div
        className="overflow-auto"
        style={{ maxHeight: "calc(100vh - 260px)" }}
      >
        <table className="w-full whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gray-50 border-b border-gray-200"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-sm font-semibold text-gray-700 text-left"
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          } flex items-center gap-1`}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              const handler = header.column.getToggleSortingHandler();
                              if (handler) handler(e);
                            }
                          }}
                          role={header.column.getCanSort() ? "button" : undefined}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                          aria-label={header.column.getCanSort() ? `Sort by ${header.id}` : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {/* Sort indicators */}
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === "asc" && (
                              <ChevronUp size={16} />
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`
                    border-b border-gray-200 
                    ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    ${
                      row.getIsSelected()
                        ? "bg-indigo-50 hover:bg-indigo-100"
                        : "hover:bg-gray-100"
                    }
                    transition-colors
                  `}
                  onClick={() => {
                    if (!row.getCanSelect()) return;
                    row.toggleSelected();
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-3 text-sm text-gray-700"
                      // Prevent row selection when clicking on checkbox cell
                      onClick={
                        cell.column.id === "select"
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-gray-500"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Stats */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {table.getFilteredRowModel().rows.length} of{" "}
          {table.getPreFilteredRowModel().rows.length} total rows
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {Object.keys(rowSelection).length > 0
              ? `${Object.keys(rowSelection).length} rows selected`
              : "No rows selected"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
