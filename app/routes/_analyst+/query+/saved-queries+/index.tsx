import React, { useEffect } from "react";
import {
  getDocs,
  collection,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "~/services/firebase";
import {
  CodeXml,
  Copy,
  EllipsisVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { Link } from "@remix-run/react";
import { SavedQueriesLoader } from "~/components/analyst/SavedQueriesLoader";
import { getCookie } from "~/lib/utils";
import { jwtDecode } from "jwt-decode";
import RenameNotebookModal from "~/components/shared/rename-notebook-modal";
import { toast } from "~/components/ui/use-toast";

const SavedQueries = () => {
  const [savedQueries, setSavedQueries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = React.useState(false);
  const [activeNotebookId, setActiveNotebookId] = React.useState<string | null>(
    null
  );

  useEffect(() => {
    fetchSavedQueries();
  }, []);

  const fetchSavedQueries = async () => {
    try {
      setLoading(true);
      const token = getCookie("idToken");
      const decodedToken = jwtDecode<{ email: string }>(
        decodeURIComponent(token)
      );
      if (!decodedToken) return;

      const firebaseQuery = query(
        collection(db, "saveNotebooks"),
        where("savedBy", "==", decodedToken.email),
        orderBy("savedAt", "desc")
      );
      const querySnapshot = await getDocs(firebaseQuery);
      const queries = querySnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      setSavedQueries(queries);
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      setIsDeleting(true);
      setLoading(true);
      await deleteDoc(doc(db, "saveNotebooks", id));
      const newSavedQueries = savedQueries.filter((query) => query.id !== id);
      setSavedQueries(newSavedQueries);
      toast({
        description: "Notebook deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting saved query:", error);
      toast({
        description: "Error deleting the notebook",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setLoading(false);
    }
  };

  const handleCopyUrl = (notebookId: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/share/${notebookId}`
    );
    toast({
      description: "URL copied to clipboard",
    });
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-2xl font-semibold text-Black">Saved Queries</h1>
        <Link to="/query">
          <Button size="secondary" className="rounded-full text-sm sm:text-lg">
            <div className="sm:p-2 p-1 bg-white rounded-full mr-2">
              <Plus className="text-black" />
            </div>
            Create New Query
          </Button>
        </Link>
      </div>
      {loading ? (
        <SavedQueriesLoader />
      ) : savedQueries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          {savedQueries.map((query) => (
            <div key={query.id}>
              <div className="bg-Gray border border-Stroke rounded-[20px] py-7 px-5">
                <h2 className="text-xl font-bold">{query.name}</h2>
                <p className="text-base font-medium">
                  {query?.savedAt?.toDate().toLocaleDateString()}
                </p>
                <p className="text-Blue flex items-center gap-2 text-base font-semibold mt-5">
                  <Save size={16} /> Saved by
                </p>
                <p className="text-base text-Black">{query.savedBy}</p>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="bg-white rounded-full border border-Stroke w-10 h-10 grid place-items-center">
                      <EllipsisVertical className="cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="p-3 space-y-2">
                      <DropdownMenuItem>
                        <button
                          className="w-full text-Black flex items-center gap-2"
                          onClick={() => {
                            setActiveNotebookId(query.id);
                            setIsRenameModalOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                          Change Name
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="w-full">
                        <Link
                          to={`/query/saved-queries/${query.id}`}
                          className="w-full text-Black flex items-center gap-2"
                        >
                          <CodeXml size={16} />
                          Open
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="w-full">
                        <div
                          role="none"
                          className="w-full text-Black flex items-center gap-2 cursor-pointer"
                          onClick={() => handleCopyUrl(query.id)}
                        >
                          <Copy size={16} />
                          Copy URL
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <button
                          className="w-full text-Black flex items-center gap-2"
                          onClick={() => handleDeleteCard(query.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {isRenameModalOpen && activeNotebookId === query.id && (
                  <RenameNotebookModal
                    name={query.name}
                    onClose={() => setIsRenameModalOpen(false)}
                    docId={activeNotebookId}
                    fetchSavedQueries={fetchSavedQueries}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">
          No saved queries found. Please create a new query to get started.
        </p>
      )}
    </div>
  );
};

export default SavedQueries;
