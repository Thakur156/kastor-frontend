import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

import { MoveUpRight } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "w-full bg-Gray text-lg font-medium text-Black border border-stroke hover:bg-Gray/80 rounded-full",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        primary:
          "bg-Blue text-white hover:bg-Blue/90 w-fit rounded-full text-lg font-medium",
      },
      size: {
        default: "h-12 md:h-[60px] py-[5px] px-6",
        primary: "h-12 md:h-[60px] p-[5px] pl-[25px]",
        secondary: "h-12 md:h-[60px] p-[5px] pr-[25px]",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 md:h-[62px] pl-6 pr-[14px] py-[14px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return variant === "primary" ? (
      <Comp
        className={cn(buttonVariants({ size, variant, className }))}
        ref={ref}
        {...props}
      >
        {props.children}
        <div className="ml-2 grid h-9 w-9 md:h-12 md:w-12 place-items-center rounded-full bg-white text-Black">
          <MoveUpRight />
        </div>
      </Comp>
    ) : (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
