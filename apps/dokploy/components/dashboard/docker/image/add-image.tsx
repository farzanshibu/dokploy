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

const PullImageSchema = z.object({
  imageName: z.string().min(1, "Image name is required"),
});

type PullImageFormData = z.infer<typeof PullImageSchema>;

interface PullImageDialogProps {
  onImagePulled?: () => void;
}

export const PullImageDialog: React.FC<PullImageDialogProps> = ({
  onImagePulled,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { mutateAsync: pullImage, isLoading } =
    api.docker.pullImage.useMutation();

  const form = useForm<PullImageFormData>({
    resolver: zodResolver(PullImageSchema),
    defaultValues: {
      imageName: "",
    },
  });

  const onSubmit = async (data: PullImageFormData) => {
    try {
      await pullImage(data);
      toast.success("Image pulled successfully");
      setIsOpen(false);
      if (onImagePulled) onImagePulled();
    } catch (error) {
      toast.error("Failed to pull image");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Pull Image</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pull Docker Image</DialogTitle>
          <DialogDescription>
            Enter the name of the Docker image you want to pull.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., nginx:latest" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                {isLoading ? "Pulling..." : "Pull Image"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
