import { Plus } from "lucide-react";
import React from "react";
import AddConfiguration from "~/components/super-admin/add-configuration";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

const AuthItems = [
  {
    id: "1",
    title: "Untitled 1",
  },
  {
    id: "2",
    title: "Untitled 2",
  },
  {
    id: "3",
    title: "Untitled 3",
  },
];

const SettingsPage = () => {
  return (
    <div className="bg-Gray p-7 rounded-[20px] border border-Stroke mb-10">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-Black">
            Manage Auth Settings
          </h1>
          <p className="text-base font-medium text-darkGray">
            Configure and update images and content for authentication screens.
          </p>
        </div>
        <AddConfiguration />
      </div>

      <RadioGroup defaultValue="1" className="mt-10">
        {AuthItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center px-5 py-7 space-x-5 bg-white rounded-[20px]"
          >
            <RadioGroupItem value={item.id} id={item.id} />
            <Label
              htmlFor={item.id}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <div className="text-2xl font-semibold text-Black">
                <h2 className="text-base text-darkGray font-medium">
                  Configuration Name
                </h2>
                {item.title}
              </div>

              <div className="space-x-3">
                <Button className="w-fit rounded-full text-lg">Update</Button>
                <Button variant="secondary" className="w-fit rounded-full">
                  Remove
                </Button>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default SettingsPage;
