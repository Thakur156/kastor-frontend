import { useRef, useState, useEffect } from "react";
import * as monacoEditor from "monaco-editor";
import Editor from "@monaco-editor/react";
import { format } from "sql-formatter";
import { Play, Trash2, AlignRight, SaveAll } from "lucide-react";
import { toast } from "../ui/use-toast";
import CustomTooltip from "../shared/custom-tooltip";
import Loader from "../shared/loader";
import GraphOptions from "../shared/chart-options/graph-options";
import { getCookie } from "~/lib/utils";
import { jwtDecode } from "jwt-decode";
import PagePagination from "../shared/pagination";
import CustomTable from "../shared/tables/custom-table";
import { handleError } from "~/services/axios-instance";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "~/services/firebase";
import { Button } from "../ui/button";

import { CellObj } from "~/lib/types";
import { TableRow } from "./catalog-tables";

// Define proper type for graph options
export interface GraphOptions {
  [key: string]: unknown;
}

interface SqlEditorProps {
  defaultValue: string;
  show?: "both" | "table" | "graph";
  setCells: React.Dispatch<React.SetStateAction<CellObj[]>>;
  cellIndex: number;
  deleteCell: (index: number) => void;
  shareData: CellObj[];
  setShareData: React.Dispatch<React.SetStateAction<CellObj[]>>;
  handlePlay: (
    query: string,
    selectedNamespace: string,
    selectedTable: string,
    currentPage: number
  ) => Promise<{
    message: string;
    data: TableRow[];
    pagination: {
      current_page: number;
      next_page: boolean;
      has_more: boolean;
      total_pages: number;
      total_records: number;
    };
    error?: string;
  }>;
  activeTab: string;
  defaultColumns?: { title: string; key: string }[];
  defaultData?: TableRow[];
  graphOptions?: GraphOptions;
  defaultPagination?: {
    current_page: number;
    next_page: boolean;
    has_more: boolean;
    total_pages: number;
    total_records: number;
  };
}

