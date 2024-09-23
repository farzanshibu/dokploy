import { execAsync, execAsyncRemote } from "@/server/utils/process/execAsync";
import fetch from "node-fetch";

interface DockerHubTagResponse {
  results: Array<{
    name: string;
    last_updated: string;
    images?: Array<{
      digest: string;
      architecture: string;
    }>;
    digest: string;
  }>;
}

// -------------------- CONTAINER OPERATIONS --------------------

export const getContainerConfig = async (containerId: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker inspect ${containerId} --format='{{json .}}'`
    );

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    return JSON.parse(stdout);
  } catch (error) {
    console.error(error);
  }
};

export const getContainers = async (serverId?: string | null) => {
	try {
		const command =
			"docker ps -a --format 'CONTAINER ID : {{.ID}} | Name: {{.Names}} | Image: {{.Image}} | Ports: {{.Ports}} | State: {{.State}} | Status: {{.Status}}'";
		let stdout = "";
		let stderr = "";

		if (serverId) {
			const result = await execAsyncRemote(serverId, command);

			stdout = result.stdout;
			stderr = result.stderr;
		} else {
			const result = await execAsync(command);
			stdout = result.stdout;
			stderr = result.stderr;
		}
		if (stderr) {
			console.error(`Error: ${stderr}`);
			return;
		}

    const lines = stdout.trim().split("\n");

    const containers = lines
      .map((line) => {
        const parts = line.split(" | ");
        const id = parts[0]
          ? parts[0].replace("CONTAINER ID : ", "").trim()
          : "No container id";
        const name = parts[1]
          ? parts[1].replace("Name: ", "").trim()
          : "No container name";
        const image = parts[2]
          ? parts[2].replace("Image: ", "").trim()
          : "No image";
        const ports = parts[3]
          ? parts[3].replace("Ports: ", "").trim()
          : "No ports";
        const state = parts[4]
          ? parts[4].replace("State: ", "").trim()
          : "No state";
        const status = parts[5]
          ? parts[5].replace("Status: ", "").trim()
          : "No status";
        return {
          id,
          name,
          image,
          ports,
          state,
          status,
					serverId,
        };
      })
      .filter((container) => !container.name.includes("dokploy"));

    return containers;
  } catch (error) {
		console.error(error);

		return [];
	}
};

export const getConfig = async (
	containerId: string,
	serverId?: string | null,
) => {
	try {
		const command = `docker inspect ${containerId} --format='{{json .}}'`;
		let stdout = "";
		let stderr = "";
		if (serverId) {
			const result = await execAsyncRemote(serverId, command);
			stdout = result.stdout;
			stderr = result.stderr;
		} else {
			const result = await execAsync(command);
			stdout = result.stdout;
			stderr = result.stderr;
		}

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    const config = JSON.parse(stdout);

    return config;
  } catch (error) {}
};

export const getContainersByAppNameMatch = async (
  appName: string,
  appType?: "stack" | "docker-compose",
	serverId?: string,
) => {
  try {
		let result: string[] = [];
    const cmd =
      "docker ps -a --format 'CONTAINER ID : {{.ID}} | Name: {{.Names}} | State: {{.State}}'";

		const command =
			appType === "docker-compose"
				? `${cmd} --filter='label=com.docker.compose.project=${appName}'`
				: `${cmd} | grep ${appName}`;
		if (serverId) {
			const { stdout, stderr } = await execAsyncRemote(serverId, command);

			if (stderr) {
				return [];
			}

			if (!stdout) return [];
			result = stdout.trim().split("\n");
		} else {
			const { stdout, stderr } = await execAsync(command);

	    if (stderr) {
	      return [];
	    }

	    if (!stdout) return [];

    	result = stdout.trim().split("\n");
		}

    const containers = result.map((line) => {
      const parts = line.split(" | ");
      const containerId = parts[0]
        ? parts[0].replace("CONTAINER ID : ", "").trim()
        : "No container id";
      const name = parts[1]
        ? parts[1].replace("Name: ", "").trim()
        : "No container name";

      const state = parts[2]
        ? parts[2].replace("State: ", "").trim()
        : "No state";
      return {
        containerId,
        name,
        state,
      };
    });

    return containers || [];
  } catch (error) {}

  return [];
};

export const getContainersByAppLabel = async (
	appName: string,
	serverId?: string,
) => {
	try {
		let stdout = "";
		let stderr = "";

		const command = `docker ps --filter "label=com.docker.swarm.service.name=${appName}" --format 'CONTAINER ID : {{.ID}} | Name: {{.Names}} | State: {{.State}}'`;
		if (serverId) {
			const result = await execAsyncRemote(serverId, command);
			stdout = result.stdout;
			stderr = result.stderr;
		} else {
			const result = await execAsync(command);
			stdout = result.stdout;
			stderr = result.stderr;
		}
		if (stderr) {
			console.error(`Error: ${stderr}`);
			return;
		}

    if (!stdout) return [];

    const lines = stdout.trim().split("\n");

    const containers = lines.map((line) => {
      const parts = line.split(" | ");
      const containerId = parts[0]
        ? parts[0].replace("CONTAINER ID : ", "").trim()
        : "No container id";
      const name = parts[1]
        ? parts[1].replace("Name: ", "").trim()
        : "No container name";
      const state = parts[2]
        ? parts[2].replace("State: ", "").trim()
        : "No state";
      return {
        containerId,
        name,
        state,
      };
    });

    return containers || [];
  } catch (error) {}

  return [];
};

export const containerRestart = async (containerId: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker container restart ${containerId}`
    );

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    const config = JSON.parse(stdout);

    return config;
  } catch (error) {}
};

