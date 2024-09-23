import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
export const InspectMenuItem = ({ imageId }: { imageId: string }) => {
  const { isLoading, data } = api.docker.getImageInspect.useQuery({
    imageId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          View Inspect
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[625px] lg:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>Docker Image Inspect</DialogTitle>
          <DialogDescription>
            Inspect of the Docker image: {imageId}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <div className="overflow-x-auto h-[50vh]">
            <code>
              <pre className="bg-card">{JSON.stringify(data, null, 2)}</pre>
            </code>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
