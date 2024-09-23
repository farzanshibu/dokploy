import { z } from "zod";
import {
  containerRestart,
  createNetwork,
  createVolume,
  deleteImage,
  deleteNetwork,
  deleteVolume,
  getConfig,
  getContainerConfig,
  getContainers,
  getContainersByAppLabel,
  getContainersByAppNameMatch,
  getContainersByImage,
  getContainersByNetwork,
  getContainersByVolume,
  getImageHistory,
  getImageInspect,
  getImages,
  getNetworks,
  getStackDetails,
  getStacks,
  getVolumes,
  pullImage,
  updateImage,
  updateStackReplicas,
} from "../services/docker";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const dockerRouter = createTRPCRouter({
  // New procedures for container operations
  getContainerConfig: protectedProcedure
    .input(
      z.object({
        containerId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return await getContainerConfig(input.containerId);
    }),

  getContainers: protectedProcedure
		.input(
			z.object({
				serverId: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
	    return await getContainers(input.serverId);
	  }),

  restartContainer: protectedProcedure
    .input(
      z.object({
        containerId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await containerRestart(input.containerId);
    }),

  getConfig: protectedProcedure
    .input(
      z.object({
        containerId: z.string().min(1),
				serverId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getConfig(input.containerId, input.serverId);
    }),

  getContainersByAppNameMatch: protectedProcedure
    .input(
      z.object({
        appType: z
          .union([z.literal("stack"), z.literal("docker-compose")])
          .optional(),
        appName: z.string().min(1),
				serverId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getContainersByAppNameMatch(
				input.appName,
				input.appType,
				input.serverId,
			);
    }),

  getContainersByAppLabel: protectedProcedure
    .input(
      z.object({
        appName: z.string().min(1),
				serverId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getContainersByAppLabel(input.appName, input.serverId);
    }),

  // New procedures for network operations
  getNetworks: protectedProcedure.query(async () => {
    return await getNetworks();
  }),

  getContainersByNetwork: protectedProcedure
    .input(
      z.object({
        networkName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return await getContainersByNetwork(input.networkName);
    }),

  createNetwork: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        driver: z.string().optional(),
        subnet: z.string().optional(),
        gateway: z.string().optional(),
        ipRange: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createNetwork(
        input.name,
        input.driver || "bridge",
        input.subnet,
        input.gateway,
        input.ipRange
      );
    }),

  deleteNetwork: protectedProcedure
    .input(
      z.object({
        networkName: z.string().min(1),
        isForce: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteNetwork(input.networkName, input.isForce);
    }),

  // New procedures for volume operations
  getVolumes: protectedProcedure.query(async () => {
    return await getVolumes();
  }),

  getContainersByVolume: protectedProcedure
    .input(
      z.object({
        volumeName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return await getContainersByVolume(input.volumeName);
    }),

  createVolume: protectedProcedure
    .input(
      z.object({
        volumeName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await createVolume(input.volumeName);
    }),

  deleteVolume: protectedProcedure
    .input(
      z.object({
        volumeName: z.string().min(1),
        isForce: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteVolume(input.volumeName, input.isForce);
    }),

  // New procedures for image operations
  getImages: protectedProcedure.query(async () => {
    return await getImages();
  }),

  getContainersByImage: protectedProcedure
    .input(
      z.object({
        imageName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return await getContainersByImage(input.imageName);
    }),

  getImageInspect: protectedProcedure
    .input(
      z.object({
        imageId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return await getImageInspect(input.imageId);
    }),

  pullImage: protectedProcedure
    .input(
      z.object({
        imageName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await pullImage(input.imageName);
    }),

  deleteImage: protectedProcedure
    .input(
      z.object({
        imageId: z.string().min(1),
        isForce: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteImage(input.imageId, input.isForce);
    }),

  updateImage: protectedProcedure
    .input(
      z.object({
        imageName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await updateImage(input.imageName);
    }),

  getImageHistory: protectedProcedure
    .input(
      z.object({
        imageName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return await getImageHistory(input.imageName);
    }),

  // New procedures for stack operations
  getStacks: protectedProcedure.query(async () => {
    return await getStacks();
  }),

  getStackDetails: protectedProcedure
    .input(
      z.object({
        stackName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      return await getStackDetails(input.stackName);
    }),

  updateStackReplicas: protectedProcedure
    .input(
      z.object({
        serviceName: z.string().min(1),
        replicas: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateStackReplicas(input.serviceName, input.replicas);
    }),
});
