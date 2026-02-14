import { cn } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface CustomTableProps {
  data: { [key: string]: unknown[] };
  columns: string[];
  containerClassName?: string;
  className?: string;
}

const CustomTable3 = ({
  data,
  columns,
  containerClassName,
  className,
}: CustomTableProps) => {
  const hasData = data && columns.length > 0 && data[columns[0]]?.length > 0;

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
          {hasData ? (
            data[columns[0]].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className="text-sm text-[#475467] p-5"
                  >
                    {data[column][rowIndex] !== undefined
                      ? String(data[column][rowIndex])
                      : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-sm text-[#475467] p-5 text-center"
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomTable3;
