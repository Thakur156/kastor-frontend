import { useEffect, useRef, useState } from "react";
import { MetaFunction } from "@remix-run/react";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import CSVUploader from "~/components/csv-uploader";
import { getUploadStatus } from "~/services/rest-services/connector-api";
import { Paperclip, Trash2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { getCookie } from "typescript-cookie";
import { toast } from "~/components/ui/use-toast";

import * as z from "zod";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const meta: MetaFunction = () => {
  return [
    {
      title: "CSV | Kastor",
    },
  ];
};

// Define proper types for upload status
interface UploadJob {
  file_name: string;
  status: "in-progress" | "completed" | "error" | "failed";
  progress: number;
}

interface UploadStatus {
  [key: string]: UploadJob;
}

const CsvSchema = z.object({
  table_name: z
    .string()
    .min(1, "Table name is required")
    .regex(/^[^\s.]+$/, "Table name cannot contain spaces or periods"),
  dataset_name: z
    .string()
    .min(1, "Dataset name is required")
    .regex(/^[^\s.]+$/, "Dataset name cannot contain spaces or periods"),
});

const CSVUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(CsvSchema),
  });

  const handleFilesUpload = async (data: z.infer<typeof CsvSchema>) => {
    if (files.length === 0) {
      toast({
        description: "No files selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsPolling(true);
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const authToken = getCookie("idToken");
      if (!authToken) throw new Error("ID Token not found in cookies");

      const idToken = authToken.split(",")[0];
      const headers: { [key: string]: string } = {
        Authorization: `Bearer ${idToken}`,
        table_name: data.table_name,
        dataset_name: data.dataset_name,
      };
      files.forEach((file, index) => {
        headers[`filename${index}`] = file.name;
      });

      if (typeof window !== "undefined") {
        const response = await fetch(
          `${window.ENV.BASE_API_URL}/connectors/upload/`,
          {
            method: "POST",
            headers,
            body: formData,
          }
        );

        if (!response.ok) throw new Error("File upload failed");

        const result = await response.json();
        toast({
          description: result.message,
          variant: "default",
        });
        setFiles([]);
      }
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "File upload error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsPolling(false);
      reset();
    }
  };

  const fetchUploadStatus = async (userId: string) => {
    try {
      const result = await getUploadStatus(userId);
      setUploadStatus(result?.jobs || {});

      const hasInProgress = Object.values(result?.jobs || {} as UploadStatus).some(
        (job: UploadJob) => job.status === "in-progress"
      );

      setIsPolling(hasInProgress);
    } catch (error) {
      console.error("Error fetching upload status:", error);
    }
  };

  useEffect(() => {
    const fetchInitialUploadStatus = async () => {
      const authToken = getCookie("idToken");
      if (!authToken) return;

      const idToken = authToken.split(",")[0];
      const { user_id } = jwtDecode<{ user_id?: string }>(idToken);
      if (!user_id) return;

      await fetchUploadStatus(user_id);
    };

    fetchInitialUploadStatus();
  }, []);

  useEffect(() => {
    if (isPolling && !intervalId.current) {
      const authToken = getCookie("idToken");
      if (!authToken) return;

      const idToken = authToken.split(",")[0];
      const { user_id } = jwtDecode<{ user_id?: string }>(idToken);
      if (!user_id) return;

      intervalId.current = setInterval(() => {
        fetchUploadStatus(user_id);
      }, 2000);
    } else if (!isPolling && intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [isPolling]);

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-10">
      <form onSubmit={handleSubmit(handleFilesUpload)}>
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Input label="Dataset Name" {...register("dataset_name")} />
            {errors.dataset_name && (
              <div className="text-red-500">
                {errors.dataset_name.message as string}
              </div>
            )}
          </div>
          <div>
            <Input label="Table Name" {...register("table_name")} />
            {errors.table_name && (
              <div className="text-red-500">
                {errors.table_name.message as string}
              </div>
            )}
          </div>
        </div>
        <CSVUploader setFiles={setFiles} />
        {files.length > 0 &&
          files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 mt-2">
              <Paperclip size={20} />
              {file.name}
              <Trash2 size={20} onClick={() => handleRemoveFile(index)} />
            </div>
          ))}
        <div className="flex justify-end items-center">
          <Button
            type="submit"
            variant={"primary"}
            size={"primary"}
            className="mt-5"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Upload CSV"}
          </Button>
        </div>
      </form>
      {uploadStatus &&
        Object.keys(uploadStatus).length > 0 &&
        Object.keys(uploadStatus).map((key) => (
          <div
            key={key}
            className="bg-Gray p-6 rounded-[20px] text-lg text-Black my-5"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{uploadStatus[key]?.file_name}</div>
              <div className="flex items-center gap-2">
                <div className="font-medium">
                  {uploadStatus[key]?.status.charAt(0).toUpperCase() +
                    uploadStatus[key]?.status.slice(1)}{" "}
                </div>
                <div className="font-semibold">
                  {uploadStatus[key]?.progress}%
                </div>
              </div>
            </div>
            <div className="w-full my-4">
              <Progress
                color={
                  uploadStatus[key]?.status === "error" ||
                  uploadStatus[key]?.status === "failed"
                    ? "#df1b1b"
                    : "#17B26A"
                }
                value={uploadStatus[key]?.progress}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default CSVUpload;
