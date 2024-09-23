import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MountInfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => {
  if (value === null || value === undefined) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div className="flex flex-col gap-1 text-left">
            <span className="font-medium">{label}</span>
            <span className="text-sm text-muted-foreground truncate whitespace-nowrap overflow-hidden ">
              {value}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent align="start" className="max-w-xs">
          <span className="whitespace-normal break-words">{value}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { MountInfoItem };
