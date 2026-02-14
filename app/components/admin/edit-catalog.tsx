import { Button } from "~/components/ui/button";
import { Edit } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  updateNamespaceName,
  updateTableName,
} from "~/services/rest-services/catalog-api";
import { toast } from "../ui/use-toast";

function EditCatalog({
  name,
  isTable,
  namespace,
}: {
  name: string;
  isTable?: boolean;
  namespace?: string;
}) {
  const CatalogSchema = z.object({
    name: z
      .string()
      .min(1, {
        message: isTable
          ? "Table Name is required"
          : "Namespace Name is required",
      })
      .refine((val) => !val?.trim()?.includes(" "), {
        message: isTable
          ? "Spaces are not allowed in table name"
          : "Spaces are not allowed in namespace name",
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CatalogSchema),
    defaultValues: {
      name,
    },
    reValidateMode: "onChange",
    mode: "onChange",
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof CatalogSchema>) => {
    try {
      if (isTable && namespace) {
        // Update table name
        await updateTableName(namespace, name, data.name.trim());
      } else {
        // Update namespace name
        await updateNamespaceName(name, data.name.trim());
      }
    } catch (error) {
      console.error("Error updating namespace name:", error);
      if (isTable) {
        toast({
          description: "Error updating table name",
          variant: "destructive",
        });
      } else {
        toast({
          description: "Error updating namespace name",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="text-sm text-blue-500">
          <Edit size={20} />
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="text-3xl">
            {isTable ? "Edit Table Name" : "Edit Namespace Name"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {isTable
              ? "Enter new table name and save it."
              : "Enter new namespace name and save it."}
          </SheetDescription>
        </SheetHeader>
        <div className="my-5 space-y-2">
          <form id="edit-catalog-form" onSubmit={handleSubmit(onSubmit)}>
            <label
              className="block text-normal font-medium text-gray-700 mb-1"
              htmlFor="name"
            >
              {isTable ? "Table Name:" : "Namespace Name:"}
            </label>
            <Input
              id="name"
              placeholder={isTable ? "Table Name" : "Namespace"}
              {...register("name")} // Register single "name" field
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </form>
        </div>

        <SheetFooter className="mt-auto">
          <div className="flex sm:flex-row flex-col gap-3 sm:items-end sm:justify-between w-full">
            <SheetClose asChild>
              <Button variant="secondary" className="sm:w-fit w-full">
                Cancel
              </Button>
            </SheetClose>
            {/* The Button should trigger form submission */}
            <Button
              type="submit"
              variant={"primary"}
              size={"primary"}
              className="sm:w-fit w-full"
              form="edit-catalog-form"
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default EditCatalog;
