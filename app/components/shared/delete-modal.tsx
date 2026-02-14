import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "~/components/ui/dialog";
import { X, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface DeleteModalProps {
  onConfirm: () => Promise<void>;
}

export default function DeleteModal({ onConfirm }: DeleteModalProps) {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDeleteConfirm = async () => {
    console.log("Deleting...");
    await onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)}>
        <button className="text-sm text-red-500">
          <Trash2 size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white md:max-w-1/2 mobile:max-w-[90%] max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center flex-col mt-6">
            <div className="p-2 border-2 border-red-500 rounded-full">
              <X size={40} color="red" />
            </div>
            <h1 className="text-2xl font-medium text-black my-2">
              Are you sure?
            </h1>
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col justify-center items-center  gap-6">
              <p className="font-normal text-lg text-center">
                Do you really want to delete this? After deleting you can’t undo
                this.
              </p>
              <div className="flex md:flex-row flex-col gap-2 w-full justify-between">
                <Button
                  variant="secondary"
                  className="sm:w-fit w-full hover:bg-gray-300"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  variant="secondary"
                  className="sm:w-fit w-full bg-red-600 text-white hover:bg-red-700"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
