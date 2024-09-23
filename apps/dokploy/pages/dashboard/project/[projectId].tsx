import { AddApplication } from "@/components/dashboard/project/add-application";
import { AddCompose } from "@/components/dashboard/project/add-compose";
import { AddDatabase } from "@/components/dashboard/project/add-database";
import { AddTemplate } from "@/components/dashboard/project/add-template";
import {
  MariadbIcon,
  MongodbIcon,
  MysqlIcon,
  PostgresqlIcon,
  RedisIcon,
} from "@/components/icons/data-tools-icons";
import { ProjectLayout } from "@/components/layouts/project-layout";
import { DateTooltip } from "@/components/shared/date-tooltip";
import { ExpandableText } from "@/components/shared/expandable-text";
import { StatusTooltip } from "@/components/shared/status-tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appRouter } from "@/server/api/root";
import type { findProjectById } from "@/server/api/services/project";
import { validateRequest } from "@/server/auth/auth";
import { api } from "@/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { CircuitBoard, FolderInput, GlobeIcon, PlusIcon } from "lucide-react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactElement } from "react";
import superjson from "superjson";

export type Services = {
  name: string;
  type:
    | "mariadb"
    | "application"
    | "postgres"
    | "mysql"
    | "mongo"
    | "redis"
    | "compose";
  description?: string | null;
  branch?: string | null;
  id: string;
  createdAt: string;
  status?: "idle" | "running" | "done" | "error";
};

type Project = Awaited<ReturnType<typeof findProjectById>>;

type GithubApplication = Extract<
  Project["applications"][number],
  { sourceType: "github" }
>;
type GitlabApplication = Extract<
  Project["applications"][number],
  { sourceType: "gitlab" }
>;
type BitbucketApplication = Extract<
  Project["applications"][number],
  { sourceType: "bitbucket" }
>;
type CustomGitApplication = Extract<
  Project["applications"][number],
  { sourceType: "git" }
>;
type OtherApplication = Extract<
  Project["applications"][number],
  { sourceType: string }
>;

type Application =
  | GithubApplication
  | GitlabApplication
  | BitbucketApplication
  | CustomGitApplication
  | OtherApplication;

type GithubCompose = Extract<
  Project["compose"][number],
  { sourceType: "github" }
>;
type GitlabCompose = Extract<
  Project["compose"][number],
  { sourceType: "gitlab" }
>;
type BitbucketCompose = Extract<
  Project["compose"][number],
  { sourceType: "bitbucket" }
>;
type CustomGitCompose = Extract<
  Project["compose"][number],
  { sourceType: "git" }
>;
type OtherCompose = Extract<Project["compose"][number], { sourceType: string }>;

type Compose =
  | GithubCompose
  | GitlabCompose
  | BitbucketCompose
  | CustomGitCompose
  | OtherCompose;

const getBranchNameForSourceType = (
  item: Application | Compose
): string | null => {
  switch (item.sourceType) {
    case "github":
      return item.branch;
    case "gitlab":
      return item.gitlabBranch;
    case "bitbucket":
      return item.bitbucketBranch;
    case "git":
      return item.customGitBranch;
    default:
      return null;
  }
};

export const extractServices = (data: Project | undefined) => {
  const applications: Services[] =
    data?.applications.map((item) => ({
      name: item.name,
      type: "application",
      id: item.applicationId,
      branch: getBranchNameForSourceType(item),
      createdAt: item.createdAt,
      status: item.applicationStatus,
      description: item.description,
    })) || [];

  const mariadb: Services[] =
    data?.mariadb.map((item) => ({
      name: item.name,
      type: "mariadb",
      id: item.mariadbId,
      createdAt: item.createdAt,
      status: item.applicationStatus,
      description: item.description,
    })) || [];

  const postgres: Services[] =
    data?.postgres.map((item) => ({
      name: item.name,
      type: "postgres",
      id: item.postgresId,
      createdAt: item.createdAt,
      status: item.applicationStatus,
      description: item.description,
    })) || [];

  const mongo: Services[] =
    data?.mongo.map((item) => ({
      name: item.name,
      type: "mongo",
      id: item.mongoId,
      createdAt: item.createdAt,
      status: item.applicationStatus,
      description: item.description,
    })) || [];

  const redis: Services[] =
    data?.redis.map((item) => ({
      name: item.name,
      type: "redis",
      id: item.redisId,
      createdAt: item.createdAt,
      status: item.applicationStatus,
      description: item.description,
    })) || [];

  const mysql: Services[] =
    data?.mysql.map((item) => ({
      name: item.name,
      type: "mysql",
      id: item.mysqlId,
      createdAt: item.createdAt,
      status: item.applicationStatus,
      description: item.description,
    })) || [];

  const compose: Services[] =
    data?.compose.map((item) => ({
      name: item.name,
      type: "compose",
      id: item.composeId,
      branch: getBranchNameForSourceType(item),
      createdAt: item.createdAt,
      status: item.composeStatus,
      description: item.description,
    })) || [];

  applications.push(
    ...mysql,
    ...redis,
    ...mongo,
    ...postgres,
    ...mariadb,
    ...compose
  );

  applications.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return applications;
};

