import { ArrowUpDown } from "lucide-react";

export const getSafeValue = (value: unknown): string | string[] => {
  if (value == null) {
    return "";
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);

    return keys.map((key) =>
      Array.isArray((value as Record<string, unknown>)[key]) 
        ? ((value as Record<string, unknown>)[key] as unknown[]).join(",") 
        : String((value as Record<string, unknown>)[key])
    );
  }

  // Return the value as a string for other types
  return String(value);
};

// Convert API columns to ColumnDef[]
export function createColumnDefs(apiColumns: string[]) {
  return apiColumns.map((key: string) => ({
    accessorKey: key,
    header: ({ column }) => (
      <div
        className="flex items-center cursor-pointer capitalize"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            column.toggleSorting(column.getIsSorted() === "asc");
          }
        }}
        tabIndex={0}
        role="button"
      >
        {key}
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </div>
    ),
    cell: ({ row }) => {
      return <div>{getSafeValue(row.getValue(key))}</div>;
    },
  }));
}
