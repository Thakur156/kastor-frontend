import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";

import { Check } from "lucide-react";

interface SubscriptionCardProps {
  subscription: {
    id: string;
    planName: string;
    price: number;
    imageUrl: string;
    features: string[];
  };
  isActive?: boolean;
}

const SubscriptionCard = ({
  subscription,
  isActive,
}: SubscriptionCardProps) => {
  return (
    <div
      key={subscription.id}
      className={cn(
        "border border-Stroke rounded-[20px] p-5 flex flex-col justify-between gap-y-14 text-Black",
        isActive && "bg-Blue text-white border-t-[7px] border-[#F4C65C]"
      )}
    >
      <div className="space-y-10 ">
        <img
          src={subscription.imageUrl}
          alt="subscription"
          className="w-14 h-14 object-cover"
        />

        <div className="">
          <h1 className="text-2xl font-semibold">{subscription.planName}</h1>
          <p className=" text-sm">Perfect plan to check</p>
        </div>

        <div className="flex items-end leading-none relative">
          <h3 className="absolute -top-4 text-lg font-thin">$</h3>
          <h3 className="text-[80px] font-thin">{subscription.price}</h3>
          <p className="text-lg font-thin">
            {subscription?.planName === "Trial" ? "/First week" : "/Month"}
          </p>
        </div>
      </div>
      <hr />
      <div className="space-y-2">
        {subscription.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-x-3">
            <Check
              size={20}
              className={cn("text-Green", isActive && "text-white")}
            />
            <p className=" text-sm">{feature}</p>
          </div>
        ))}
      </div>

      <Button variant={"secondary"}>Select Plan</Button>
    </div>
  );
};

export default SubscriptionCard;
