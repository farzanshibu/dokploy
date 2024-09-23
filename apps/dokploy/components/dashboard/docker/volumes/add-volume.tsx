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
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define schema using Zod for validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Volume name is required" }),
});

type FormData = z.infer<typeof formSchema>;

export const CreateVolumeDialog: React.FC<{
  onVolumeCreated: () => void;
}> = ({ onVolumeCreated }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const createVolume = api.docker.createVolume.useMutation({
    onSuccess: (data) => {
      toast.success("Created volume successfully");
      form.reset();
      onVolumeCreated();
      setTimeout(() => setIsOpen(false), 2000);
    },
    onError: (error) => {
      toast.error("Failed to create volume");
    },
  });

  const onSubmit = (data: FormData) => {
    createVolume.mutate({
      volumeName: data.name,
    });
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
                    <Input {...field} placeholder="Enter Volume name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={createVolume.isLoading}
                isLoading={createVolume.isLoading}
              >
                {createVolume.isLoading ? "Creating..." : "Create Volume"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
