import { AlertBlock } from "@/components/shared/alert-block";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MountInfoItem } from "@/components/shared/mount-info-item";
import { api } from "@/utils/api";
import { Package } from "lucide-react";
import { AddVolumes } from "../../application/advanced/volumes/add-volumes";
import { DeleteVolume } from "../../application/advanced/volumes/delete-volume";
import { UpdateVolume } from "../../application/advanced/volumes/update-volume";
interface Props {
  mongoId: string;
}

export const ShowVolumes = ({ mongoId }: Props) => {
  const { data, refetch } = api.mongo.one.useQuery(
    {
      mongoId,
    },
    { enabled: !!mongoId }
  );

  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row justify-between flex-wrap gap-4">
        <div>
          <CardTitle className="text-xl">Volumes</CardTitle>
          <CardDescription>
            If you want to persist data in this mongo use the following config
            to setup the volumes
          </CardDescription>
        </div>

        {data && data?.mounts.length > 0 && (
          <AddVolumes serviceId={mongoId} refetch={refetch} serviceType="mongo">
            Add Volume
          </AddVolumes>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data?.mounts.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center gap-3 pt-10">
            <Package className="size-8 text-muted-foreground" />
            <span className="text-base text-muted-foreground">
              No volumes/mounts configured
            </span>
            <AddVolumes
              serviceId={mongoId}
              refetch={refetch}
              serviceType="mongo"
            >
              Add Volume
            </AddVolumes>
          </div>
        ) : (
          <div className="flex flex-col pt-2 gap-4">
            <AlertBlock type="info">
              Please remember to click Redeploy after adding, editing, or
              deleting a mount to apply the changes.
            </AlertBlock>
            <div className="flex flex-col gap-6">
              {data?.mounts.map((mount) => (
                <div key={mount.mountId}>
                  <div
                    key={mount.mountId}
                    className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-10 border rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 flex-col gap-4 sm:gap-8 justify-between w-full">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Mount Type</span>
                        <span className="text-sm text-muted-foreground">
                          {mount.type.toUpperCase()}
                        </span>
                      </div>
                      {mount.type === "volume" && (
                        <MountInfoItem
                          label="Volume Name"
                          value={mount.volumeName}
                        />
                      )}

                      {mount.type === "file" && (
                        <MountInfoItem label="Content" value={mount.content} />
                      )}
                      {mount.type === "bind" && (
                        <MountInfoItem
                          label="Host Path"
                          value={mount.hostPath}
                        />
                      )}
                      <MountInfoItem
                        label="Mount Path"
                        value={mount.mountPath}
                      />
                    </div>
                    <div className="flex flex-row gap-1">
                      <UpdateVolume
                        mountId={mount.mountId}
                        type={mount.type}
                        refetch={refetch}
                        serviceType="mongo"
                      />
                      <DeleteVolume mountId={mount.mountId} refetch={refetch} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
