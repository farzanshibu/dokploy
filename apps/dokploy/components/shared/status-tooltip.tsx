import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
	status: "running" | "error" | "done" | "idle" | undefined | null;
	className?: string;
}

export const StatusTooltip = ({ status, className }: Props) => {
	const getStatusColors = (status: Props['status']) => {
		switch (status) {
			case "idle":
				return "bg-gray-400";
			case "error":
				return "bg-red-500";
			case "done":
				return "bg-green-500";
			case "running":
				return "bg-yellow-500";
			default:
				return "bg-gray-400";
		}
	};

	const isPulsing: boolean = status != "idle";
	const statusText: string =
		status === "running" ? "Running" :
			status === "error" ? "Error" :
				status === "done" ? "Done" :
					status === "idle" ? "Idle" : "";

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger>
					<div className="relative inline-flex">
						<div
							className={cn(
								"size-3.5 rounded-full",
								getStatusColors(status),
								className
							)}
						/>
						<div
							className={cn(
								"size-3.5 rounded-full absolute top-0 left-0",
								getStatusColors(status),
								className,
								isPulsing ? 'animate-ping' : '',
								"opacity-75"
							)}
						/>

					</div>
				</TooltipTrigger>
				<TooltipContent align="center">
					<span>{statusText}</span>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