// -------------------- NETWORK OPERATIONS --------------------

// Supported Docker network drivers
const validDrivers = ["bridge", "host", "none", "overlay", "ipvlan", "macvlan"];

export const getNetworks = async () => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker network ls --format 'ID: {{.ID}} | Name: {{.Name}} | Driver: {{.Driver}} | Scope: {{.Scope}}'`
    );

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }

    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split(" | ");
        return {
          id: parts[0] ? parts[0].replace("ID: ", "").trim() : "No network id",
          name: parts[1]
            ? parts[1].replace("Name: ", "").trim()
            : "No network name",
          driver: parts[2]
            ? parts[2].replace("Driver: ", "").trim()
            : "No driver",
          scope: parts[3] ? parts[3].replace("Scope: ", "").trim() : "No scope",
        };
      })
      .filter((container) => !container.name.includes("dokploy"));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getContainersByNetwork = async (networkName: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker network inspect ${networkName} --format '{{json .Containers}}'`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }

    const containers = JSON.parse(stdout);
    return Object.keys(containers).map((key) => ({
      id: key,
      name: containers[key].Name,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createNetwork = async (
  name: string,
  driver = "bridge",
  subnet?: string,
  gateway?: string,
  ipRange?: string
) => {
  try {
    if (!validDrivers.includes(driver)) {
      console.error(
        `Error: Invalid network driver "${driver}". Valid drivers are: ${validDrivers.join(", ")}`
      );
      return;
    }

    let cmd = `docker network create --driver ${driver} ${name}`;

    // Add additional network options if provided
    if (subnet) cmd += ` --subnet ${subnet}`;
    if (gateway) cmd += ` --gateway ${gateway}`;
    if (ipRange) cmd += ` --ip-range ${ipRange}`;

    const { stdout, stderr } = await execAsync(cmd);

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    return stdout.trim();
  } catch (error) {
    console.error(error);
  }
};

export const deleteNetwork = async (networkName: string, isForce?: boolean) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker network rm ${networkName} ${isForce ? "-f" : ""}`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    return stdout.trim();
  } catch (error) {
    console.error(error);
  }
};

// -------------------- VOLUME OPERATIONS --------------------
export const getVolumes = async () => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker volume ls --format 'Name: {{.Name}} | Driver: {{.Driver}}'`
    );

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }

    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split(" | ");
        const name = parts[0]
          ? parts[0].replace("Name: ", "").trim()
          : "No volume name";
        return {
          id: name, // Using the volume name as the ID
          name: name,
          driver: parts[1]
            ? parts[1].replace("Driver: ", "").trim()
            : "No driver",
        };
      })
      .filter((container) => !container.name.includes("dokploy"));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getContainersByVolume = async (volumeName: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker ps -a --filter volume=${volumeName} --format 'ID: {{.ID}} | Name: {{.Names}}'`
    );

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }

    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split(" | ");
        return {
          id: parts[0]
            ? parts[0].replace("ID: ", "").trim()
            : "No container id",
          name: parts[1]
            ? parts[1].replace("Name: ", "").trim()
            : "No container name",
        };
      });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createVolume = async (volumeName: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker volume create ${volumeName}`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    return stdout.trim();
  } catch (error) {
    console.error(error);
  }
};

