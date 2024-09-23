import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type RouterOutputs } from "@/utils/api";
import { Box, Database, HardDrive, Layers, Network } from "lucide-react";
import { useEffect, useState } from "react";
import { PullImageDialog } from "../image/add-image";
import { CreateNetworkDialog } from "../network/add-network";
import { CreateVolumeDialog } from "../volumes/add-volume";
import {
  containerColumns,
  imageColumns,
  networkColumns,
  stackColumns,
  volumeColumns,
} from "./columns";
import { createRegexByResourceType, Show } from "./show";
type SummaryProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
};
export type Container = NonNullable<
  RouterOutputs["docker"]["getContainers"]
>[0];
export type Image = NonNullable<RouterOutputs["docker"]["getImages"]>[0];
export type Network = NonNullable<RouterOutputs["docker"]["getNetworks"]>[0];
export type Volume = NonNullable<RouterOutputs["docker"]["getVolumes"]>[0];
export type Stack = NonNullable<RouterOutputs["docker"]["getStacks"]>[0];

const SummaryCard = ({ title, value, icon }: SummaryProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DockerResourceTabs = () => {
  const [activeTab, setActiveTab] = useState("containers");
  const [summaryData, setSummaryData] = useState({
    containers: 0,
    volumes: 0,
    images: 0,
    networks: 0,
    stacks: 0,
  });

  // API queries for Docker resources
  const containerQuery = api.docker.getContainers.useQuery();
  const volumeQuery = api.docker.getVolumes.useQuery();
  const imageQuery = api.docker.getImages.useQuery();
  const networkQuery = api.docker.getNetworks.useQuery();
  const stackQuery = api.docker.getStacks.useQuery();

  // Refetch functions
  const handleImagePulled = () => imageQuery.refetch();
  const refreshNetworks = () => networkQuery.refetch();
  const refreshVolumes = () => volumeQuery.refetch();

  // Helper function to check if a query result is empty or not valid
  const isEmptyState = (
    data: Container[] | Image[] | Network[] | Volume[] | Stack[],
    resourceType: string
  ) => {
    return (
      !data ||
      data.length === 0 ||
      (data.length === 1 &&
        data[0]?.name &&
        createRegexByResourceType(resourceType).test(data[0].name))
    );
  };

  // Update summary data when the queries are complete
  useEffect(() => {
    if (
      containerQuery.data &&
      volumeQuery.data &&
      imageQuery.data &&
      networkQuery.data &&
      stackQuery.data
    ) {
      setSummaryData({
        containers: isEmptyState(containerQuery.data, "container")
          ? 0
          : containerQuery.data.length,
        volumes: isEmptyState(volumeQuery.data, "volume")
          ? 0
          : volumeQuery.data.length,
        images: isEmptyState(imageQuery.data, "image")
          ? 0
          : imageQuery.data.length,
        networks: isEmptyState(networkQuery.data, "network")
          ? 0
          : networkQuery.data.length,
        stacks: isEmptyState(stackQuery.data, "stack")
          ? 0
          : stackQuery.data.length,
      });
    }
  }, [
    containerQuery.data,
    volumeQuery.data,
    imageQuery.data,
    networkQuery.data,
    stackQuery.data,
  ]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <SummaryCard
          title="Containers"
          value={summaryData.containers}
          icon={<Box className="size-5 text-muted-foreground" />}
        />
        <SummaryCard
          title="Volumes"
          value={summaryData.volumes}
          icon={<Database className="size-5 text-muted-foreground" />}
        />
        <SummaryCard
          title="Images"
          value={summaryData.images}
          icon={<Layers className="size-5 text-muted-foreground" />}
        />
        <SummaryCard
          title="Networks"
          value={summaryData.networks}
          icon={<Network className="size-5 text-muted-foreground" />}
        />
        <SummaryCard
          title="Stacks"
          value={summaryData.stacks}
          icon={<HardDrive className="size-5 text-muted-foreground" />}
        />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="volumes">Volumes</TabsTrigger>
          <TabsTrigger value="stacks">Stacks</TabsTrigger>
        </TabsList>
        <TabsContent value="containers">
          <Show
            resourceType="Container"
            columns={containerColumns}
            isLoading={containerQuery.isLoading}
            data={containerQuery.data}
          />
        </TabsContent>
        <TabsContent value="images">
          <Show
            resourceType="Image"
            columns={imageColumns}
            isLoading={imageQuery.isLoading}
            data={imageQuery.data}
            customButton={<PullImageDialog onImagePulled={handleImagePulled} />}
          />
        </TabsContent>
        <TabsContent value="networks">
          <Show
            resourceType="Network"
            columns={networkColumns}
            isLoading={networkQuery.isLoading}
            data={networkQuery.data}
            customButton={
              <CreateNetworkDialog onNetworkCreated={refreshNetworks} />
            }
          />
        </TabsContent>
        <TabsContent value="volumes">
          <Show
            resourceType="Volume"
            columns={volumeColumns}
            isLoading={volumeQuery.isLoading}
            data={volumeQuery.data}
            customButton={
              <CreateVolumeDialog onVolumeCreated={refreshVolumes} />
            }
          />
        </TabsContent>
        <TabsContent value="stacks">
          <Show
            resourceType="Stack"
            columns={stackColumns}
            isLoading={stackQuery.isLoading}
            data={stackQuery.data}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { DockerResourceTabs };