const SqlEditor = ({
  defaultValue,
  setCells,
  cellIndex,
  deleteCell,
  handlePlay,
  activeTab,
  shareData,
  setShareData,
  defaultColumns,
  defaultData,
  graphOptions,
  defaultPagination,
  show = "both",
}: SqlEditorProps) => {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );
  const [columns, setColumns] = useState<{ key: string; title: string }[]>(
    defaultColumns || []
  );
  const [data, setData] = useState<TableRow[]>(defaultData || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [showGraphOptions, setShowGraphOptions] = useState<boolean>(
    graphOptions ? true : false
  );
  const [loading, setLoading] = useState<boolean>(false);

  const [pagination, setPagination] = useState<null | {
    current_page: number;
    next_page: boolean;
    has_more: boolean;
    total_pages: number;
    total_records: number;
  }>(defaultPagination || null);

  useEffect(() => {
    // Adjust editor height dynamically
    if (editorRef.current) {
      const editorElement = editorRef.current.getDomNode();
      if (editorElement) {
        editorElement.style.height = `${editorRef.current.getContentHeight()}px`;
        editorRef.current.layout();
      }
    }
  }, [defaultValue, activeTab]);

  function handleEditorDidMount(
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) {
    editorRef.current = editor;
    // Customize Monaco Editor theme
    monaco.editor.defineTheme("my-theme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
      },
    });
    monaco.editor.setTheme("my-theme");

    // Set the editor height based on content
    const editorElement = editor.getDomNode();
    if (editorElement) {
      editorElement.style.height = `${editor.getContentHeight()}px`;
      editor.layout();
    }
  }

  async function showValue(currentPage = 1) {
    try {
      setIsLoading(true);

      let editorValue = editorRef.current?.getValue() || defaultValue;

      // Basic empty-query check
      if (
        editorValue.trim() ===
        "-- Write both namespace and table in the query (e.g., namespace.table)."
      ) {
        setIsLoading(false);
        return setError("Please write a query to execute.");
      }
      
      // Normalize query
      editorValue = editorValue.replace(/\s+/g, " ");
      
      // Extract CTE names from WITH clause
      const cteNames = Array.from(
        editorValue.matchAll(/\bWITH\s+([\w-]+)\s+AS\s*\(/gi),
        match => match[1]
      );
      
      // Find namespace.table references from FROM and JOIN clauses
      const tablePattern = /\b(FROM|JOIN)\s+(?!\()\s*([a-zA-Z0-9_.-]+)/gi;
      let selectedNamespace = null;
      let selectedTable = null;
      
      for (const match of editorValue.matchAll(tablePattern)) {
        const tableName = match[2]; // e.g., pollution-1.pollution
      
        // Skip CTEs
        const baseTable = tableName.split(".").pop();
        if (cteNames.includes(tableName) || cteNames.includes(baseTable)) {
          continue;
        }
      
        const parts = tableName.split(".");
        if (parts.length < 2) {
          setIsLoading(false);
          setColumns([]);
          setData([]);
          return setError(
            "Please specify both namespace and table in the query (e.g., namespace.table)."
          );
        }
      
        selectedNamespace = parts.slice(0, -1).join(".");
        selectedTable = parts.at(-1);
        break; 
      }
      
      if (!selectedNamespace || !selectedTable) {
        setIsLoading(false);
        setColumns([]);
        setData([]);
        return setError(
          "Please specify both namespace and table in the query (e.g., namespace.table)."
        );
      }

      setError("");

        const response = await handlePlay(
          editorValue,
          selectedNamespace,
          selectedTable,
          currentPage
        );

      if (response?.error) {
        setColumns([]);
        setData([]);
        return toast({
          description: response.error,
          variant: "destructive",
        });
      }

      // Set data for the table
      const columns = Object.keys(response.data[0]).map((key) => ({
        key,
        title: key,
      }));

      setColumns(columns);
      setData(response.data);
      setPagination(response?.pagination);
      const findCell = shareData.findIndex((cell) => cell.cellId === cellIndex.toString());
      setShareData(() => {
        if (findCell > -1) {
          const updatedCells = [...shareData];
          updatedCells[findCell] = {
            cellId: cellIndex.toString(),
            query: editorValue,
            columns,
            data: response.data,
            cellType: "sql",
            pagination: response?.pagination,
          };
          return updatedCells;
        }
        return [
          ...shareData,
          {
            cellId: cellIndex.toString(),
            query: editorValue,
            columns,
            data: response.data,
            cellType: "sql",
            pagination: response?.pagination,
          },
        ];
      });
    } catch (error) {
      console.error("Error executing query:", error);
      setColumns([]);
      setData([]);
      setShowGraphOptions(false);
      console.log(handleError(error));
      toast({
        description:
          handleError(error) || "An error occurred while executing the query.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleValueChange(value: string | undefined) {
    if (value === undefined) return;
    setCells((prev) => {
      const newCells = [...prev];
      newCells[cellIndex].query = value;
      return newCells;
    });
  }

  function handleFormat() {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      const formattedValue = format(value, {
        language: "spark",
        tabWidth: 2,
        keywordCase: "upper",
        linesBetweenQueries: 2,
      });
      editorRef.current.setValue(formattedValue);
    }
  }

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

  const handlePageChange = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > pagination.total_pages ||
      pageNumber === pagination?.current_page
    )
      return;
    showValue(pageNumber);
  };

  return (
    <div className="space-y-5 mt-5 border rounded-[20px] p-6 bg-Gray">
      <div className="bg-white p-5 rounded-[20px] border border-Stroke">
        <div className="flex justify-between gap-x-2 mb-2">
          <CustomTooltip
            trigger={
              <AlignRight
                size={18}
                className="cursor-pointer"
                onClick={handleFormat}
              />
            }
            content={"Format Query"}
          />

          <div className="flex items-center gap-x-2">
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
                    onClick={() => showValue(1)}
                  />
                }
                content="Run Query"
              />
            )}
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
          </div>
        </div>
        <Editor
          defaultLanguage="sql"
          defaultValue={
            defaultValue ||
            "-- Write both namespace and table in the query (e.g., namespace.table)."
          }
          onMount={handleEditorDidMount}
          onChange={handleValueChange}
          theme="my-theme"
          options={{
            minimap: { enabled: false },
            lineNumbers: "off",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            scrollbar: {
              vertical: "hidden",
              horizontal: "hidden",
              handleMouseWheel: true,
            },
            overviewRulerLanes: 0,
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      {error && (
        <span className="text-red-600 text-sm text-center !w-full">
          {error}
        </span>
      )}
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
            {(columns || data) && (
              <CustomTable
                columns={columns}
                data={data}
                containerClassName="max-h-[300px] overflow-y-auto"
              />
            )}

            <PagePagination
              totalPages={pagination?.total_pages}
              currentPage={pagination?.current_page}
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
        !isLoading &&
        (show === "both" || show === "graph") && (
          <GraphOptions
            columns={columns}
            data={data}
            shareData={shareData}
            setShareData={setShareData}
            index={cellIndex}
            graphOptions={graphOptions}
            isGraphVisible={!!graphOptions}
            handleSaveCell={handleSaveCell}
          />
        )}
    </div>
  );
};

export default SqlEditor;
