import * as React from "react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={cn(
      "h-4 w-4 rounded border-gray-600 bg-transparent text-white focus:ring-0 focus:ring-offset-0",
      className
    )}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
