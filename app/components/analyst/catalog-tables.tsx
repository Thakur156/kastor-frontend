import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Loader from "~/components/shared/loader";

import {
  getTableMetadata,
  getTablePreviewdata,
} from "~/services/rest-services/catalog-api";
import { ChartNoAxesColumn, LayoutDashboard } from "lucide-react";
import CustomTable from "../shared/tables/custom-table";

export interface TableField {
  [key: string]: unknown;
}

export interface TableRow {
  [key: string]: unknown;
}

export interface TabItem {
  title: string;
  namespace: string;
  table: string;
  content: {
    metadata: TableField[];
    previewData: TableRow[];
  };
}

interface CatalogTablesProps {
  namespace: string;
  table: string;
  setTabsData: React.Dispatch<React.SetStateAction<TabItem[]>>;
  defaultContent: {
    metadata: TableField[];
    previewData: TableRow[];
  };
}

const CatalogTables = ({
  namespace,
  table,
  defaultContent,
}: CatalogTablesProps) => {
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<TableField[]>(
    defaultContent.metadata || []
  );
  const [previewData, setPreviewData] = useState<TableRow[]>(
    defaultContent.previewData || []
  );

  useEffect(() => {
    fetchTableData(namespace, table);
    fetchPreviewData(namespace, table);
  }, []);

  // Fetch table metadata
  const fetchTableData = async (namespace: string, table: string) => {
    try {
      setLoadingMetadata(true); // Set metadata loader
      const result = await getTableMetadata(namespace, table);
      const resutlData = result?.schemas[0]?.fields || [];
      setMetadata(resutlData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingMetadata(false);
    }
  };

  // Fetch table preview data
  const fetchPreviewData = async (namespace: string, table: string) => {
    try {
      setLoadingPreview(true); // Set preview loader
      const result = await getTablePreviewdata(namespace, table);
      if (Object.keys(result?.data).length > 0) {
        const data = result?.data;
        const keys = Object.keys(data);
        const length = data[keys[0]]?.length;
        const formattedData = Array.from({ length }, (_, index) => {
          const obj = {};
          keys.forEach((key) => {
            obj[key] = data[key][index];
          });
          return obj;
        });
        setPreviewData(formattedData);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const createColumns = (keys: string[]) => {
    return keys.map((key) => {
      return {
        key,
        title: key,
      };
    });
  };

  return (
    <Tabs defaultValue="table" className="mt-7">
      {metadata?.length > 0 || previewData ? (
        <TabsList className="bg-transparent h-fit p-0 ">
          <TabsTrigger
            value="table"
            className="h-[54px] px-5 flex items-center data-[state=active]:bg-Gray data-[state=active]:shadow-none rounded-t-[20px] data-[state=active]:border data-[state=active]:border-b-0 border-Stroke text-Black"
          >
            <ChartNoAxesColumn size={20} className="-mt-1" />
            Table View
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="h-[54px] px-5 flex items-center data-[state=active]:bg-Gray data-[state=active]:shadow-none rounded-t-[20px] data-[state=active]:border data-[state=active]:border-b-0 border-Stroke text-Black"
          >
            <LayoutDashboard size={20} className="-mt-1 mr-1" />
            Table Preview
          </TabsTrigger>
        </TabsList>
      ) : null}

      <TabsContent value="table" className="mt-0">
        {loadingMetadata ? (
          <div className="flex justify-center mt-20">
            <Loader />
          </div>
        ) : (
          metadata?.length > 0 && (
            // <DataTable
            //   columns={createColumnDefs(Object.keys(metadata[0]))}
            //   data={metadata}
            //   containerClassName="rounded-ss-none"
            // />
            <CustomTable
              columns={createColumns(Object.keys(metadata[0]))}
              data={metadata}
            />
          )
        )}
      </TabsContent>

      <TabsContent value="catalog" className="mt-0">
        {loadingPreview ? (
          <div className="flex justify-center mt-20">
            <Loader />
          </div>
        ) : previewData?.length > 0 ? (
          <CustomTable
            columns={createColumns(Object.keys(previewData[0]))}
            data={previewData}
          />
        ) : (
          <div className="flex items-center justify-center mt-20">
            <p>No preview data available for this table.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default CatalogTables;
