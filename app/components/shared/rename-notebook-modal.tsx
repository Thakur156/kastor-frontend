import { X } from "lucide-react";
import React from "react";
import { toast } from "../ui/use-toast";

import { updateDoc, doc } from "firebase/firestore";
import { db } from "~/services/firebase";
import { Button } from "../ui/button";

interface RenameNotebookModalProps {
  name: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  docId: string;
  fetchSavedQueries: () => void;
}

const RenameNotebookModal = ({
  name,
  onClose,
  docId,
  fetchSavedQueries,
}: RenameNotebookModalProps) => {
  const [updatedName, setUpdatedName] = React.useState<string>(name || "");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!updatedName.trim()) {
        toast({
          description: "Please enter a name",
          variant: "destructive",
        });
        return;
      }
      setIsLoading(true);
      console.log(updatedName, docId);
      const docRef = doc(db, "saveNotebooks", docId);
      await updateDoc(docRef, {
        name: updatedName,
      });
      toast({
        description: "Name updated successfully",
      });
      onClose(false);
      fetchSavedQueries(); // Fetch the updated queries
    } catch (error) {
      toast({
        description: "Error while updating name",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          WebkitBackdropFilter: "blur(1px)",
          backdropFilter: "blur(1px)",
        }}
      >
        <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">Rename Notebook</h2>
            <span
              className="border p-1 rounded-full cursor-pointer"
              onClick={() => onClose(false)}
              aria-hidden="true"
            >
              <X size={20} />
            </span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col  justify-between mt-5 gap-2"
          >
            <input
              name="name"
              type="text"
              value={updatedName}
              className="w-full h-12 px-4 rounded-lg border border-Stroke"
              onChange={(e) => setUpdatedName(e.target.value)}
            />

            <Button
              type="submit"
              className="md:h-12 w-fit mt-5"
              disabled={isLoading}
            >
              Update Name
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RenameNotebookModal;
