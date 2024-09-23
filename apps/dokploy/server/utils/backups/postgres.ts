import path from "node:path";
import type { BackupSchedule } from "@/server/api/services/backup";
import type { Postgres } from "@/server/api/services/postgres";
import { findProjectById } from "@/server/api/services/project";
import {
	getRemoteServiceContainer,
	getServiceContainer,
} from "../docker/utils";
import { sendDatabaseBackupNotifications } from "../notifications/database-backup";
import { execAsync, execAsyncRemote } from "../process/execAsync";
import { getS3Credentials } from "./utils";

export const runPostgresBackup = async (
	postgres: Postgres,
	backup: BackupSchedule,
) => {
	const { appName, databaseUser, name, projectId } = postgres;
	const project = await findProjectById(projectId);

	const { prefix, database } = backup;
	const destination = backup.destination;
	const backupFileName = `${new Date().toISOString()}.sql.gz`;
	const bucketDestination = path.join(prefix, backupFileName);
	try {
		const rcloneFlags = getS3Credentials(destination);
		const rcloneDestination = `:s3:${destination.bucket}/${bucketDestination}`;

		const rcloneCommand = `rclone rcat ${rcloneFlags.join(" ")} "${rcloneDestination}"`;
		if (postgres.serverId) {
			const { Id: containerId } = await getRemoteServiceContainer(
				postgres.serverId,
				appName,
			);
			const pgDumpCommand = `docker exec ${containerId} sh -c "pg_dump -Fc --no-acl --no-owner -h localhost -U ${databaseUser} --no-password '${database}' | gzip"`;

			await execAsyncRemote(
				postgres.serverId,
				`${pgDumpCommand} | ${rcloneCommand}`,
			);
		} else {
			const { Id: containerId } = await getServiceContainer(appName);

			const pgDumpCommand = `docker exec ${containerId} sh -c "pg_dump -Fc --no-acl --no-owner -h localhost -U ${databaseUser} --no-password '${database}' | gzip"`;
			await execAsync(`${pgDumpCommand} | ${rcloneCommand}`);
		}

		await sendDatabaseBackupNotifications({
			applicationName: name,
			projectName: project.name,
			databaseType: "postgres",
			type: "success",
		});
	} catch (error) {
		await sendDatabaseBackupNotifications({
			applicationName: name,
			projectName: project.name,
			databaseType: "postgres",
			type: "error",
			// @ts-ignore
			errorMessage: error?.message || "Error message not provided",
		});

		throw error;
	} finally {
	}
};

// Restore
// /Applications/pgAdmin 4.app/Contents/SharedSupport/pg_restore --host "localhost" --port "5432" --username "mauricio" --no-password --dbname "postgres" --verbose "/Users/mauricio/Downloads/_databases_2024-04-12T07_02_05.234Z.sql"
