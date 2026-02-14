import { cn } from "~/lib/utils";

import { Check } from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Configuration",
  },
  {
    id: 2,
    title: "Connection",
  },
  {
    id: 3,
    title: "Ingest & Clean",
  },
];

interface StepperProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const Stepper = ({ activeIndex, setActiveIndex }: StepperProps) => {
  return (
    <div className="w-[85%]">
      <div className="w-full flex items-center">
        {STEPS.map((step, i) => (
          <div
            key={step.id}
            className={cn(
              "w-full flex items-center",
              i === STEPS.length - 1 && "w-fit"
            )}
          >
            <div className="relative">
              {activeIndex > i ? (
                <div
                  className={cn(
                    "w-6 h-6 md:w-9 md:h-9 rounded-full bg-Green text-white grid place-items-center cursor-pointer"
                  )}
                  onClick={() => setActiveIndex(i)}
                  role="none"
                >
                  <Check size={20} />
                </div>
              ) : (
                <div
                  className={cn(
                    " rounded-full",
                    activeIndex === i && "border border-[#4A90E2] p-[2px]"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 md:w-8 md:h-8 rounded-full bg-Gray",
                      activeIndex === i && "bg-[#4A90E2]"
                    )}
                  ></div>
                </div>
              )}
              <h2 className="absolute top-10 md:top-16 text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-Black text-nowrap">
                {step.title}
              </h2>
            </div>
            <div
              className={cn(
                "flex-1 w-full bg-Gray h-1 mx-2 md:mx-5 relative",
                i === STEPS.length - 1 && "hidden"
              )}
            >
              <div
                className={cn(
                  "h-full absolute left-0 top-0 w-0",
                  activeIndex > i && "bg-Green w-full",
                  activeIndex === i && "bg-[#4A90E2] w-[75%] md:w-1/3"
                )}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
