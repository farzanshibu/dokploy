import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { api, type RouterOutputs } from "@/utils/api";
import { ShowContainerConfig } from "../config/show-container-config";
import { useImageDropdownMenuItems } from "../image/helper";
import { ShowImageContainerMenuItem } from "../image/show-containers";
import { ViewHistoryMenuItem } from "../image/show-history";
import { InspectMenuItem } from "../image/show-inspect";
import { ShowDockerModalLogs } from "../logs/show-docker-modal-logs";
import { useNetworkDropdownMenuItems } from "../network/helper";
import { ShowNetworkContainerMenuItem } from "../network/show-containers";
import { DockerTerminalModal } from "../terminal/docker-terminal-modal";
import { useVolumeDropdownMenuItems } from "../volumes/helper";
import { ShowVolumeContainerMenuItem } from "../volumes/show-containers";
import { PortIndicator } from "./ports";
import { ShowStackContainerMenuItem } from "../stack/show-containers";

// Types
export type Container = NonNullable<
  RouterOutputs["docker"]["getContainers"]
>[0];
export type Image = NonNullable<RouterOutputs["docker"]["getImages"]>[0];
export type Network = NonNullable<RouterOutputs["docker"]["getNetworks"]>[0];
export type Volume = NonNullable<RouterOutputs["docker"]["getVolumes"]>[0];
export type Stack = NonNullable<RouterOutputs["docker"]["getStacks"]>[0];

export type ContainerState =
  | "default"
  | "running"
  | "destructive"
  | "outline"
  | "secondary"
  | "created"
  | "restarting"
  | "paused"
  | "exited"
  | "dead";

// Reusable function to create a sortable column header
const createSortableHeader = (label: string) => {
  return ({ column }: { column: any }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const createActionsColumn = <T extends { id: string; name: string }>(
  resourceType: string
): ColumnDef<T> => ({
  id: "actions",
  enableHiding: false,
  cell: ({ row }) => {
    const resource = row.original;
    const imageQuery = api.docker.getImages.useQuery();
    const networkQuery = api.docker.getNetworks.useQuery();
    const volumeQuery = api.docker.getVolumes.useQuery();
    const { deleteImageMenuItem, updateImageMenuItem } =
      useImageDropdownMenuItems(resource, imageQuery.refetch);
    const { deleteNetworkMenuItem } = useNetworkDropdownMenuItems(
      resource,
      networkQuery.refetch
    );
    const { deleteVolumeMenuItem } = useVolumeDropdownMenuItems(
      resource,
      volumeQuery.refetch
    );
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {resourceType === "container" && (
            <>
              <ShowDockerModalLogs containerId={resource.id}>
                View Logs
              </ShowDockerModalLogs>
              <ShowContainerConfig containerId={resource.id} />
              <DockerTerminalModal containerId={resource.id}>
                Terminal
              </DockerTerminalModal>
            </>
          )}
          {resourceType === "image" && (
            <>
              {deleteImageMenuItem}
              {updateImageMenuItem}
              <ViewHistoryMenuItem imageId={resource.id} />
              <InspectMenuItem imageId={resource.id} />
              <ShowImageContainerMenuItem imageId={resource.id} />
            </>
          )}
          {resourceType === "network" && (
            <>
              {deleteNetworkMenuItem}
              <ShowNetworkContainerMenuItem networkId={resource.id} />
            </>
          )}
          {resourceType === "stack" && (
            <>
              <ShowStackContainerMenuItem stackId={resource.name} />
              <DropdownMenuItem
                onClick={() => console.log("Update replicas", resource.name)}
              >
                Update Replicas
              </DropdownMenuItem>
            </>
          )}
          {resourceType === "volume" && (
            <>
              {deleteVolumeMenuItem}
              <ShowVolumeContainerMenuItem volumeId={resource.id} />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
});

// Volume Columns
export const volumeColumns: ColumnDef<Volume>[] = [
  {
    accessorKey: "name",
    header: createSortableHeader("Name"),
    cell: ({ row }) => (
      <div className="truncate whitespace-nowrap overflow-hidden max-w-[450px]">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "driver",
    header: createSortableHeader("Driver"),
    cell: ({ row }) => <div>{row.getValue("driver")}</div>,
  },
  createActionsColumn<Volume>("volume"),
];

// Image Columns
export const imageColumns: ColumnDef<Image>[] = [
  {
    accessorKey: "name",
    header: createSortableHeader("Repository"),
    cell: ({ row }) => (
      <div className="truncate whitespace-nowrap overflow-hidden max-w-[450px]">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "tag",
    header: createSortableHeader("Tag"),
    cell: ({ row }) => {
      const tag = row.getValue("tag");
      const updateAvailable = row.original.updateAvailable;

      return (
        <div>
          {tag as string}
          {updateAvailable == true && (
            <Badge variant="destructive" className="ml-2">
              Update Available
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    header: createSortableHeader("Image ID"),
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "size",
    header: createSortableHeader("Size"),
    cell: ({ row }) => <div>{row.getValue("size")}</div>,
  },
  {
    accessorKey: "created",
    header: createSortableHeader("Created"),
    cell: ({ row }) => <div>{row.getValue("created")}</div>,
  },
  createActionsColumn<Image>("image"),
];

// Network Columns
export const networkColumns: ColumnDef<Network>[] = [
  {
    accessorKey: "name",
    header: createSortableHeader("Name"),
    cell: ({ row }) => (
      <div className="truncate whitespace-nowrap overflow-hidden max-w-[450px]">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: createSortableHeader("ID"),
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "driver",
    header: createSortableHeader("Driver"),
    cell: ({ row }) => <div>{row.getValue("driver")}</div>,
  },
  {
    accessorKey: "scope",
    header: createSortableHeader("Scope"),
    cell: ({ row }) => <div>{row.getValue("scope")}</div>,
  },
  createActionsColumn<Network>("network"),
];

// Stack Columns
export const stackColumns: ColumnDef<Stack>[] = [
  {
    accessorKey: "name",
    header: createSortableHeader("Name"),
    cell: ({ row }) => (
      <div className="truncate whitespace-nowrap overflow-hidden max-w-[450px]">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "services",
    header: createSortableHeader("Services"),
    cell: ({ row }) => <div>{row.getValue("services")}</div>,
  },
  {
    accessorKey: "orchestrator",
    header: createSortableHeader("Orchestrator"),
    cell: ({ row }) => <div>{row.getValue("orchestrator")}</div>,
  },
  createActionsColumn<Stack>("stack"),
];

// Container Columns
export const containerColumns: ColumnDef<Container>[] = [
  {
    accessorKey: "name",
    header: createSortableHeader("Name"),
    cell: ({ row }) => (
      <div className="truncate whitespace-nowrap overflow-hidden max-w-[450px]">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "state",
    header: createSortableHeader("State"),
    cell: ({ row }) => {
      const value: string = row.getValue("state");
      return (
        <div className="capitalize">
          <Badge variant={value.toLowerCase() as ContainerState}>{value}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: createSortableHeader("Status"),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "ports",
    header: createSortableHeader("ports"),
    cell: ({ row }) => <PortIndicator input={row.getValue("ports") || ""} />,
  },
  {
    accessorKey: "image",
    header: createSortableHeader("Image"),
    cell: ({ row }) => <div className="lowercase">{row.getValue("image")}</div>,
  },
  createActionsColumn<Container>("container"),
];
