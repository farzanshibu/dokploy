import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Valid network drivers
const validDrivers = [
  "bridge",
  "host",
  "none",
  "overlay",
  "ipvlan",
  "macvlan",
] as const;

// Define schema using Zod for validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Network name is required" }),
  driver: z.enum(validDrivers).default("bridge"),
  subnet: z.string().optional(),
  gateway: z.string().optional(),
  ipRange: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
export const CreateNetworkDialog: React.FC<{
  onNetworkCreated: () => void;
}> = ({ onNetworkCreated }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      driver: "bridge", // Default driver
      subnet: "",
      gateway: "",
      ipRange: "",
    },
  });

  // Fetch the current driver value from the form
  const selectedDriver = form.watch("driver");

  const createNetwork = api.docker.createNetwork.useMutation({
    onSuccess: (data) => {
      toast.success("Network created successfully");
      form.reset();
      onNetworkCreated();
      setTimeout(() => setIsOpen(false), 2000);
    },
    onError: (error) => {
      toast.error("Failed to create network");
    },
  });

  const onSubmit = (data: FormData) => {
    createNetwork.mutate(data);
  };

  // Disable fields when the driver doesn't support them
  const isCustomIPSupported = (driver: string) => {
    return !["host", "none"].includes(driver);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Network</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Docker Network</DialogTitle>
          <DialogDescription>
            Configure and create a new Docker network.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter network name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network Driver</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {validDrivers.map((driver) => (
                        <SelectItem key={driver} value={driver}>
                          {driver}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subnet field, only enabled if custom IP addressing is supported */}
            <FormField
              control={form.control}
              name="subnet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subnet (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 192.168.1.0/24"
                      disabled={!isCustomIPSupported(selectedDriver)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gateway field, only enabled if custom IP addressing is supported */}
            <FormField
              control={form.control}
              name="gateway"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gateway (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 192.168.1.1"
                      disabled={!isCustomIPSupported(selectedDriver)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IP Range field, only enabled if custom IP addressing is supported */}
            <FormField
              control={form.control}
              name="ipRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Range (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 192.168.1.100/24"
                      disabled={!isCustomIPSupported(selectedDriver)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={createNetwork.isLoading}
                isLoading={createNetwork.isLoading}
              >
                {createNetwork.isLoading ? "Creating..." : "Create Network"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
