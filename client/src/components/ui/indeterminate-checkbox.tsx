import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface IndeterminateCheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
  "aria-label"?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const IndeterminateCheckbox = React.forwardRef<
  HTMLButtonElement,
  IndeterminateCheckboxProps
>(({ className, indeterminate, checked, onCheckedChange, ...props }, ref) => {
  // In a real implementation we'd modify the DOM directly for the indeterminate state,
  // but as this is just for visual styling, we'll use the checked state to render differently.
  
  // Display indeterminate styling if indeterminate is true
  const displayState = indeterminate ? "indeterminate" : checked ? "checked" : "unchecked";
  
  return (
    <Checkbox
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        displayState === "indeterminate" && "data-[state=checked]:bg-gray-400 data-[state=checked]:text-white",
        className
      )}
      {...props}
      // Force to checked state visually if indeterminate (hack for visual purposes)
      data-state={displayState === "indeterminate" ? "checked" : undefined}
    />
  );
});

IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

export { IndeterminateCheckbox };