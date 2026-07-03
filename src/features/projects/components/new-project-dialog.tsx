import { z } from "zod";
import ky from "ky";
import { useState } from "react";
import { ArrowLeftIcon, CodeXmlIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const formSchema = z.object({
  name: z.string().trim().min(1, "Please enter a project name"),
  description: z
    .string()
    .trim()
    .min(1, "Tell Brim what you'd like to build"),
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
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { projectId } = await ky
          .post("/api/projects/create-with-prompt", {
            json: { name: value.name.trim(), prompt: value.description.trim() },
            timeout: 30_000,
          })
          .json<{ projectId: string }>();

        toast.success("Project created");
        handleOpenChange(false);
        router.push(`/projects/${projectId}`);
      } catch {
        toast.error("Unable to create project. Please try again.");
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      // Reset after the close animation so content doesn't flash.
      setTimeout(() => {
        form.reset();
        setStep(1);
      }, 150);
    }
  };

  const goToNextStep = async () => {
    // Mark touched so the error renders if invalid, then validate.
    form.setFieldMeta("name", (prev) => ({ ...prev, isTouched: true }));
    await form.validateField("name", "submit");
    if (form.getFieldMeta("name")?.isValid) {
      setStep(2);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0">
        <DialogHeader className="gap-1.5 border-b border-border bg-surface px-6 py-5">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent">
              <CodeXmlIcon className="size-3.5" />
            </span>
            New project
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            {step === 1
              ? "Give your project a name."
              : "Describe what you want to build — this is Brim's first instruction."}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            {step === 1 ? (
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Project name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        autoFocus
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            goToNextStep();
                          }
                        }}
                        aria-invalid={isInvalid}
                        placeholder="my-awesome-app"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            ) : (
              <form.Field name="description">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        What are you building?
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        autoFocus
                        rows={4}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="A todo app with dark mode, drag-to-reorder, and localStorage persistence."
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            )}

            <DialogFooter className="mt-6">
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" variant="brand" onClick={goToNextStep}>
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeftIcon className="size-4" />
                    Back
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
                        {isSubmitting ? "Creating…" : "Create project"}
                      </Button>
                    )}
                  </form.Subscribe>
                </>
              )}
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
