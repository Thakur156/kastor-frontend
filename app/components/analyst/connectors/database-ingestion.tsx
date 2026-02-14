import { lazy, Suspense, useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  File,
  FolderSearch,
  Minus,
  Share2,
} from "lucide-react";
import { flattenTree } from "react-accessible-treeview";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/use-toast";
import Loader from "~/components/shared/loader";
import axiosInstance from "~/services/axios-instance";
import { Link } from "@remix-run/react";

const TreeView = lazy(() =>
  import("react-accessible-treeview").then((module) => ({
    default: module.default,
  }))
);

interface TableData {
  columns: string[];
  primary_keys: string[];
}

interface DatabaseData {
  [tableName: string]: TableData;
}

interface Connection {
  name: string;
  API_Url: string;
  [key: string]: unknown;
}

interface DbDetails {
  [key: string]: unknown;
}

interface TransformedTableData {
  id: string;
  name: string;
  children: {
    name: string;
    id: string;
    parent: string;
  }[];
}

interface DatabaseIngestionProps {
  data: DatabaseData;
  connection: Connection;
  dbDetails: DbDetails;
}

function DatabaseIngestion({
  data,
  connection,
  dbDetails,
}: DatabaseIngestionProps) {
  const [transformedData, setTransformedData] = useState<TransformedTableData[]>([]);
  const [tables, setTables] = useState<DatabaseData>({});
  const [selectedTables, setSelectedTables] = useState<{
    [key: string]: {
      columns: string[];
      primary_keys: string[];
    };
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch tables data from the connection
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      setTables(data);
      const transformed = transformData(data);
      setTransformedData(transformed);
    }
  }, [data]);

  // Function to transform the data to the tree view format
  const transformData = (data: DatabaseData): TransformedTableData[] => {
    const tables = Object.keys(data).map((key) => ({
      id: key,
      name: key,
      children: data[key].columns.map((column: string) => ({
        name: column,
        id: `${key}-${column}`,
        parent: key,
      })),
    }));

    return tables;
  };

  // Function to handle the ingestion of the data
  const handleIngestion = async () => {
    if (Object.keys(selectedTables).length === 0) {
      toast({
        description: "Please select tables to ingest",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiBody = {
        db_details: dbDetails,
        ingest_payload: {
          tables_columns_dict: selectedTables,
        },
      };

      const response = await axiosInstance.post(
        `${connection.API_Url}/ingest`,
        apiBody
      );

      if (response.data && !response.data.is_error) {
        toast({
          description: response.data[1] || "Data ingested successfully",
        });
      } else {
        toast({
          description:
            response.data.message ||
            "An error occurred while ingesting the data",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Error during ingestion:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred while ingesting the data";
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text:xl md:text-2xl font-semibold text-Black">
        {connection.name} Tables
      </h2>
      <div className="p-[30px] rounded-[20px] border border-[#E5E5E5] bg-Gray">
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            {tables && (
              <TreeView
                data={flattenTree({
                  name: "Tables",
                  children: transformedData,
                })}
                aria-label="Checkbox tree"
                multiSelect
                propagateSelect
                propagateSelectUpwards
                togglableSelect
                onNodeSelect={(node) => {
                  if (node.isSelected) {
                    if (node.isBranch) {
                      // Table selected
                      const tableName = node.element.name;
                      setSelectedTables((prevSelectedTables) => ({
                        ...prevSelectedTables,
                        [tableName]: {
                          columns: tables[tableName].columns,
                          primary_keys: tables[tableName].primary_keys,
                        },
                      }));
                    } else {
                      // Column selected
                      const tableName = node.element.parent;
                      const columnName = node.element.name;
                      setSelectedTables((prevSelectedTables) => {
                        const prevTable = prevSelectedTables[tableName] || {
                          columns: [],
                          primary_keys: tables[tableName].primary_keys,
                        };
                        return {
                          ...prevSelectedTables,
                          [tableName]: {
                            ...prevTable,
                            columns: [...prevTable.columns, columnName],
                          },
                        };
                      });
                    }
                  } else {
                    if (node.isBranch) {
                      // Table deselected
                      const tableName = node.element.name;
                      setSelectedTables((prevSelectedTables) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [tableName]: _, ...rest } = prevSelectedTables;
                        return rest;
                      });
                    } else {
                      // Column deselected
                      const tableName = node.element.parent;
                      const columnName = node.element.name;
                      setSelectedTables((prevSelectedTables) => {
                        const prevTable = prevSelectedTables[tableName];
                        if (!prevTable) {
                          return prevSelectedTables;
                        }
                        const newColumns = prevTable.columns.filter(
                          (col) => col !== columnName
                        );
                        if (newColumns.length === 0) {
                          // If no columns left, remove the table
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { [tableName]: _, ...rest } =
                            prevSelectedTables;
                          return rest;
                        }
                        return {
                          ...prevSelectedTables,
                          [tableName]: {
                            ...prevTable,
                            columns: newColumns,
                            primary_keys: prevTable.primary_keys,
                          },
                        };
                      });
                    }
                  }
                }}
                nodeRenderer={({
                  element,
                  isBranch,
                  isExpanded,
                  isSelected,
                  isHalfSelected,
                  getNodeProps,
                  level,
                  handleSelect,
                  handleExpand,
                }) => {
                  return (
                    <div
                      {...getNodeProps({ onClick: handleExpand })}
                      style={{ marginLeft: 20 * (level - 1) }}
                      className="flex items-center gap-2 mb-2"
                    >
                      {isBranch && (
                        <ChevronRight
                          size={18}
                          className={cn(
                            "text-darkGray",
                            isExpanded && "rotate-90"
                          )}
                        />
                      )}
                      <CheckBoxIcon
                        onClick={(e: React.MouseEvent) => {
                          handleSelect(e);
                          e.stopPropagation();
                        }}
                        variant={
                          isHalfSelected ? "some" : isSelected ? "all" : "none"
                        }
                      />
                      <span className="text-base text-Black flex items-center gap-x-2">
                        {level === 1 ? (
                          <FolderSearch size={20} className="text-Blue" />
                        ) : isBranch ? (
                          <Share2 size={20} className="text-Green" />
                        ) : (
                          <File size={20} className="text-darkGray" />
                        )}
                        {element.name}
                      </span>
                    </div>
                  );
                }}
              />
            )}
          </Suspense>
        </div>
      </div>
      <div className="flex items-center justify-end gap-5 mt-5">
        {isLoading ? (
          <p className="text-sm font-semibold text-Black">
            Ingestion will take some time...
          </p>
        ) : (
          <Link to="/sources">
            <Button variant="secondary" className="w-fit">
              Back
            </Button>
          </Link>
        )}
        <Button
          variant={"primary"}
          size="primary"
          className="w-fit flex items-center gap-2"
          onClick={handleIngestion}
          disabled={Object.keys(selectedTables).length === 0 || isLoading}
        >
          {isLoading && <Loader size={18} />}
          Ingest Tables
        </Button>
      </div>
    </div>
  );
}

interface CheckBoxIconProps {
  variant: "all" | "none" | "some";
  onClick?: (e: React.MouseEvent) => void;
}

const CheckBoxIcon = ({ variant, ...rest }: CheckBoxIconProps) => {
  switch (variant) {
    case "all":
      return (
        <div
          className="h-5 w-5 bg-Blue rounded cursor-pointer grid place-items-center text-white overflow-hidden"
          {...rest}
        >
          <Check size={12} />
        </div>
      );
    case "none":
      return (
        <div
          className="h-5 w-5 border border-[#D0D5DD] rounded cursor-pointer"
          {...rest}
        ></div>
      );
    case "some":
      return (
        <div
          className="h-5 w-5 bg-Blue rounded cursor-pointer grid place-items-center text-white overflow-hidden"
          {...rest}
        >
          <Minus size={12} />
        </div>
      );
    default:
      return null;
  }
};

export default DatabaseIngestion;
