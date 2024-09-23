import { DateTooltip } from "@/components/shared/date-tooltip";
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
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/utils/api";
import {
	AlertTriangle,
	BookIcon,
	ExternalLinkIcon,
	FolderInput,
	MoreHorizontalIcon,
	TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { UpdateProject } from "./update";

export const ShowProjects = () => {
	const utils = api.useUtils();
	const { data } = api.project.all.useQuery();
	const { data: auth } = api.auth.get.useQuery();
	const { data: user } = api.user.byAuthId.useQuery(
		{
			authId: auth?.id || "",
		},
		{
			enabled: !!auth?.id && auth?.rol === "user",
		},
	);
	const { mutateAsync } = api.project.remove.useMutation();
	return (
		<>
			{data?.length === 0 && (
				<div className="mt-6 flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
					<FolderInput className="size-10 md:size-28 text-muted-foreground" />
					<span className="text-center font-medium text-muted-foreground">
						No projects added yet. Click on Create project.
					</span>
				</div>
			)}
			<div className="mt-6  w-full  grid sm:grid-cols-2 lg:grid-cols-3 flex-wrap gap-5 pb-10">
				{data?.map((project) => {
					const emptyServices =
						project?.mariadb.length === 0 &&
						project?.mongo.length === 0 &&
						project?.mysql.length === 0 &&
						project?.postgres.length === 0 &&
						project?.redis.length === 0 &&
						project?.applications.length === 0 &&
						project?.compose.length === 0;

					const totalServices =
						project?.mariadb.length +
						project?.mongo.length +
						project?.mysql.length +
						project?.postgres.length +
						project?.redis.length +
						project?.applications.length +
						project?.compose.length;
					return (
						<div key={project.projectId} className="w-full lg:max-w-md">
							<Link href={`/dashboard/project/${project.projectId}`}>
								<Card className="group relative w-full  bg-transparent transition-colors hover:bg-card">
									<Link
										href={`/dashboard/project/${project.projectId}`}
										target="_blank"
										rel="noopener noreferrer"
										className="absolute -right-3 -top-3 flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-200 hover:bg-primary/90 group-hover:translate-y-0 group-hover:opacity-100"
										aria-label={`Open project ${project.name} in new tab`}
									>
										<ExternalLinkIcon className="size-3.5" />
									</Link>
									<CardHeader>
										<CardTitle className="flex items-center justify-between gap-2 w-full">
											<span className="flex flex-col gap-1.5 max-w-[80%]">
												<div className="flex items-center gap-2">
													<BookIcon className="w-6 h-6 text-muted-foreground flex-shrink-0" />
													<span className="text-base font-medium truncate max-w-full flex-1">
														{project.name}
													</span>
												</div>
												<p className="text-sm font-medium text-muted-foreground overflow-hidden text-ellipsis whitespace-normal break-words min-h-[43px] line-clamp-2">
													{project.description || ""}
												</p>
											</span>
											<div className="flex self-start space-x-1">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="px-2">
															<MoreHorizontalIcon className="size-5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className="w-[200px] space-y-2">
														<DropdownMenuLabel className="font-normal">Actions</DropdownMenuLabel>

														<div onClick={(e) => e.stopPropagation()}>
															<UpdateProject projectId={project.projectId} />
														</div>

														<div onClick={(e) => e.stopPropagation()}>
															{(auth?.rol === "admin" || user?.canDeleteProjects) && (
																<AlertDialog>
																	<AlertDialogTrigger className="w-full">
																		<DropdownMenuItem className="w-full cursor-pointer space-x-3" onSelect={(e) => e.preventDefault()}>
																			<TrashIcon className="size-4" />
																			<span>Delete</span>
																		</DropdownMenuItem>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>Are you sure to delete this project?</AlertDialogTitle>
																			{!emptyServices ? (
																				<div className="flex flex-row gap-4 rounded-lg bg-yellow-50 p-2 dark:bg-yellow-950">
																					<AlertTriangle className="text-yellow-600 dark:text-yellow-400" />
																					<span className="text-sm text-yellow-600 dark:text-yellow-400">
																						You have active services, please delete them first
																					</span>
																				</div>
																			) : (
																				<AlertDialogDescription>
																					This action cannot be undone
																				</AlertDialogDescription>
																			)}
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>Cancel</AlertDialogCancel>
																			<AlertDialogAction
																				disabled={!emptyServices}
																				onClick={async () => {
																					await mutateAsync({
																						projectId: project.projectId,
																					})
																						.then(() => {
																							toast.success("Project delete successfully");
																						})
																						.catch(() => {
																							toast.error("Error to delete this project");
																						})
																						.finally(() => {
																							utils.project.all.invalidate();
																						});
																				}}
																			>
																				Delete
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
															)}
														</div>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</CardTitle>
									</CardHeader>
									<CardFooter className="pt-4">
										<div className="space-y-1 text-sm flex flex-row justify-between max-sm:flex-wrap w-full gap-2 sm:gap-4">
											<DateTooltip date={project.createdAt}>
												Created
											</DateTooltip>
											<span>
												{totalServices}{" "}
												{totalServices === 1 ? "service" : "services"}
											</span>
										</div>
									</CardFooter>
								</Card>
							</Link>
						</div>
					);
				})}
			</div>
		</>
	);
};
