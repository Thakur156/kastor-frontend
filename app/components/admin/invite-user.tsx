import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "~/components/ui/input";
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

function InviteUser() {
  const Roles = [
    { value: "admin", title: "Admin" },
    { value: "analyst", title: "Analyst" },
  ];
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="secondary" className="rounded-full text-sm sm:text-lg">
          <div className="sm:p-2 p-1 bg-white rounded-full mr-2">
            <Plus className="text-black" />
          </div>
          Add New User
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="text-3xl">Add New User</SheetTitle>
          <SheetDescription className="text-xs">
            Enter User Credentials it’ll Send an Invite to user on email
          </SheetDescription>
        </SheetHeader>
        <div className="my-5 space-y-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="email"
          >
            User-email:
          </label>
          <Input id="email" placeholder="User Email" />
        </div>
        <div className="my-5 space-y-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="role"
          >
            Role:
          </label>
          <Select>
            <SelectTrigger className="border-0 bg-Gray h-[60px] focus:ring-transparent rounded-full text-lg text-Black px-6 ">
              <SelectValue placeholder="Select a Role" />
            </SelectTrigger>
            <SelectContent>
              {Roles.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              Invite User
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default InviteUser;
