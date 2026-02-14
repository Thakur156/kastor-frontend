import { useEffect, useState } from "react";

import { useNavigate, useParams } from "@remix-run/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "~/services/firebase";
import Loader from "~/components/shared/loader";

import { toast } from "~/components/ui/use-toast";
import GraphOptions from "~/components/shared/chart-options/graph-options";
import CustomTable from "~/components/shared/tables/custom-table";
import { TableRow } from "~/components/analyst/catalog-tables";

interface GraphOptionsData {
  metrics: { column: string; aggregateFunction: string }[];
  dimensions: { value: string; label: string }[];
  filters: { column: string; filterType: string; filterValue: string }[];
  chartType: string;
  chartTitle: string;
  locationOptions: { value: string; label: string }[];
}

interface NotebookCell {
  columns: { key: string; title: string }[];
  data: TableRow[];
  graphOptions?: GraphOptionsData;
}

interface NotebookData {
  name: string;
  notebook: NotebookCell[];
}

const SharedNoteBook = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [notebookData, setNotebookData] = useState<NotebookData | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    if (!params.notebook_id) return;

    const fetchNoteBook = async () => {
      const docRef = doc(db, "saveNotebooks", params.notebook_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.name && data.notebook) {
          setNotebookData({ name: data.name, notebook: data.notebook });
        } else {
          console.log("Document data is missing required fields");
        }
      } else {
        toast({
          description: "Notebook not found",
          variant: "destructive",
        });
        navigate("/");
      }
      setIsLoaded(false);
    };

    fetchNoteBook();
  }, []);

  return (
    <div className="p-10">
      {
        // Show loader if data is not loaded
        isLoaded ? (
          <div className="h-[80vh] grid place-items-center">
            <Loader />
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-4">
              <h1 className=" text-2xl font-semibold text-Black">
                {notebookData?.name}
              </h1>
            </div>
            {notebookData?.notebook.map((cell, i) => (
              <div key={i} className="space-y-5 mt-5">
                <div id={`custom-table-`}>
                  <CustomTable
                    columns={cell.columns}
                    data={cell.data}
                    containerClassName="max-h-[300px] overflow-y-auto"
                  />
                </div>
                {cell.graphOptions && (
                  <div>
                    <GraphOptions
                      columns={cell.columns}
                      data={cell.data}
                      graphOptions={cell.graphOptions}
                      isShared
                      isGraphVisible
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )
      }
    </div>
  );
};

export default SharedNoteBook;
