import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Resource = {
  id: string;
  name: string;
};

type MenuItemConfig = {
  label: string;
  loadingLabel: string;
  mutationHook: () => {
    mutateAsync: (variables: any) => Promise<any>;
  };
  successMessage: string;
  errorMessage: string;
};

export const useImageDropdownMenuItems = (
  resource: Resource,
  refetchImages: () => void
) => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.shiftKey) {
      setIsShiftPressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!event.shiftKey) {
      setIsShiftPressed(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const createMenuItem = ({
    label,
    loadingLabel,
    mutationHook,
    successMessage,
    errorMessage,
  }: MenuItemConfig) => {
    const [isLoading, setIsLoading] = useState(false);
    const mutation = mutationHook();

    const handleClick = async () => {
      setIsLoading(true);
      toast.promise(
        mutation.mutateAsync({
          imageId: resource.id,
          imageName: resource.name,
          force: isShiftPressed,
        }),
        {
          loading: loadingLabel,
          success: () => {
            setIsLoading(false);
            refetchImages(); // Refetch images after successful operation
            return successMessage;
          },
          error: (error) => {
            setIsLoading(false);
            console.error(`Error in ${label}:`, error);
            return errorMessage;
          },
        }
      );
    };

    return (
      <DropdownMenuItem
        className={cn(
          label === "Delete Image" && isShiftPressed
            ? "bg-red-700 hover:bg-red-900"
            : ""
        )}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? loadingLabel : label}
        {label === "Delete Image" && isShiftPressed && " (Force)"}
      </DropdownMenuItem>
    );
  };

  const deleteImageMenuItem = createMenuItem({
    label: "Delete Image",
    loadingLabel: "Deleting...",
    mutationHook: api.docker.deleteImage.useMutation,
    successMessage: "Image deleted successfully",
    errorMessage: "Failed to delete image",
  });

  const updateImageMenuItem = createMenuItem({
    label: "Check Updates",
    loadingLabel: "Checking...",
    mutationHook: api.docker.updateImage.useMutation,
    successMessage: "Image updated successfully",
    errorMessage: "Failed to update image",
  });

  return { deleteImageMenuItem, updateImageMenuItem };
};
