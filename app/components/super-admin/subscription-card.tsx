import React from "react";

import { Button } from "~/components/ui/button";

import { Check } from "lucide-react";
import AddSubscription from "./add-subscription";

interface SubscriptionCardProps {
  subscription: {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: string;
    image: string;
    features: string[];
  };
}

const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  return (
    <div
      key={subscription.id}
      className={
        "border border-Stroke rounded-[20px] p-5 flex flex-col justify-between gap-y-14 text-Black"
      }
    >
      <div className=" flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <img src={subscription.image} alt="subscription" />

          <div className="">
            <h1 className="text-2xl font-semibold text-Black">
              {subscription.name}
            </h1>
            <p className=" text-sm">{subscription.description}</p>
          </div>
        </div>

        <div className="flex items-end leading-none relative">
          <h3 className="absolute -top-4 text-lg font-thin">$</h3>
          <h3 className="text-[64px] font-thin">{subscription.price}</h3>
          <p className="text-lg font-thin">{subscription?.duration}</p>
        </div>
      </div>
      <hr />
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          {subscription.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-x-3">
              <Check size={20} className={"text-Green"} />
              <p className=" text-sm">{feature}</p>
            </div>
          ))}
        </div>

        <AddSubscription type="edit" />
      </div>
    </div>
  );
};

export default SubscriptionCard;
