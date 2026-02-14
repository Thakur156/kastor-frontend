import * as React from "react";

import { cn } from "~/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMsg?: string;
  isInvalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, errorMsg, isInvalid, ...props }, ref) => {
    return label ? (
      <div className="space-y-2">
        <label
          htmlFor={props.id}
          className="text-base font-semibold text-Black mb-2"
        >
          {label}
          {props.required && <span className="text-Red">*</span>}
        </label>
        <input
          type={type}
          className={cn(
            "flex h-[60px] w-full rounded-full bg-Gray px-7 py-1 text-lg text-Black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-0 focus:border-2 border-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            className,
            isInvalid && "border border-Red"
          )}
          ref={ref}
          {...props}
        />
        {errorMsg && <p className="text-sm text-Red">{errorMsg}</p>}
      </div>
    ) : (
      <div>
        <input
          type={type}
          className={cn(
            "flex h-[60px] w-full rounded-full bg-Gray px-7 py-1 text-lg text-Black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-0 focus:border-2 border-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            className,
            isInvalid && "border border-Red"
          )}
          ref={ref}
          {...props}
        />
        {errorMsg && <p className="text-sm text-Red mt-2">{errorMsg}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
