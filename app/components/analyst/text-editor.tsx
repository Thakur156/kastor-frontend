import { lazy, Suspense, useState } from "react";

import { Play, Save, SaveAll, Trash2 } from "lucide-react";

import { toast } from "~/components/ui/use-toast";

import "react-quill/dist/quill.snow.css";
import CustomTooltip from "~/components/shared/custom-tooltip";
import Loader from "../shared/loader";
import GraphOptions from "../shared/chart-options/graph-options";
import PagePagination from "../shared/pagination";
import { getCookie } from "~/lib/utils";
import { jwtDecode } from "jwt-decode";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "~/services/firebase";
import CustomTable from "../shared/tables/custom-table";
import { Button } from "../ui/button";
const QuillWrapper = lazy(() =>
  import("react-quill").then((module) => ({ default: module.default }))
);

import { CellObj } from "~/lib/types";
import { TableRow } from "./catalog-tables";
import { GraphOptions as GraphOptionsType } from "./sql-editor";

interface TextEditorProps {
  cellIndex: number;
  setCells: React.Dispatch<React.SetStateAction<CellObj[]>>;
  cells: CellObj[];
  defaultValue: string;
  deleteCell: (index: number) => void;
  handlePlay: (
    query: string,
    selectedNamespace: string,
    selectedTable: string,
    currentPage?: number
  ) => Promise<{
    message: string;
    data: TableRow[];
    error?: string;
    pagination: {
      current_page: number;
      next_page: boolean;
      has_more: boolean;
      total_pages: number;
      total_records: number;
    };
  }>;
  defaultColumns?: { title: string; key: string }[];
  defaultData?: TableRow[];
  graphOptions?: GraphOptionsType;
  shareData: CellObj[];
  setShareData: React.Dispatch<React.SetStateAction<CellObj[]>>;
  defaultPagination?: {
    current_page: number;
    next_page: boolean;
    has_more: boolean;
    total_pages: number;
    total_records: number;
  };
  show?: "both" | "table" | "graph";
}

