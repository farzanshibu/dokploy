import { ShowDockerLogs } from "@/components/dashboard/application/logs/show";
import { ShowAdvancedMongo } from "@/components/dashboard/mongo/advanced/show-mongo-advanced-settings";
import { ShowBackupMongo } from "@/components/dashboard/mongo/backups/show-backup-mongo";
import { DeleteMongo } from "@/components/dashboard/mongo/delete-mongo";
import { ShowMongoEnvironment } from "@/components/dashboard/mongo/environment/show-mongo-environment";
import { ShowExternalMongoCredentials } from "@/components/dashboard/mongo/general/show-external-mongo-credentials";
import { ShowGeneralMongo } from "@/components/dashboard/mongo/general/show-general-mongo";
import { ShowInternalMongoCredentials } from "@/components/dashboard/mongo/general/show-internal-mongo-credentials";
import { UpdateMongo } from "@/components/dashboard/mongo/update-mongo";
import { DockerMonitoring } from "@/components/dashboard/monitoring/docker/show";
import { MongodbIcon } from "@/components/icons/data-tools-icons";
import { ProjectLayout } from "@/components/layouts/project-layout";
import { ExpandableText } from "@/components/shared/expandable-text";
import { StatusTooltip } from "@/components/shared/status-tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { appRouter } from "@/server/api/root";
import { validateRequest } from "@/server/auth/auth";
import { api } from "@/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactElement } from "react";
import superjson from "superjson";

type TabState = "projects" | "monitoring" | "settings" | "backups" | "advanced";

const Mongo = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { mongoId, activeTab } = props;
  const router = useRouter();
  const { projectId } = router.query;
  const [tab, setSab] = useState<TabState>(activeTab);
  const { data } = api.mongo.one.useQuery({ mongoId });

  const { data: auth } = api.auth.get.useQuery();
  const { data: user } = api.user.byAuthId.useQuery(
    {
      authId: auth?.id || "",
    },
    {
      enabled: !!auth?.id && auth?.rol === "user",
    }
  );

  return (
    <div className="pb-10">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/dashboard/projects">
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              as={Link}
              className="max-w-[250px] truncate whitespace-nowrap overflow-hidden"
              href={`/dashboard/project/${data?.project.projectId}`}
            >
              {data?.project.name}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink className="max-w-[250px] truncate whitespace-nowrap overflow-hidden">
              {data?.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <header className="mb-6 flex w-full items-center justify-between gap-4 max-sm:flex-wrap">
          <div className="flex flex-col justify-between max-w-7xl gap-2">
            <div className="flex flex-col items-start gap-2 xl:gap-4">
              <h1 className="text-xl font-bold lg:text-3xl break-words truncate  max-w-full">
                {data?.name}
              </h1>
              <span className="text-sm truncate max-w-full">
                {data?.appName}
              </span>
            </div>
						<div>
							<Badge>{data?.server?.name || "Dokploy Server"}</Badge>
						</div>
            {data?.description && (
              <div className="w-full max-w-6xl">
                <ExpandableText
                  text={data?.description}
                  className="lg:text-medium text-muted-foreground leading-relaxed text-sm max-w-6xl text-justify break-words"
                />
              </div>
            )}
          </div>
          <div className="relative flex flex-row gap-4 self-start">
            <div className="absolute -right-1 -top-2">
              <StatusTooltip status={data?.applicationStatus} />
            </div>

            <MongodbIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        </header>
      </div>
      <Tabs
        value={tab}
        defaultValue="general"
        className="w-full"
        onValueChange={(e) => {
          setSab(e as TabState);
          const newPath = `/dashboard/project/${projectId}/services/mongo/${mongoId}?tab=${e}`;

          router.push(newPath, undefined, { shallow: true });
        }}
      >
        <div className="flex flex-row items-center justify-between  w-full gap-4">
          <TabsList
						className={cn(
							"md:grid md:w-fit max-md:overflow-y-scroll justify-start",
							data?.serverId ? "md:grid-cols-5" : "md:grid-cols-6",
						)}
					>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
						{!data?.serverId && (
	            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
						)}
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="flex flex-row gap-2">
            <UpdateMongo mongoId={mongoId} />
            {(auth?.rol === "admin" || user?.canDeleteServices) && (
              <DeleteMongo mongoId={mongoId} />
            )}
          </div>
        </div>

        <TabsContent value="general">
          <div className="flex flex-col gap-4 pt-2.5">
            <ShowGeneralMongo mongoId={mongoId} />
            <ShowInternalMongoCredentials mongoId={mongoId} />
            <ShowExternalMongoCredentials mongoId={mongoId} />
          </div>
        </TabsContent>
        <TabsContent value="environment">
          <div className="flex flex-col gap-4 pt-2.5">
            <ShowMongoEnvironment mongoId={mongoId} />
          </div>
        </TabsContent>
				{!data?.serverId && (
	        <TabsContent value="monitoring">
	          <div className="flex flex-col gap-4 pt-2.5">
	            <DockerMonitoring appName={data?.appName || ""} />
	          </div>
	        </TabsContent>
				)}
        <TabsContent value="logs">
          <div className="flex flex-col gap-4  pt-2.5">
            <ShowDockerLogs
							serverId={data?.serverId || ""}
							appName={data?.appName || ""}
						/>
          </div>
        </TabsContent>
        <TabsContent value="backups">
          <div className="flex flex-col gap-4 pt-2.5">
            <ShowBackupMongo mongoId={mongoId} />
          </div>
        </TabsContent>
        <TabsContent value="advanced">
          <div className="flex flex-col gap-4 pt-2.5">
            <ShowAdvancedMongo mongoId={mongoId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Mongo;
Mongo.getLayout = (page: ReactElement) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export async function getServerSideProps(
  ctx: GetServerSidePropsContext<{ mongoId: string; activeTab: TabState }>
) {
  const { query, params, req, res } = ctx;
  const activeTab = query.tab;

  const { user, session } = await validateRequest(req, res);
  if (!user) {
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
    };
  }
  // Fetch data from external API
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      req: req as any,
      res: res as any,
      db: null as any,
      session: session,
      user: user,
    },
    transformer: superjson,
  });

  if (typeof params?.mongoId === "string") {
    try {
      await helpers.mongo.one.fetch({
        mongoId: params?.mongoId,
      });

      return {
        props: {
          trpcState: helpers.dehydrate(),
          mongoId: params?.mongoId,
          activeTab: (activeTab || "general") as TabState,
        },
      };
    } catch (error) {
      return {
        redirect: {
          permanent: false,
          destination: "/dashboard/projects",
        },
      };
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: "/",
    },
  };
}
