import { cn } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Pen, Trash2 } from "lucide-react";
import { getSafeValue } from "~/lib/generate-columns";
import { Switch } from "../../ui/switch";
import { TableRow as DataRow } from "~/components/analyst/catalog-tables";

interface CustomTableProps {
  data: DataRow[];
  columns: { key: string; title: string }[];
  containerClassName?: string;
  className?: string;
}

const CustomTable = ({
  data,
  columns,
  containerClassName,
  className,
}: CustomTableProps) => {
  return (
    <div
      className={cn(
        "border border-Stroke rounded-[20px] overflow-hidden",
        containerClassName
      )}
    >
      <Table className={cn("", className)}>
        <TableHeader className="bg-Gray whitespace-nowrap">
          <TableRow className="w-full">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className="text-sm font-medium text-Black px-5"
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="whitespace-nowrap">
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column, index) => (
                <TableCell key={index} className="text-sm text-[#475467] p-5">
                  {column.key === "actions" ? (
                    <div className="flex items-center gap-2">
                      <Trash2 size={20} />
                      <Pen size={20} />
                    </div>
                  ) : column.key === "enabled" ? (
                    <Switch defaultChecked={Boolean(row.isActive)} />
                  ) : Array.isArray(row[column.key]) ? (
                    (row[column.key] as unknown[]).join(", ")
                  ) : (
                    getSafeValue(row[column.key])
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomTable;