const TextEditor = ({
  cellIndex,
  setCells,
  defaultValue,
  deleteCell,
  handlePlay,
  shareData,
  setShareData,
  defaultColumns,
  defaultData,
  graphOptions,
  defaultPagination,
  show = "both",
}: TextEditorProps) => {
  const [value, setValue] = useState<string>(defaultValue || "");

  const [columns, setColumns] = useState<{ key: string; title: string }[]>(
    defaultColumns || []
  );
  const [data, setData] = useState<TableRow[]>(defaultData || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showGraphOptions, setShowGraphOptions] = useState<boolean>(
    graphOptions ? true : false
  );

  const [pagination, setPagination] = useState<null | {
    current_page: number;
    next_page: boolean;
    has_more: boolean;
    total_pages: number;
    total_records: number;
  }>(defaultPagination || null);

  const handleValueChange = (value: string) => {
    setValue(value);
    setCells((prev) => {
      const newCells = [...prev];
      newCells[cellIndex].query = value;
      return newCells;
    });
  };

  // Function to extract text with spaces between elements
  const extractTextWithSpaces = (node: Node) => {
    let text = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        text += extractTextWithSpaces(child) + " ";
      }
    });
    return text;
  };

  const handleRunQuery = async (current = 1) => {
    if (!value) return;
    try {
      setIsLoading(true);
      const parser = new DOMParser();
      const doc = parser.parseFromString(value, "text/html");
      const text = extractTextWithSpaces(doc.body).trim();

       // 1. Extract CTE names from WITH clause
       const ctePattern = /\bWITH\s+([\w_]+)\s+AS\s*\(/gi;
       const cteNames = [];
       let cteMatch;
       while ((cteMatch = ctePattern.exec(text)) !== null) {
         cteNames.push(cteMatch[1]);
       }
     // Extract namespace and table from the query
     const pattern = /\b(FROM|JOIN)\s+(?!\()\s*([\w.]+)/gi;
     let match;
     let selectedNamespace;
     let selectedTable;
     while ((match = pattern.exec(text)) !== null) {
       const tableName = match[2];
       [selectedNamespace, selectedTable] = tableName.split(".");
         // Skip if it's a CTE or subquery
       const baseTable = tableName.split(".").pop(); // last part if schema.table
       if (cteNames.includes(tableName) || cteNames.includes(baseTable)) {
         continue;
       }

        if (!tableName.includes("."))  {
          setIsLoading(false);
          return toast({
            description:
              "Please specify both namespace and table in the query (e.g., namespace.table).",
            variant: "destructive",
          });
        }
      }

        const response = await handlePlay(
          text,
          selectedNamespace,
          selectedTable,
          current
        );

        if (response?.error) {
          setColumns([]);
          setData([]);
          return toast({
            description: response.error,
            variant: "destructive",
          });
        }
        toast({
          description: response.message,
        });

        // Dynamically generate columns from API response
        const columns = Object.keys(response.data[0]).map((key) => ({
          key,
          title: key,
        }));

        // Set data for the table
        setColumns(columns);
        setData(response.data);
        setPagination(response?.pagination);

        // Update shareData with the query
        // Setting share data
        const findCell = shareData.findIndex(
          (cell) => cell.cellId === cellIndex.toString()
        );
        setShareData(() => {
          if (findCell > -1) {
            const updatedCells = [...shareData];
            updatedCells[findCell] = {
              cellId: cellIndex.toString(),
              query: text,
              columns,
              data: response.data,
              cellType: "text",
              pagination: response.pagination,
            };
            return updatedCells;
          }
          return [
            ...shareData,
            {
              cellId: cellIndex.toString(),
              query: text,
              columns,
              data: response.data,
              cellType: "text",
              pagination: response.pagination,
            },
          ];
        });
      
    } catch (error) {
      console.error("Error executing query:", error);
      toast({
        description: "An error occurred while executing the query.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    if (
      pageNumber < 1 ||
      pageNumber > (pagination?.total_pages || 0) ||
      pageNumber === pagination?.current_page
    )
      return;
    handleRunQuery(pageNumber);
  };

  const handleSaveCell = async (showType: string = "both") => {
    try {
      setLoading(true);
      const cellData = shareData[cellIndex];
      if (!cellData) {
        return toast({
          description: "No data to save.",
          variant: "destructive",
        });
      }
      if (showType === "graph" && !cellData.graphOptions) {
        return toast({
          description: "Please select a graph type to save.",
          variant: "destructive",
        });
      }
      const idToken = getCookie("idToken");

      // Decode the JWT to get the user's email
      const decodedToken = jwtDecode<{ email: string }>(
        decodeURIComponent(idToken)
      );
      const email = decodedToken.email;

      if (!idToken) {
        return toast({
          description: "Please login to save the query.",
          variant: "destructive",
        });
      }
      const savedQueryObj = {
        notebook: [{ ...cellData, show: showType }],
        name: "Untitled " + (showType === "both" ? "Cell" : showType),
        savedBy: email,
        savedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "saveNotebooks"), savedQueryObj);
      toast({
        description:
          showType === "both"
            ? "Cell saved successfully"
            : showType + " saved successfully",
      });
    } catch (error) {
      console.error("Error saving the query:", error);
      toast({
        description: "An error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 mt-5 border rounded-[20px] p-6 bg-Gray">
      <div className="bg-white p-5 rounded-[20px] border border-Stroke flex  justify-between gap-x-2">
        <Suspense fallback={<div>Loading...</div>}>
          <QuillWrapper
            theme="snow"
            value={value}
            onChange={handleValueChange}
            className="custom-quill no-borders"
          />
        </Suspense>
        <div className=" flex items-start gap-x-2">
          <CustomTooltip
            trigger={
              loading ? (
                <Loader size={18} />
              ) : (
                <SaveAll
                  size={18}
                  onClick={() => handleSaveCell("both")}
                  className="cursor-pointer"
                />
              )
            }
            content="Save Cell"
          />
          <CustomTooltip
            trigger={
              <Trash2
                size={18}
                onClick={() => deleteCell(cellIndex)}
                className="cursor-pointer"
              />
            }
            content="Delete Cell"
          />

          {isLoading ? (
            <Loader size={18} />
          ) : (
            <CustomTooltip
              trigger={
                <Play
                  size={20}
                  className="text-Blue cursor-pointer"
                  onClick={() => handleRunQuery(1)}
                />
              }
              content="Run Query"
            />
          )}
          <CustomTooltip trigger={<Save size={20} />} content="Save Query" />
        </div>
      </div>
      {isLoading ? (
        <div className="w-full grid place-items-center bg-white p-5 border border-Stroke rounded-[20px]">
          <Loader />
        </div>
      ) : columns?.length > 0 && (show === "both" || show === "table") ? (
        <>
          <div
            id={`custom-table-${cellIndex}`}
            className="bg-white flex flex-col justify-end p-3 px-5 border border-Stroke rounded-2xl"
          >
            <div className="flex items-end justify-end mb-4">
              <CustomTooltip
                trigger={
                  loading ? (
                    <Loader size={18} />
                  ) : (
                    <SaveAll
                      size={18}
                      onClick={() => handleSaveCell("table")}
                      className="cursor-pointer"
                    />
                  )
                }
                content="Save Table"
              />
            </div>
            <CustomTable
              columns={columns}
              data={data}
              containerClassName="max-h-[300px] overflow-y-auto"
            />
            <PagePagination
              currentPage={pagination?.current_page}
              totalPages={pagination?.total_pages}
              handlePageChange={handlePageChange}
            />
          </div>
        </>
      ) : null}
      {!showGraphOptions && columns?.length > 0 && (
        <Button
          className="rounded-2xl"
          onClick={() => setShowGraphOptions(true)}
        >
          Create Graphs
        </Button>
      )}
      {showGraphOptions &&
        (show === "both" || show === "graph") &&
        !isLoading && (
          <GraphOptions
            columns={columns}
            data={data}
            shareData={shareData}
            setShareData={setShareData}
            graphOptions={graphOptions}
            isGraphVisible={!!graphOptions}
            index={cellIndex}
          />
        )}
    </div>
  );
};

export default TextEditor;
