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
  serviceName: z.string().min(1, { message: "Service name is required" }),
  replicas: z
    .number()
    .int()
    .positive({ message: "Replicas must be a positive integer" }),
});

type FormData = z.infer<typeof formSchema>;

export const UpdateStackDialog: React.FC<{
  onUpdateStack: () => void;
  serviceName: string;
}> = ({ onUpdateStack, serviceName }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceName: serviceName,
      replicas: 1,
    },
  });

  const updateStack = api.docker.updateStackReplicas.useMutation({
    onSuccess: (data) => {
      toast.success("Stack updated successfully");
      form.reset();
      onUpdateStack();
      setTimeout(() => setIsOpen(false), 2000);
    },
    onError: (error) => {
      toast.error("Failed to update stack");
    },
  });

  const onSubmit = (data: FormData) => {
    updateStack.mutate({
      serviceName: data.serviceName,
      replicas: data.replicas,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Update Stack</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Docker Stack</DialogTitle>
          <DialogDescription>
            Update the number of replicas for a Docker stack service.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter service name"
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="replicas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Replicas</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                      placeholder="Enter number of replicas"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={updateStack.isLoading}
                isLoading={updateStack.isLoading}
              >
                {updateStack.isLoading ? "Updating..." : "Update Stack"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
