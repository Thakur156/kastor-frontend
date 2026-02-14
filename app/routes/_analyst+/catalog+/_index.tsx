import { useState, useEffect } from "react";
import { MetaFunction } from "@remix-run/react";
import { cn, createColumns } from "~/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import {
  ChevronLeft,
  ChevronRight,
  ChartNoAxesColumn,
  LayoutDashboard,
} from "lucide-react";

import {
  getNamespaces,
  getTableMetadata,
  getTablePreviewdata,
} from "~/services/rest-services/catalog-api";
import Loader from "~/components/shared/loader";
import NamespaceItem from "~/components/analyst/namespace-item";
import CustomTable from "~/components/shared/tables/custom-table";
import NamespaceItemLoader from "~/components/analyst/NamespaceTablesLoader";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Discovery | Kastor",
    },
  ];
};

const Catalog = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loadingNamespaces, setLoadingNamespaces] = useState<boolean>(true);
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false); // Separate loading for preview
  const [metadata, setMetadata] = useState<null | {}[]>(null);
  const [previewData, setPreviewData] = useState<null | {}[]>(null);

  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        const result = await getNamespaces();
        setNamespaces(result?.namespaces || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingNamespaces(false);
      }
    };
    fetchNamespaces();
  }, []);

  // Fetch table metadata
  const fetchTableData = async (namespace: string, table: string) => {
    try {
      setLoadingMetadata(true); // Set metadata loader
      const result = await getTableMetadata(namespace, table);
      setMetadata(result?.schemas[0]?.fields || []);
      console.log(result?.schemas[0]?.fields);
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

  const noTableSelected =
    !metadata?.length && !previewData && !loadingMetadata && !loadingPreview;

  return (
    <div className="my-5">
      <div className="flex mt-5 gap-5">
        <div className="relative">
          <div
            className="h-10 w-10 grid place-items-center border border-Stroke rounded-full cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
            role="none"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </div>
          <div
            className={cn(
              "w-[270px] sm:w-[345px] space-y-5 relative transition-[width] duration-300 mt-5 overflow-x-auto",
              collapsed && "w-0 sm:w-0 overflow-hidden"
            )}
          >
            <h3 className="font-semibold text-xl">Namespaces and Tables</h3>
            {loadingNamespaces ? (
              [1, 2, 3, 4, 5, 6].map((_, index) => (
                <NamespaceItemLoader key={index} />
              ))
            ) : namespaces.length > 0 ? (
              namespaces.map((namespace) => (
                <NamespaceItem
                  key={namespace}
                  namespace={namespace}
                  fetchTableData={fetchTableData}
                  fetchPreviewData={fetchPreviewData}
                />
              ))
            ) : (
              <div className="flex items-center justify-center mt-5">
                <p>No namespaces available for this catalog.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {noTableSelected && !loadingNamespaces ? (
            <div className="flex justify-center mt-20">
              <p>Select a table to view its content.</p>
            </div>
          ) : (
            <Tabs defaultValue="table">
              {metadata?.length > 0 || previewData ? (
                <TabsList className="bg-transparent h-fit p-0">
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
                    <CustomTable
                      columns={createColumns(Object.keys(metadata[0]))}
                      data={metadata}
                      containerClassName="rounded-ss-none"
                    />
                    // <DataTable
                    //   columns={createColumnDefs(Object.keys(metadata[0]))}
                    //   data={metadata}
                    //   containerClassName="rounded-ss-none"
                    // />
                  )
                )}
              </TabsContent>

              <TabsContent value="catalog" className="mt-0">
                {loadingPreview ? (
                  <div className="flex justify-center mt-20">
                    <Loader />
                  </div>
                ) : previewData ? (
                  // <DataTable
                  //   columns={createColumnDefs(Object.keys(previewData[0]))}
                  //   data={previewData}
                  // />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
