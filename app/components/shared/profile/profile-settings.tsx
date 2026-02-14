import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Profile from "./profile";
import BillingInfo from "./billing-info";

export default function ProfileSettings({
  hideBillingInfo,
}: {
  hideBillingInfo?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!hideBillingInfo && (
          <TabsList className=" h-fit p-0">
            <TabsTrigger
              value="profile"
              className="h-[54px] px-5 flex items-center data-[state=active]:bg-Blue data-[state=active]:text-white  data-[state=active]:shadow-none  data-[state=active]:border data-[state=active]:border-b-0 border-Stroke text-Black"
            >
              Profile Setting
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="h-[54px] px-5 flex items-center data-[state=active]:bg-Blue data-[state=active]:text-white  data-[state=active]:shadow-none  data-[state=active]:border data-[state=active]:border-b-0 border-Stroke text-Black"
            >
              Billing Info
            </TabsTrigger>
          </TabsList>
        )}
        <TabsContent value="profile" className="mt-6 w-full">
          <Profile />
        </TabsContent>
        <TabsContent value="billing">
          <BillingInfo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
