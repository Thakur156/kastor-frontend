import { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import SqlEditor from "~/components/analyst/sql-editor";
import TextEditor from "./text-editor";
import { Copy, Plus, SaveAll, Share2, X } from "lucide-react";
import { RunQueryApi } from "~/services/rest-services/query-api";
import CustomTooltip from "~/components/shared/custom-tooltip";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "~/services/firebase";
import Loader from "../shared/loader";
import { Button } from "../ui/button";
import { getCookie } from "~/lib/utils";
import { jwtDecode } from "jwt-decode";
import { toast } from "../ui/use-toast";
import { useParams } from "@remix-run/react";
import { TableRow } from "./catalog-tables";

// Define proper type for graph options
interface GraphOptions {
  [key: string]: unknown;
}

interface CellObj {
  cellId: string;
  show?: "both" | "table" | "graph";
  cellType: string;
  query: string;
  columns?: { title: string; key: string }[];
  data?: TableRow[];
  graphOptions?: GraphOptions;
  pagination?: {
    current_page: number;
    next_page: boolean;
    has_more: boolean;
    total_pages: number;
    total_records: number;
  };
}

interface QueryEngineProps {
  activeTab: string;
  title: string;
  savedCells?: CellObj[];
}

const QueryEngine = ({
  activeTab,
  title,
  savedCells = [],
}: QueryEngineProps) => {
  const params = useParams();
  const [cells, setCells] = useState<CellObj[]>(savedCells);
  const [shareData, setShareData] = useState<CellObj[]>(savedCells);
  const [shareLoading, setShareLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedUrl, setSharedUrl] = useState("");

  const addCell = useCallback((type: string) => {
    setCells((prev) => [
      ...prev,
      { cellType: type, query: "", cellId: Date.now().toString() },
    ]);
  }, []);

  const deleteCell = useCallback((index: number) => {
    setCells((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePlay = useCallback(
    async (
      query: string,
      selectedNamespace: string,
      selectedTable: string,
      currentPage: number
    ) => {
      try {
        const result = await RunQueryApi(
          query,
          selectedNamespace,
          selectedTable,
          currentPage
        );
        return result;
      } catch (error) {
        const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to execute query";

      toast({
        description: message,
        duration: 15000,
        variant: "destructive",
      });
        throw error;
      }
    },
    []
  );

  const handleShare = useCallback(async () => {
    try {
      setShareLoading(true);
      const idToken = getCookie("idToken");
      const decodedToken = jwtDecode<{ email: string }>(
        decodeURIComponent(idToken)
      );
      const email = decodedToken.email;
      if (!email) {
        console.error("Please login to share the notebook");
        return;
      }

      const updatedShareData = shareData.map((cell) => ({
        show: "both",
        graphOptions: cell.graphOptions || null,
        query: cell.query,
        cellType: cell.cellType,
        cellId: cell.cellId,
        columns: cell.columns || null,
        data: cell.data || null,
        pagination: cell.pagination || null,
      }));

      const sharedData = {
        notebook: updatedShareData,
        name: title,
        savedBy: email,
        savedAt: serverTimestamp(),
      };

      if (params?.notebook_id) {
        await updateDoc(
          doc(db, "saveNotebooks", params.notebook_id),
          sharedData
        );
        toast({ description: "Notebook updated successfully" });
        setSharedUrl(`${window.location.origin}/share/${params.notebook_id}`);
      } else {
        const docRef = await addDoc(
          collection(db, "saveNotebooks"),
          sharedData
        );
        setSharedUrl(`${window.location.origin}/share/${docRef.id}`);
      }
      setIsShareModalOpen(true);
    } catch (e) {
      console.error("Error sharing notebook:", e);
    } finally {
      setShareLoading(false);
    }
  }, [shareData, title, params]);

  const handleSave = useCallback(async () => {
    try {
      setSaveLoading(true);
      const idToken = getCookie("idToken");
      const decodedToken = jwtDecode<{ email: string }>(
        decodeURIComponent(idToken)
      );
      const email = decodedToken.email;
      if (!email) {
        console.error("Please login to save the notebook");
        return;
      }

      const updatedShareData = shareData.map((cell) => ({
        show: "both",
        graphOptions: cell.graphOptions || null,
        query: cell.query,
        cellType: cell.cellType,
        cellId: cell.cellId,
        columns: cell.columns || null,
        data: cell.data || null,
        pagination: cell.pagination || null,
      }));

      const savedData = {
        notebook: updatedShareData,
        name: title,
        savedBy: email,
        savedAt: serverTimestamp(),
      };

      if (params?.notebook_id) {
        await updateDoc(
          doc(db, "saveNotebooks", params.notebook_id),
          savedData
        );
        toast({ description: "Notebook updated successfully" });
      } else {
        await addDoc(collection(db, "saveNotebooks"), savedData);
        toast({ description: "Notebook saved successfully" });
      }
    } catch (e) {
      console.error("Error saving notebook:", e);
    } finally {
      setSaveLoading(false);
    }
  }, [shareData, title, params]);

  return (
    <>
      {isShareModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">Copy Notebook URL</h2>
              <span
                className="border p-1 rounded-full cursor-pointer"
                onClick={() => setIsShareModalOpen(false)}
                aria-hidden="true"
              >
                <X size={20} />
              </span>
            </div>
            <div className="flex items-center justify-between mt-5 gap-2">
              <input
                type="text"
                value={sharedUrl}
                className="w-full h-12 px-4 rounded-lg border border-Stroke"
                disabled
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sharedUrl);
                  toast({
                    description: "Notebook shared URL copied successfully",
                  });
                }}
                className="bg-Gray border border-Stroke w-12 h-12 rounded-full grid place-items-center hover:bg-gray-200"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-end justify-end gap-x-3">
        <CustomTooltip
          trigger={
            <Button
              onClick={handleShare}
              disabled={shareData.length === 0 || shareLoading}
              className="cursor-pointer w-[60px] h-[60px] rounded-full border border-Stroke bg-Gray grid place-items-center hover:bg-gray-200"
            >
              {shareLoading ? (
                <Loader />
              ) : (
                <Share2 size={24} className="text-[#141B34]" />
              )}
            </Button>
          }
          content="Share Report"
        />
        <CustomTooltip
          trigger={
            <Button
              onClick={handleSave}
              disabled={shareData.length === 0 || saveLoading}
              className="w-[60px] h-[60px] rounded-full border border-Stroke bg-Gray grid place-items-center hover:bg-gray-200"
            >
              {saveLoading ? (
                <Loader />
              ) : (
                <SaveAll size={24} className="text-[#141B34]" />
              )}
            </Button>
          }
          content="Save Notebook"
        />
      </div>
      <div className="space-y-5 my-5">
        {cells.map((cell, index) =>
          cell.cellType === "sql" ? (
            <SqlEditor
              show={cell.show}
              key={cell.cellId}
              defaultValue={cell.query}
              setCells={setCells}
              cellIndex={index}
              deleteCell={deleteCell}
              handlePlay={handlePlay}
              activeTab={activeTab}
              shareData={shareData}
              setShareData={setShareData}
              defaultColumns={cell.columns}
              defaultData={cell.data}
              graphOptions={cell.graphOptions || null}
              defaultPagination={cell.pagination || null}
            />
          ) : cell.cellType === "text" ? (
            <TextEditor
              show={cell.show}
              key={cell.cellId}
              cellIndex={index}
              setCells={setCells}
              cells={cells}
              defaultValue={cell.query}
              deleteCell={deleteCell}
              handlePlay={handlePlay}
              shareData={shareData}
              setShareData={setShareData}
              defaultColumns={cell.columns}
              defaultData={cell.data}
              graphOptions={cell.graphOptions || null}
              defaultPagination={cell.pagination || null}
            />
          ) : null
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="bg-Gray border border-Stroke rounded-[20px] p-8 flex justify-start">
              <Plus />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => addCell("sql")}>
              SQL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addCell("text")}>
              Plain Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default QueryEngine;
