import { useRef, useState } from "react";
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
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Plus, X } from "lucide-react";
import fileUp from "~/assets/images/file-upload.svg";
import { cn } from "~/lib/utils";

const AddConfiguration = () => {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files as unknown as File[]);

    // Filter out non-image files
    const validImages = files.filter(
      (file) => file.type === "image/png" || file.type === "image/jpeg"
    );

    // Create image URLs and update state
    const imageUrls = validImages.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);

    // Filter out non-image files
    const validImages = files.filter(
      (file: File) => file.type === "image/png" || file.type === "image/jpeg"
    );

    // Create image URLs and update state
    const imageUrls = validImages.map((file: File) =>
      URL.createObjectURL(file)
    );
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="secondary" className="rounded-full text-sm sm:text-lg">
          <div className="sm:p-2 p-1 bg-white rounded-full mr-2">
            <Plus className="text-black" />
          </div>
          Add Configuration
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-3xl">Add Configuration</SheetTitle>
          <SheetDescription className="text-xs">
            Enter name, change display image and save it.
          </SheetDescription>
        </SheetHeader>
        <div className="my-5 space-y-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="email"
          >
            Configuration Name:
          </label>
          <Input id="email" placeholder="Enter Cluster Name" />
        </div>
        <div className="space-y-4">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              "w-full h-[232px] border-2 border-dashed border-Stroke rounded-[20px] text-center !cursor-pointer",
              isDragging && "bg-Gray border-Blue"
            )}
          >
            <input
              type="file"
              accept=".png, .jpeg"
              onChange={handleFileChange}
              multiple
              style={{ display: "none" }}
              id="file-input"
              ref={inputRef}
            />
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center h-full w-full"
            >
              {isDragging ? (
                <p className="text-base text-Black">
                  Drop the CSV file(s) here...
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center gap-y-3">
                  <h2 className="text-lg font-medium text-Black">
                    Upload or drag & Drop here
                  </h2>
                  <p className="text-base font-medium text-darkGray">
                    File format: PNG or JPEG
                  </p>
                  <Button
                    id="file-input"
                    size="secondary"
                    className="rounded-full text-sm sm:text-lg pr-4"
                    onClick={() => inputRef.current.click()}
                  >
                    <div className="w-9 h-9 grid place-items-center bg-white rounded-full mr-2">
                      <img src={fileUp} alt="file-upload" />
                    </div>
                    Choose Image
                  </Button>
                </div>
              )}
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-[80px] h-[80px] rounded-2xl"
              >
                <img
                  src={image}
                  alt="image"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full cursor-pointer"
                >
                  <X size={14} className="text-black" />
                </div>
              </div>
            ))}
            <div className="">
              <input
                id="images"
                type="file"
                accept="image/png, image/jpeg"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="images"
                className=" h-[80px] w-[80px] border border-dashed  rounded-2xl grid place-items-center cursor-pointer"
              >
                <div className="bg-Gray w-9 h-9 rounded-full grid place-items-center">
                  <Plus className="text-black" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto">
          <div className="flex sm:flex-row flex-col gap-3 sm:items-end sm:justify-between w-full">
            <SheetClose asChild>
              <Button variant="secondary" className="sm:w-fit w-full">
                Cancel
              </Button>
            </SheetClose>
            <Button
              type="submit"
              variant={"primary"}
              size={"primary"}
              className="sm:w-fit w-full"
            >
              Upload
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddConfiguration;
