import { z } from "zod";
import { CodeXmlIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { useCreateProject } from "../hooks/use-projects";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a project name"),
});

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewProjectDialog = ({
  open,
  onOpenChange,
}: NewProjectDialogProps) => {
  const router = useRouter();
  const createProject = useCreateProject();

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const projectId = await createProject({ name: value.name });
        toast.success("Project created");
        onOpenChange(false);
        form.reset();
        router.push(`/projects/${projectId}`);
      } catch {
        toast.error("Unable to create project. Please try again.");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0">
        <DialogHeader className="gap-1.5 border-b border-border bg-surface px-6 py-5">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent">
              <CodeXmlIcon className="size-3.5" />
            </span>
            New project
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Give your project a name and Brim will start building.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Project name
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="my-awesome-app"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    variant="brand"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? "Creating\u2026" : "Create project"}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