export const deleteVolume = async (volumeName: string, isForce?: boolean) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker volume rm ${volumeName} ${isForce ? "-f" : ""}`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    return stdout.trim();
  } catch (error) {
    console.error(error);
  }
};

// -------------------- IMAGE OPERATIONS --------------------

interface DockerImage {
  name: string;
  tag: string;
  id: string;
  size: string;
  created: string;
  updateAvailable: boolean;
}

export const getImages = async (): Promise<DockerImage[]> => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker images --format 'Repository: {{.Repository}} | Tag: {{.Tag}} | Image ID: {{.ID}} | Size: {{.Size}} | Created: {{.CreatedSince}}'`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }
    const images: DockerImage[] = stdout
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split(" | ");
        return {
          name: parts[0]
            ? parts[0].replace("Repository: ", "").trim()
            : "No repository",
          tag: parts[1] ? parts[1].replace("Tag: ", "").trim() : "No tag",
          id: parts[2]
            ? parts[2].replace("Image ID: ", "").trim()
            : "No image id",
          size: parts[3] ? parts[3].replace("Size: ", "").trim() : "No size",
          created: parts[4]
            ? parts[4].replace("Created: ", "").trim()
            : "No created",
          updateAvailable: false,
        };
      })
      .filter((container) => !container.name.includes("dokploy"));
    // Check for updates
    for (let image of images) {
      if (image.name !== "No repository" && image.tag !== "No tag") {
        image.updateAvailable = await checkForImageUpdate(
          image.name,
          image.tag
        );
      }
    }
    return images;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getContainersByImage = async (imageName: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker ps -a --filter ancestor=${imageName} --format 'ID: {{.ID}} | Name: {{.Names}} | Status: {{.Status}}'`
    );

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }

    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split(" | ");
        return {
          id: parts[0]
            ? parts[0].replace("ID: ", "").trim()
            : "No container id",
          name: parts[1]
            ? parts[1].replace("Name: ", "").trim()
            : "No container name",
          status: parts[2]
            ? parts[2].replace("Status: ", "").trim()
            : "No status",
        };
      });
  } catch (error) {
    console.error(error);
    return;
  }
};

export const pullImage = async (imageName: string) => {
  try {
    const { stdout, stderr } = await execAsync(`docker pull ${imageName}`);
    if (stderr && !stderr.includes("Status: Image is up to date")) {
      console.error(`Error: ${stderr}`);
      return null;
    }
    return stdout.trim();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteImage = async (
  imageId: string,
  isForce?: boolean
): Promise<string> => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker rmi ${imageId} ${isForce ? "-f" : ""}`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      throw new Error(stderr);
    }
    return stdout.trim();
  } catch (error) {
    console.error(`Error deleting image ${imageId}:`, error);
    throw new Error("Failed to delete image");
  }
};

const getImageRepoDigests = async (
  imageName: string,
  tag: string
): Promise<string | null> => {
  try {
    const { stdout } = await execAsync(
      `docker inspect --format='{{index .RepoDigests 0}}' ${imageName}:${tag}`
    );
    return stdout.trim().split("@")[1] || null;
  } catch (error) {
    console.error(`Error getting image digest: ${error}`);
    return null;
  }
};

const checkForImageUpdate = async (
  imageName: string,
  currentTag: string
): Promise<boolean> => {
  try {
    // Base URL for Docker Hub API
    let baseUrl = `https://hub.docker.com/v2/repositories/`;

    // For official Docker images
    if (!imageName.includes("/")) {
      baseUrl += `library/${imageName}`;
    } else {
      baseUrl += imageName;
    }

    // Now, get the list of tags to find the latest
    const tagsUrl = `${baseUrl}/tags?page_size=100&ordering=last_updated`;
    const tagsResponse = await fetch(tagsUrl);

    if (!tagsResponse.ok) {
      console.error(`Error fetching tags: ${tagsResponse.statusText}`);
      return false;
    }

    const tagsData = await tagsResponse.json();

    if (!isDockerHubTagResponse(tagsData)) {
      console.error("Unexpected data format from Docker Hub API");
      return false;
    }

    if (tagsData.results.length === 0) {
      console.error("No tags available from Docker Hub API");
      return false;
    }

    // Find the latest non-alpha/beta/rc tag
    const latestTag = tagsData.results.find((tag) => {
      return tag.name.includes("latest");
    });

    if (!latestTag) {
      console.error("No suitable latest tag found");
      return false;
    }

    const latestVersion = latestTag.name;

    // Compare digests to determine if an update is actually available
    const currentDigest = await getImageRepoDigests(imageName, currentTag);
    // get architecture type from the currnet image
    const currentImage = await getImageInspect(`${imageName}:${currentTag}`);
    const currentArchitecture = currentImage?.Architecture;
    const latestDigest = latestTag.images?.find(
      (img) => img.architecture === currentArchitecture
    )?.digest;
    const latestDigest2 = latestTag.digest;

    if (currentDigest && latestDigest) {
      const digestsMatch =
        currentDigest === latestDigest || currentDigest === latestDigest2;
      return !digestsMatch;
    }

    // If we can't compare digests, fall back to comparing tag names
    const updateAvailable = latestVersion !== currentTag;
    return updateAvailable;
  } catch (error) {
    console.error(`Error checking for updates: ${error}`);
    return false;
  }
};