const Project = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { projectId } = props;
  const { data: auth } = api.auth.get.useQuery();
  const { data: user } = api.user.byAuthId.useQuery(
    {
      authId: auth?.id || "",
    },
    {
      enabled: !!auth?.id && auth?.rol === "user",
    }
  );
  const { data } = api.project.one.useQuery({ projectId });
  const router = useRouter();

  const emptyServices =
    data?.mariadb?.length === 0 &&
    data?.mongo?.length === 0 &&
    data?.mysql?.length === 0 &&
    data?.postgres?.length === 0 &&
    data?.redis?.length === 0 &&
    data?.applications?.length === 0 &&
    data?.compose?.length === 0;

  const applications = extractServices(data);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/dashboard/projects">
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink className="max-w-[250px] truncate whitespace-nowrap overflow-hidden">
              {data?.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <header className="mb-10 w-full flex flex-col gap-4">
          <div className="flex w-full items-center justify-between flex-wrap lg:flex-nowrap">
            <h1 className="text-xl font-bold lg:text-3xl max-w-[650px] truncate whitespace-nowrap overflow-hidden">
              {data?.name}
            </h1>
            {(auth?.rol === "admin" || user?.canCreateServices) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="self-start lg:self-auto lg:ml-auto">
                    <PlusIcon className="h-4 w-4" />
                    Create Service
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[200px] space-y-2"
                  align="end"
                >
                  <DropdownMenuLabel className="text-sm font-normal">
                    Actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <AddApplication
                    projectId={projectId}
                    projectName={data?.name}
                  />
                  <AddDatabase projectId={projectId} projectName={data?.name} />
                  <AddCompose projectId={projectId} projectName={data?.name} />
                  <AddTemplate projectId={projectId} />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="w-full">
            <ExpandableText
              text={data?.description}
              className="lg:text-medium text-muted-foreground leading-relaxed text-justify"
            />
          </div>
        </header>

        <div className="flex w-full gap-8">
          {emptyServices ? (
            <div className="flex h-[70vh] w-full flex-col items-center justify-center">
              <FolderInput className="size-10 md:size-28 text-muted" />
              <span className="text-center font-medium text-muted-foreground">
                No services added yet. Click on Create Service.
              </span>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              <div className="grid gap-5 pb-10 sm:grid-cols-2 lg:grid-cols-3">
                {applications?.map((service) => (
                  <Card
                    key={service.id}
                    onClick={() => {
                      router.push(
                        `/dashboard/project/${projectId}/services/${service.type}/${service.id}`
                      );
                    }}
                    className="group relative cursor-pointer bg-transparent transition-colors hover:bg-card h-fit"
                  >
                    <div className="absolute -right-1 -top-2">
                      <StatusTooltip status={service.status} />
                    </div>

                    <CardHeader>
                      <CardTitle className="flex items-start gap-2">
                        <div className="flex flex-col gap-2 max-w-sm w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-medium flex-1 break-words truncate">
                              {service.name}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              {service.type === "postgres" && (
                                <PostgresqlIcon className="h-7 w-7" />
                              )}
                              {service.type === "redis" && (
                                <RedisIcon className="h-7 w-7" />
                              )}
                              {service.type === "mariadb" && (
                                <MariadbIcon className="h-7 w-7" />
                              )}
                              {service.type === "mongo" && (
                                <MongodbIcon className="h-7 w-7" />
                              )}
                              {service.type === "mysql" && (
                                <MysqlIcon className="h-7 w-7" />
                              )}
                              {service.type === "application" && (
                                <GlobeIcon className="h-6 w-6" />
                              )}
                              {service.type === "compose" && (
                                <CircuitBoard className="h-6 w-6" />
                              )}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground overflow-hidden text-ellipsis whitespace-normal break-words min-h-[43px] line-clamp-2">
                            {service.description || ""}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardFooter className="">
                      <div className="space-y-1 text-sm">
                        <DateTooltip
                          date={service.createdAt}
                          branch={service.branch}
                        >
                          Created
                        </DateTooltip>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;
Project.getLayout = (page: ReactElement) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export async function getServerSideProps(
  ctx: GetServerSidePropsContext<{ projectId: string }>
) {
  const { params } = ctx;

  const { req, res } = ctx;
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

  // Valid project, if not return to initial homepage....
  if (typeof params?.projectId === "string") {
    try {
      await helpers.project.one.fetch({
        projectId: params?.projectId,
      });
      return {
        props: {
          trpcState: helpers.dehydrate(),
          projectId: params?.projectId,
        },
      };
    } catch (error) {
      return {
        redirect: {
          permanent: false,
          destination: "/",
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
