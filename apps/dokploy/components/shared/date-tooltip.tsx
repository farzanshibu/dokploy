import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { GitBranchIcon } from "lucide-react";

interface Props {
  date: string;
  children?: React.ReactNode;
  className?: string;
  branch?: string | null;
}

export const DateTooltip = ({ date, children, className, branch }: Props) => {
  let message = ` ${children} ${formatDistanceToNow(new Date(date), { addSuffix: true })} `;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={cn(
              "flex items-center text-muted-foreground text-left",
              className
            )}
          >
            {message}
            {branch && (
              <>
                on
                <GitBranchIcon size={16} className="inline-block mx-1" />
                <code>
                  <pre>{branch}</pre>
                </code>
              </>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>{format(new Date(date), "PPpp")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
