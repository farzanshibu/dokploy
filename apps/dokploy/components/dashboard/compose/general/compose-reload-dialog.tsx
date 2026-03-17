import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
	onReload: (commitHash?: string) => Promise<void>;
	isLoading?: boolean;
	children?: React.ReactNode;
}

export const ComposeReloadDialog = ({ onReload, isLoading, children }: Props) => {
	const [commitHash, setCommitHash] = useState("");
	const [open, setOpen] = useState(false);

	const handleReload = async () => {
		await onReload(commitHash.trim() || undefined);
		setOpen(false);
		setCommitHash("");
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Reload Compose</AlertDialogTitle>
					<AlertDialogDescription>
						Reload the compose without rebuilding it. Optionally specify a commit
						hash to reload a specific version.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex flex-col gap-4 py-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="commitHash" className="text-sm font-medium">
							Commit Hash (Optional)
						</Label>
						<Input
							id="commitHash"
							placeholder="e.g., abc1234 or full SHA"
							value={commitHash}
							onChange={(e) => setCommitHash(e.target.value)}
							className="font-mono text-sm"
						/>
						<p className="text-xs text-muted-foreground">
							Leave empty to use the latest commit from the configured branch
						</p>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleReload}
						variant="default"
						disabled={isLoading}
					>
						<RefreshCcw className="size-4 mr-2" />
						Reload
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
