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

export const ViewHistoryMenuItem = ({ imageId }: { imageId: string }) => {
  const { isLoading, data } = api.docker.getImageHistory.useQuery({
    imageName: imageId,
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          View History
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[625px] lg:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>Docker Image History</DialogTitle>
          <DialogDescription>
            History of the Docker image: {imageId}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <div className="overflow-x-auto h-[50vh]">
            <table className="min-w-full ">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Created Since</th>
                  <th className="py-2 px-4 border-b">Size</th>
                  <th className="py-2 px-4 border-b">Created By</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-900" : ""}
                  >
                    <td className="py-2 px-4 border-b">{item.createdSince}</td>
                    <td className="py-2 px-4 border-b">{item.size}</td>
                    <td className="py-2 px-4 border-b">
                      <div
                        className="max-w-md overflow-hidden"
                        title={item.createdBy}
                      >
                        {item.createdBy}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
