import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground",
				created: "border-transparent bg-gray-500 text-gray-100 hover:bg-gray-400",
				running: "border-transparent bg-green-500 text-green-100 hover:bg-green-400",
				restarting: "border-transparent bg-yellow-500 text-yellow-100 hover:bg-yellow-400",
				paused: "border-transparent bg-blue-500 text-blue-100 hover:bg-blue-400",
				exited: "border-transparent bg-red-500 text-red-100 hover:bg-red-400",
				dead: "border-transparent bg-black text-white hover:bg-black/80",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
	VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
