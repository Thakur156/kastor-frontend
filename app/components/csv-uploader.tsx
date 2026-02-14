import React, { useState, DragEvent, ChangeEvent } from "react";
import { cn } from "~/lib/utils";
import { toast } from "~/components/ui/use-toast";

interface CSVUploaderProps {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ setFiles }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const csvFiles = files.filter((file) => file.type === "text/csv");

    if (csvFiles.length > 0) {
      setFiles(csvFiles);
      setFiles((prev: File[]) => [...prev, ...csvFiles]);
    } else {
      toast({
        description:
          "Please upload a valid CSV file or folder containing CSV files.",
        variant: "destructive",
      });
    }

    event.dataTransfer.clearData();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const csvFiles = files.filter((file) => file.type === "text/csv");

    if (csvFiles.length > 0) {
      setFiles((prev: File[]) => [...prev, ...csvFiles]);
    } else {
      toast({
        description:
          "Please upload a valid CSV file or folder containing CSV files",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  return (
    <>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "w-full h-[242px] border-2 border-dashed border-Stroke rounded-[20px] text-center !cursor-pointer",
          isDragging && "bg-Gray border-Blue"
        )}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          multiple
          style={{ display: "none" }}
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="flex flex-col items-center justify-center h-full w-full"
        >
          {isDragging ? (
            <p className="text-base text-Black">Drop the CSV file(s) here...</p>
          ) : (
            <div className="flex flex-col items-center justify-center gap-y-3">
              <h2 className="text-lg font-medium text-Black">
                Upload or drag & Drop here
              </h2>
            </div>
          )}
        </label>
      </div>
    </>
  );
};

export default CSVUploader;
