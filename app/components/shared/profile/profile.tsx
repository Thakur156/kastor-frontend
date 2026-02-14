import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

function Profile() {
  return (
    <form className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 flex-1 ">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue="" placeholder="Enter your full name" />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            defaultValue=""
            placeholder="Enter your organization"
          />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            defaultValue=""
            placeholder="your.email@example.com"
          />
        </div>
        <div className="space-y-2 flex-1">
          <Label htmlFor="customerId">Role</Label>
          <Input
            id="customerId"
            readOnly
            defaultValue="Admin"
            placeholder="Your role in the organization"
          />
        </div>
      </div>
      <div className="space-y-2 md:w-1/2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter new password to change"
        />
      </div>
      <div className="md:flex justify-between pt-4 !w-full gap-2 space-y-2">
        <Button variant="outline" className="rounded-full md:w-44 w-full">
          Discard Changes
        </Button>
        <Button disabled={true} className="rounded-full md:w-44 w-full">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export default Profile;
