import { Button } from "~/components/ui/button";
import { Pen, Plus } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { storage, db as firestore } from "~/services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

const types = [
  { value: "csv", title: "CSV" },
  { value: "database", title: "Database" },
];

interface InitialValues {
  id?: string;
  name: string;
  imageUrl?: string;
  type: "csv" | "database";
  API_Url?: string;
  API_Body?: object;
}

interface AddConnectionProps {
  type?: "edit" | "add";
  initialValues?: InitialValues;
  fetchConnections: () => Promise<void>;
}

const connectionSchema = z
  .object({
    name: z.string().min(1, {
      message: "Connection Name is required",
    }),
    image: z
      .any()
      .refine((file) => file instanceof File || typeof file === "string", {
        message: "Image is required",
      }),
    type: z.enum(["csv", "database"], {
      errorMap: () => ({ message: "Type is required" }),
    }),
    API_Url: z.string().optional(),
    API_Body: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "database") {
      if (!data.API_Url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["API_Url"],
          message: "API URL is required when type is 'database'",
        });
      }
      if (!data.API_Body) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["API_Body"],
          message: "API Body is required when type is 'database'",
        });
      } else {
        try {
          JSON.parse(data.API_Body);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["API_Body"],
            message: "API Body must be valid JSON",
          });
        }
      }
    }
  });

type ConnectionFormData = z.infer<typeof connectionSchema>;

const AddConnection = ({
  type,
  initialValues,
  fetchConnections,
}: AddConnectionProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialValues?.imageUrl || null
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: "",
      image: initialValues?.imageUrl || null,
      type: "csv",
      API_Url: "",
      API_Body: "{}",
    },
    mode: "onChange",
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name,
        image: initialValues.imageUrl,
        type: initialValues.type,
        API_Url: initialValues.API_Url || "",
        API_Body: initialValues.API_Body
          ? JSON.stringify(initialValues.API_Body)
          : "{}",
      });
      setPreviewImage(initialValues.imageUrl || null);
    }
  }, [initialValues, reset]);

  const uploadImageAndSaveConnection = async (data: ConnectionFormData) => {
    try {
      setLoading(true);
      let imageUrl = previewImage;

      if (data.image instanceof File) {
        const imageRef = ref(
          storage,
          `connections/${Date.now()}_${data.image.name}`
        );
        const snapshot = await uploadBytes(imageRef, data.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Save connection details to Firestore
      const connectionRef = doc(
        firestore,
        "connections",
        initialValues?.id || Date.now().toString()
      );
      await setDoc(connectionRef, {
        name: data.name,
        imageUrl,
        type: data.type,
        API_Url: data.API_Url || null,
        API_Body: data.API_Body ? JSON.parse(data.API_Body) : null,
      });

      toast({
        description:
          type === "edit"
            ? "Connection updated successfully!"
            : "Connection saved successfully!",
      });
      // Refetch data after deletion
      fetchConnections();
    } catch (error) {
      console.error("Error uploading image or saving connection:", error);
      toast({
        description: "Failed to save the connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      reset();
      setLoading(false);
      setOpen(false);
    }
  };

  const onSubmit = (data: ConnectionFormData) => {
    if (!data.image && !previewImage) {
      setError("image", {
        type: "manual",
        message: "Image is required",
      });
      return;
    }

    uploadImageAndSaveConnection(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("image", e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {type === "edit" ? (
          <Pen size={20} className="cursor-pointer" />
        ) : (
          <Button size="secondary" className="rounded-full text-sm sm:text-lg">
            <div className="sm:p-2 p-1 bg-white rounded-full mr-2">
              <Plus className="text-black" />
            </div>
            Add New Connection
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full overflow-auto">
        <SheetHeader>
          <SheetTitle className="text-3xl">
            {type === "edit" ? "Edit Connection" : "Add Connection"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {type === "edit" ? "Update " : "Add "} the connection and save it
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 h-full">
          <div className="space-y-2">
            <Input
              id="name"
              placeholder="Connection Name"
              label="Connection Name"
              {...register("name")}
              errorMsg={errors.name?.message?.toString()}
              isInvalid={!!errors.name}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="image"
              className="block text-base font-medium text-Black"
            >
              Upload Logo
            </label>
            {previewImage && (
              <div className="mb-2">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-20 h-20 rounded-md object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500"
            />
            {errors.image && (
              <p className="text-sm text-Red">
                {errors.image.message as string}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="type"
              className="block text-base font-medium text-Black"
            >
              Type
            </label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val === "csv") {
                      setValue("API_Url", "");
                      setValue("API_Body", "{}");
                    }
                  }}
                >
                  <SelectTrigger className="border-0 bg-Gray h-[60px] focus:ring-transparent rounded-full text-lg text-Black px-6 ">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-Red">{errors.type.message}</p>
            )}
          </div>
          {selectedType === "database" && (
            <>
              <div className="space-y-2">
                <Input
                  id="API_Url"
                  placeholder="API URL"
                  label="API URL"
                  {...register("API_Url")}
                  errorMsg={errors.API_Url?.message?.toString()}
                  isInvalid={!!errors.API_Url}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="API_Body"
                  className="block text-base font-medium text-Black"
                >
                  API Body
                </label>
                <Controller
                  control={control}
                  name="API_Body"
                  render={({ field }) => (
                    <div>
                      <Editor
                        height="150px"
                        defaultLanguage="json"
                        value={field.value || "{}"}
                        onChange={(value) => field.onChange(value || "{}")}
                        options={{
                          minimap: { enabled: false },
                          lineNumbers: "off",
                          glyphMargin: false,
                          folding: false,
                          lineDecorationsWidth: 0,
                          scrollbar: {
                            vertical: "hidden",
                            horizontal: "hidden",
                            handleMouseWheel: true,
                          },
                          overviewRulerLanes: 0,
                          automaticLayout: true,
                          scrollBeyondLastLine: false,
                        }}
                      />
                      {errors.API_Body && (
                        <p className="text-sm text-Red">
                          {errors.API_Body?.message?.toString()}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </>
          )}
        </form>
        <SheetFooter className="mt-auto">
          <div className="flex sm:flex-row flex-col gap-3 sm:items-end sm:justify-between w-full">
            <SheetClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="sm:w-fit w-full"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              type="submit"
              variant="primary"
              size="primary"
              className="sm:w-fit w-full"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddConnection;
