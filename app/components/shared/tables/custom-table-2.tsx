import { cn } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TableRow as DataRow } from "~/components/analyst/catalog-tables";

interface CustomTableProps {
  data: DataRow[];
  columns: string[];
  containerClassName?: string;
  className?: string;
}

const CustomTable2 = ({
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
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="whitespace-nowrap">
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column, index) => (
                <TableCell key={index} className="text-sm text-[#475467] p-5">
                  {String(row[column] ?? "null")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomTable2;
