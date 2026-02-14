import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Pen, Pencil, Plus, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useForm, useFieldArray, set } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "~/services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
import { toast } from "../ui/use-toast";

const featureSchema = z.object({
  planName: z.string().refine((val) => val.trim().length > 0, {
    message: "Plan Name cannot be empty",
  }),
  price: z.coerce.number().min(0, "Price cannot be  less than zero"),
  features: z.array(z.string().min(1, "Feature cannot be empty")),
});

interface AddConnectionProps {
  type?: "edit" | "add";
  defaultData?: {
    id: string;
    imageUrl: string;
    planName: string;
    price: number;
    features: string[];
  };
  fetchSubscriptions: () => void;
}

const AddSubscription = ({
  type,
  defaultData,
  fetchSubscriptions,
}: AddConnectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<null | File>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(
    defaultData?.imageUrl || null
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(featureSchema),
    defaultValues: defaultData || {
      planName: "",
      price: 0,
      features: [""], // Start with one empty feature input
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setImage(file);
      setImgUrl(URL.createObjectURL(file));
    }
  };

  const removeImg = () => {
    setImage(null);
    setImgUrl(null);
  };

  const onSubmit = async (data: z.infer<typeof featureSchema>) => {
    try {
      if (!imgUrl) {
        toast({
          description: "Please upload an image",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = imgUrl;
      // Upload image to Firebase Storage
      if (image) {
        const storageRef = ref(storage, `subscription-plans/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
        console.log("image uploaded", imageUrl);
      }

      // Add subscription data to Firestore
      const subscriptionData = {
        createdAt: new Date(),
        imageUrl,
        ...data,
      };

      if (type === "edit") {
        // Update the subscription data in Firestore
        const subscriptionRef = doc(db, "subscriptions", defaultData?.id);
        await updateDoc(subscriptionRef, subscriptionData);
        setIsOpen(false);
        toast({
          description: "Subscription plan updated successfully!",
          variant: "default",
        });
        fetchSubscriptions();
        return;
      } else {
        await addDoc(collection(db, "subscriptions"), subscriptionData);

        setIsOpen(false);

        toast({
          description: "Subscription plan added successfully!",
          variant: "default",
        });
        fetchSubscriptions();
      }

      reset();
      removeImg();

      // Optional: Close the sheet or reset the form
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast({
        description: "Error adding subscription plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Manually set the fields to have one input by default if they are empty
  if (fields.length === 0) {
    append(""); // Append a default empty string to ensure at least one input
  }

  return (
    <Sheet open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
      <SheetTrigger asChild>
        {type === "edit" ? (
          <Pencil className="text-darkGray cursor-pointer" />
        ) : (
          <Button size="secondary" className="rounded-full text-sm sm:text-lg">
            <div className="sm:p-2 p-1 bg-white rounded-full mr-2">
              <Plus className="text-black" />
            </div>
            Add New Plan
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-3xl">
            {type === "edit" ? "Edit Plan" : "Add New Plan"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {type === "edit" ? "Update " : "Add "} your subscription details and
            preferences.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {imgUrl ? (
            <div className="relative w-[80px] h-[80px] rounded-2xl">
              <img
                src={imgUrl}
                alt="subscription"
                className="w-full h-full object-cover rounded-lg"
              />
              <div
                onClick={removeImg}
                className="absolute top-1 right-1 p-1 bg-white rounded-full cursor-pointer"
                role="none"
              >
                <X size={14} className="text-black" />
              </div>
            </div>
          ) : (
            <div className="">
              <input
                id="images"
                type="file"
                accept="image/png, image/jpeg, image/svg"
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
          )}
          <Input
            {...register("planName")}
            placeholder="Plan Name"
            isInvalid={!!errors.planName}
            errorMsg={errors.planName?.message}
          />
          <Input
            {...register("price")}
            placeholder="Price"
            type="number"
            isInvalid={!!errors.price}
            errorMsg={errors.price?.message}
            min={0}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3>Features</h3>
              <Button
                type="button"
                size="secondary"
                className="rounded-full text-xs sm:text-xs h-8 md:h-8 pr-2"
                onClick={() => append("")}
              >
                <div className="w-6 h-6 grid place-items-center bg-white rounded-full mr-2">
                  <Plus className="text-black" size={16} />
                </div>
                Add more
              </Button>
            </div>
            {fields.map((item, index) => (
              <div key={item.id} className="relative">
                <Input
                  {...register(`features.${index}`)}
                  placeholder="Enter feature"
                  isInvalid={!!errors.features?.[index]}
                  errorMsg={errors.features?.[index]?.message}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute -right-4 top-5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
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
              variant={"primary"}
              size={"primary"}
              className="sm:w-fit w-full"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddSubscription;
