import ky, { HTTPError } from "ky";
import { z } from "zod";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { authClient } from "@/lib/auth-client";
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

import { Id } from "../../../../convex/_generated/dataModel";

const formSchema = z.object({
  url: z.url("Please enter a valid URL"),
});

interface ImportGithubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportGithubDialog = ({
  open,
  onOpenChange,
}: ImportGithubDialogProps) => {
  const router = useRouter();

  const reconnectGithub = () =>
    authClient.linkSocial({
      provider: "github",
      scopes: ["repo"],
      callbackURL: window.location.href,
    });

  const form = useForm({
    defaultValues: {
      url: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { projectId } = await ky
          .post("/api/github/import", {
            json: { url: value.url },
          })
          .json<{ 
            success: boolean; 
            projectId: Id<"projects">,
            eventId: string;
          }>()

        toast.success("Importing repository...");
        onOpenChange(false);
        form.reset();

        router.push(`/projects/${projectId}`);
      } catch (error) {
        if (error instanceof HTTPError) {
          const body = await error.response.json<{ error: string }>();
          if (body.error?.includes("GitHub not connected")) {
            toast.error("GitHub account not connected", {
              action: {
                label: "Connect",
                onClick: () => reconnectGithub(),
              },
            });
            onOpenChange(false);
            return;
          }
        }
        toast.error("Unable to import repository. Please check the URL and try again");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0">
        <DialogHeader className="gap-1.5 border-b border-border bg-surface px-6 py-5">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent">
              <FaGithub className="size-3.5" />
            </span>
            Import from GitHub
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Paste a repository URL — Brim creates a new project with its
            contents.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="url">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Repository URL
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://github.com/owner/repo"
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
                  {isSubmitting ? "Importing…" : "Import repository"}
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
