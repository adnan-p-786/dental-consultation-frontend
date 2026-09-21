import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-teal-deep text-white",
        secondary:
          "bg-line-soft text-ink-soft",
        destructive:
          "bg-red-100 text-red-700 border border-red-200",
        outline:
          "border border-line text-ink",
        pending:
          "bg-amber-50 text-amber-700 border border-amber-200",
        requested:
          "bg-amber-50 text-amber-700 border border-amber-200",
        under_review:
          "bg-purple-50 text-purple-700 border border-purple-200",
        proposed:
          "bg-blue-50 text-blue-700 border border-blue-200",
        approved:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        completed:
          "bg-teal-50 text-teal-800 border border-teal-200",
        rescheduled:
          "bg-orange-50 text-orange-700 border border-orange-200",
        reschedule_requested:
          "bg-orange-50 text-orange-700 border border-orange-200",
        cancelled:
          "bg-rose-50 text-rose-700 border border-rose-200",
        no_show:
          "bg-zinc-100 text-zinc-700 border border-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
