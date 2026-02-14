import React, { useState } from "react";

import { getNameSpaceTables } from "~/services/rest-services/catalog-api";
import { TabItem } from "./catalog-tables";

import {
  ChevronDown,
  ChevronRight,
  Share2,
  TableProperties,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface NamespaceItemProps {
  namespace: string;
  fetchTableData?: (namespace: string, table: string) => void;
  fetchPreviewData?: (namespace: string, table: string) => void;
  setTabsData?: React.Dispatch<React.SetStateAction<TabItem[]>>;
}

const NamespaceItem = ({
  namespace,
  fetchTableData,
  fetchPreviewData,
  setTabsData,
}: NamespaceItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [loadingTables, setLoadingTables] = useState<boolean>(false);

  const handleNamespaceClick = async () => {
    setIsExpanded(!isExpanded);
    if (isExpanded || tables.length > 0) {
      return;
    }
    // setActiveNamespace(namespace);
    setLoadingTables(true);
    try {
      const result = await getNameSpaceTables(namespace);
      setTables(result?.tables || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingTables(false);
    }
  };

  return (
    <div className=" p-[30px] rounded-[20px] border border-[#E5E5E5] w-full">
      <div
        className="flex items-center gap-2 cursor-pointer font-semibold flex-wrap"
        onClick={handleNamespaceClick}
        role="none"
      >
        {isExpanded ? (
          <ChevronDown size={20} className="text-Black" />
        ) : (
          <ChevronRight size={20} className="text-Black" />
        )}
        <Share2 size={20} className="text-Blue" />
        <span className="text-Black">{namespace}</span>
      </div>
      <div
        className={cn(
          "ml-10 mt-2 overflow-hidden space-y-3",
          isExpanded ? "h-full" : "h-0"
        )}
      >
        {loadingTables ? (
          [1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="text-Black flex items-center gap-2 cursor-pointer"
            >
              <Skeleton className="h-5 w-[120px]" />
            </div>
          ))
        ) : tables.length > 0 ? (
          tables.map((table) => (
            <div
              key={table}
              className="text-Black flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (fetchTableData && fetchPreviewData) {
                  fetchTableData(namespace, table);
                  fetchPreviewData(namespace, table);
                }
                if (setTabsData) {
                  setTabsData((prev) => {
                    const index = prev.findIndex(
                      (item) =>
                        item.namespace === namespace && item.table === table
                    );
                    if (index > -1) {
                      return prev;
                    }
                    return [
                      ...prev,
                      {
                        title: table,
                        namespace,
                        table,
                        content: {
                          metadata: [],
                          previewData: [],
                        },
                      },
                    ];
                  });
                }
              }}
              role="none"
            >
              <TableProperties size={20} className="text-Green" />
              {table}
            </div>
          ))
        ) : (
          <div className="text-Black">
            No tables available for this namespace.
          </div>
        )}
      </div>
    </div>
  );
};

export default NamespaceItem;
