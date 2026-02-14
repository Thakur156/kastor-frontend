import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  containerClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [operator, setOperator] = useState("==");
  const [inputSearchTerm, setInputSearchTerm] = useState(""); // Input state for user input
  const [searchTerm, setSearchTerm] = useState(""); // Actual term used for filtering
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const [filteredData, setFilteredData] = useState(data);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const applyCustomFilter = () => {
    setSearchTerm(inputSearchTerm); // Set the actual search term for filtering
    const filtered = data.filter((row) => {
      return Object.values(row).some((value) => {
        const valueToCompare = String(value);
        switch (operator) {
          case "==":
            return (
              valueToCompare.toLowerCase() === inputSearchTerm.toLowerCase()
            );
          case ">=":
            // return Number(valueToCompare) >= Number(inputSearchTerm);
            return valueToCompare &&
              !isNaN(Number(valueToCompare)) &&
              !isNaN(Number(searchTerm))
              ? Number(valueToCompare) >= Number(searchTerm)
              : false;

          case "<=":
            return Number(valueToCompare) <= Number(inputSearchTerm);
          // Add more operators as needed
          default:
            return false;
        }
      });
    });
    setFilteredData(filtered);
  };

  const isHighlighted = (cellValue: string) => {
    if (!searchTerm || !cellValue) return false;
    switch (operator) {
      case "==":
        return cellValue.toLowerCase() === searchTerm.toLowerCase();
      // Check if the cell value is number and compare it with the search term

      case ">=":
        cellValue && !isNaN(Number(cellValue)) && !isNaN(Number(searchTerm))
          ? Number(cellValue) >= Number(searchTerm)
          : false;

      case "<=":
        return Number(cellValue) <= Number(searchTerm);
      default:
        return false;
    }
  };

  return (
    <>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Search Term"
          value={inputSearchTerm} // Bind to the input state
          onChange={(e) => setInputSearchTerm(e.target.value)} // Update input state
          className="border rounded px-2"
        />
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="border rounded px-2"
        >
          <option value="==">==</option>

          {/* Add more operators as needed */}
        </select>
        <input
          type="color"
          value={highlightColor}
          onChange={(e) => setHighlightColor(e.target.value)}
          className="border rounded"
        />
        <button
          onClick={applyCustomFilter}
          className="bg-blue-500 text-white rounded px-4"
        >
          Apply
        </button>
      </div>
      <input
        type="text"
        placeholder="Search"
        onChange={(e) => setGlobalFilter(String(e.target.value))}
        className="w-full h-12 px-4 rounded-lg border border-Stroke my-3"
      />
      <div
        className={cn(
          "rounded-[20px] border border-Stroke overflow-hidden",
          containerClassName
        )}
      >
        <Table>
          <TableHeader className="bg-Gray">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const value = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    );

                    const cellValue = String(row.original[cell.column.id]);
                    const isMatch = isHighlighted(cellValue);

                    return (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap"
                        style={{
                          backgroundColor: isMatch
                            ? highlightColor
                            : "transparent",
                        }}
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
