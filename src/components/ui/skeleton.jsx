import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("premium-skeleton rounded-lg", className)}
      {...props}
    />
  );
}

export { Skeleton }