function isDockerHubTagResponse(data: unknown): data is DockerHubTagResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as DockerHubTagResponse).results) &&
    (data as DockerHubTagResponse).results.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        typeof item.name === "string" &&
        "last_updated" in item &&
        typeof item.last_updated === "string" &&
        (!("images" in item) || Array.isArray(item.images))
    )
  );
}
export const updateImage = async (imageName: string) => {
  let stoppedContainers = [];
  try {
    // Get containers using this image
    const { stdout: containersStdout } = await execAsync(
      `docker ps -a --filter ancestor=${imageName} --format '{{.ID}}'`
    );
    const containerIds = containersStdout
      .trim()
      .split("\n")
      .filter((id) => id);

    // Stop all containers using this image
    for (const containerId of containerIds) {
      await execAsync(`docker stop ${containerId}`);
      stoppedContainers.push(containerId);
    }
    console.log(
      `Stopped ${stoppedContainers.length} containers using image ${imageName}`
    );

    // Pull the new image
    const { stdout, stderr } = await execAsync(`docker pull ${imageName}`);
    if (stderr && !stderr.includes("Status: Image is up to date")) {
      throw new Error(stderr);
    }
    const updated = stdout.includes("Status: Downloaded newer image");

    // Restart all stopped containers
    for (const containerId of stoppedContainers) {
      await execAsync(`docker start ${containerId}`);
    }
    console.log(
      `Restarted ${stoppedContainers.length} containers after updating image ${imageName}`
    );

    return {
      updated,
      message: updated
        ? `Image updated successfully. Restarted ${stoppedContainers.length} containers.`
        : `Image is already up to date. Restarted ${stoppedContainers.length} containers.`,
    };
  } catch (error) {
    console.error(`Error updating image ${imageName}:`, error);

    // Attempt to restart any containers that were stopped, even if the update failed
    for (const containerId of stoppedContainers) {
      try {
        await execAsync(`docker start ${containerId}`);
      } catch (restartError) {
        console.error(
          `Failed to restart container ${containerId}:`,
          restartError
        );
      }
    }

    throw new Error("Failed to update image");
  }
};

export const getImageInspect = async (imageName: string): Promise<any> => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker image inspect ${imageName}`
    );

    if (stderr) {
      console.error(`Error: ${stderr}`);
      throw new Error(stderr);
    }

    // Parse the JSON output
    const inspectData = JSON.parse(stdout);

    // Docker inspect returns an array, but we're inspecting a single image,
    // so we can return the first (and only) element
    return inspectData[0];
  } catch (error) {
    console.error(`Failed to inspect image ${imageName}:`, error);
    throw error;
  }
};

export const getImageHistory = async (imageName: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker history ${imageName}   --format "{{.CreatedSince}}|{{.Size}}|{{.CreatedBy}}"`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }
    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const [createdSince, size, createdBy] = line.split("|");
        return { createdSince, size, createdBy };
      });
  } catch (error) {
    console.error(error);
    return [];
  }
};

// -------------------- STACK OPERATIONS --------------------

export const getStacks = async () => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker stack ls --format 'Name: {{.Name}} | Services: {{.Services}} | Orchestrator: {{.Orchestrator}}'`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }

    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split(" | ");
        const name = parts[0]
          ? parts[0].replace("Name: ", "").trim()
          : "No stack name";
        return {
          id: name, // Using the stack name as the ID
          name: name,
          services: parts[1]
            ? parseInt(parts[1].replace("Services: ", "").trim())
            : 0,
          orchestrator: parts[2]
            ? parts[2].replace("Orchestrator: ", "").trim()
            : "No orchestrator",
        };
      })
      .filter((container) => !container.name.includes("dokploy"));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getStackDetails = async (stackName: string) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker stack services ${stackName} --format 'ID: {{.ID}} | Name: {{.Name}} | Replicas: {{.Replicas}} | Image: {{.Image}}'`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return [];
    }

    return stdout
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split(" | ");
        return {
          id: parts[0] ? parts[0].replace("ID: ", "").trim() : "No service id",
          name: parts[1]
            ? parts[1].replace("Name: ", "").trim()
            : "No service name",
          replicas: parts[2]
            ? parts[2].replace("Replicas: ", "").trim()
            : "No replicas",
          image: parts[3] ? parts[3].replace("Image: ", "").trim() : "No image",
        };
      });
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const updateStackReplicas = async (
  serviceName: string,
  replicas: number
) => {
  try {
    const { stdout, stderr } = await execAsync(
      `docker service scale ${serviceName}=${replicas}`
    );
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    return stdout.trim();
  } catch (error) {
    console.error(error);
  }
};
