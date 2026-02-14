import { useState, useEffect } from "react";

import { useNavigate, useParams } from "@remix-run/react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "~/services/firebase";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import NamespaceItem from "~/components/analyst/namespace-item";
import Loader from "~/components/shared/loader";
import { toast } from "~/components/ui/use-toast";

import { cn, getCookie } from "~/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getNamespaces } from "~/services/rest-services/catalog-api";
import CatalogTables, { TableRow } from "~/components/analyst/catalog-tables";
import QueryEngine from "~/components/analyst/query-engine";
import NamespaceItemLoader from "~/components/analyst/NamespaceTablesLoader";
import { jwtDecode } from "jwt-decode";
import { CellObj } from "~/lib/types";

interface TabItem {
  title: string;
  namespace: string;
  table: string;
  content: {
    metadata: TableRow[];
    previewData: TableRow[];
  };
}

const SavedNotebook = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loadingNamespaces, setLoadingNamespaces] = useState<boolean>(true);
  const [tabsData, setTabsData] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("query-engine");

  const [savedCells, setSavedCells] = useState<CellObj[]>([]);

  const [notebookData, setNotebookData] = useState<null | {
    name: string;
    notebook: CellObj[];
  }>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    if (!params.notebook_id) return;

    const token = getCookie("idToken");
    const decodedToken = jwtDecode<{ email: string }>(
      decodeURIComponent(token)
    );
    const fetchNoteBook = async () => {
      const docRef = doc(db, "saveNotebooks", params.notebook_id);
      const docSnap = await getDoc(docRef);

      if (
        docSnap.exists() &&
        decodedToken?.email &&
        docSnap.data().savedBy === decodedToken?.email
      ) {
        const data = docSnap.data();
        if (data && data.name && data.notebook) {
          setNotebookData({ name: data.name, notebook: data.notebook });
          setSavedCells(data?.notebook);
        }
      } else {
        toast({
          description: "Notebook not found",
          variant: "destructive",
        });
        navigate("/query/saved-queries");
      }
      setIsLoaded(false);
    };

    fetchNoteBook();
    fetchNamespaces();
  }, []);

  const fetchNamespaces = async () => {
    try {
      const result = await getNamespaces();
      setNamespaces(result?.namespaces || []);
    } catch (error) {
      console.error("Error fetching namespaces:", error);
    } finally {
      setLoadingNamespaces(false);
    }
  };

  const handleRemoveTab = (tabTitle: string) => {
    setTabsData((prev) => {
      return prev.filter((tab) => tab.title !== tabTitle);
    });
    // set active tab to query engine if user try to close the active tab
    if (activeTab === tabTitle) setActiveTab("query-engine");
  };

  return (
    <div className="">
      {
        // Show loader if data is not loaded
        isLoaded ? (
          <div className="h-[80vh] grid place-items-center">
            <Loader />
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-4">
              <h1 className=" text-2xl font-semibold text-Black">
                {notebookData?.name}
              </h1>
            </div>

            <div className="flex mt-5 gap-2 h-[calc(100vh-185px)]">
              <div
                className={cn(
                  "relative overflow-y-auto pr-3",
                  collapsed && "overflow-hidden"
                )}
              >
                <div
                  className="h-10 w-10 grid place-items-center border border-Stroke rounded-full cursor-pointer"
                  onClick={() => setCollapsed(!collapsed)}
                  role="none"
                >
                  {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </div>
                <div
                  className={cn(
                    "w-[270px] sm:w-[345px] space-y-5 relative transition-[width] duration-300 my-5 overflow-auto",
                    collapsed && "w-0 sm:w-0 overflow-hidden"
                  )}
                >
                  <h3 className="font-semibold text-xl">
                    Namespaces and Tables
                  </h3>

                  {loadingNamespaces ? (
                    [1, 2, 3, 4, 5, 6].map((_, index) => (
                      <NamespaceItemLoader key={index} />
                    ))
                  ) : namespaces.length > 0 ? (
                    namespaces.map((namespace) => (
                      <NamespaceItem
                        key={namespace}
                        namespace={namespace}
                        setTabsData={setTabsData}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center mt-5">
                      <p>No namespaces available for this catalog.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto h-full  pr-3">
                <Tabs
                  defaultValue="query-engine"
                  value={activeTab}
                  className="flex flex-col h-full"
                >
                  <div className="overflow-x-auto">
                    <TabsList className=" overflow-x-auto bg-Gray">
                      <TabsTrigger
                        value="query-engine"
                        onClick={() => setActiveTab("query-engine")}
                      >
                        Query Engine
                      </TabsTrigger>
                      {tabsData.map((tab, index) => (
                        <TabsTrigger
                          key={index}
                          value={tab.title}
                          onClick={() => setActiveTab(tab.title)}
                        >
                          {tab.title}
                          <X
                            size={14}
                            onClick={(e) => {
                              handleRemoveTab(tab.title);
                              e.stopPropagation(); // Prevent the click event from bubbling up
                            }}
                            className="text-darkGray hover:text-Black cursor-pointer ml-1"
                          />
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  <TabsContent value="query-engine"></TabsContent>
                  {tabsData.map((tab, index) => (
                    <TabsContent
                      key={index}
                      value={tab.title}
                      className="flex-1 overflow-auto"
                    >
                      {activeTab === tab.title && (
                        <CatalogTables
                          namespace={tab.namespace}
                          table={tab.table}
                          setTabsData={setTabsData}
                          defaultContent={tab.content}
                        />
                      )}
                    </TabsContent>
                  ))}
                  <div
                    className={cn(
                      "flex-1 overflow-auto",
                      activeTab === "query-engine" ? "block" : "hidden"
                    )}
                  >
                    <QueryEngine
                      activeTab={activeTab}
                      title={notebookData?.name || "Untitled"}
                      savedCells={savedCells}
                    />
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default SavedNotebook;
