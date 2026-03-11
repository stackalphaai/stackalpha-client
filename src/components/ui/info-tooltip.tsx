import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface InfoTooltipProps {
  content: string
  className?: string
  iconClassName?: string
  side?: "top" | "right" | "bottom" | "left"
  maxWidth?: string
}

export function InfoTooltip({
  content,
  className,
  iconClassName,
  side = "top",
  maxWidth = "max-w-xs",
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help inline-block ml-1",
            iconClassName
          )}
        />
      </TooltipTrigger>
      <TooltipContent side={side} className={cn(maxWidth, className)}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
