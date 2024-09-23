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
export const ShowStackContainerMenuItem = ({
  stackId,
}: {
  stackId: string;
}) => {
  const { isLoading, data } = api.docker.getStackDetails.useQuery({
    stackName: stackId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          View Containers
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[625px] lg:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>Docker Stack</DialogTitle>
          <DialogDescription>Docker Stack Details: {stackId}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <div className="overflow-x-auto h-[50vh]">
            <table className="min-w-full ">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Replicas</th>
                  <th className="py-2 px-4 border-b">Image</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-900" : ""}
                  >
                    <td className="py-2 px-4 border-b">{item.id}</td>
                    <td className="py-2 px-4 border-b">{item.name}</td>
                    <td className="py-2 px-4 border-b">{item.replicas}</td>
                    <td className="py-2 px-4 border-b">{item.image}</td>
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
