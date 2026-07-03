"use client";

import {
  ArrowUpRightIcon,
  CodeXmlIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import { ThemeToggle } from "@/components/theme-toggle";

import { ProjectsList } from "./projects-list";
import { ProjectsCommandDialog } from "./projects-command-dialog";
import { ImportGithubDialog } from "./import-github-dialog";
import { NewProjectDialog } from "./new-project-dialog";
import Image from "next/image";

const SecondaryAction = ({
  icon,
  label,
  shortcut,
  onClick,
  stagger,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  onClick: () => void;
  stagger: number;
}) => (
  <button
    onClick={onClick}
    style={{ "--stagger-index": stagger } as React.CSSProperties}
    className={cn(
      "stagger-in group flex h-10 items-center gap-2.5 rounded-full border border-border bg-surface-raised pl-4 pr-2.5",
      "text-sm font-medium text-muted-foreground",
      "transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]",
      "hover:border-hairline-strong hover:text-foreground hover:shadow-elevation-low",
      "active:scale-[0.97]",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
      "[&_svg]:size-3.5 [&_svg]:transition-transform [&_svg]:duration-200 group-hover:[&_svg]:scale-110",
    )}
  >
    {icon}
    <span>{label}</span>
    <Kbd className="border border-border bg-muted text-[10px] text-muted-foreground/80">
      {shortcut}
    </Kbd>
  </button>
);

export const ProjectsView = () => {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setCommandDialogOpen(true);
        }
        if (e.key === "i") {
          e.preventDefault();
          setImportDialogOpen(true);
        }
        if (e.key === "j") {
          e.preventDefault();
          setNewProjectDialogOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <ImportGithubDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
      />

      <div className="grain relative flex min-h-screen flex-col overflow-hidden bg-background">
        {/* Ember horizon — a single warm bloom, anchored low */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[60%] opacity-[0.5] [mask-image:radial-gradient(70%_100%_at_50%_100%,black,transparent)]"
        >
          <div className="absolute inset-x-[15%] bottom-0 h-full rounded-[100%] bg-brand/[0.09] blur-3xl" />
        </div>

        {/* ---------------------------------------------------- Top bar -- */}
        <header className="relative z-10 flex h-16 items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brim-logo.jpg"
              alt="Brim"
              className="rounded"
              width={22}
              height={22}
            />
            <span className="text-[15px] font-semibold tracking-tight">
              Brim
            </span>
          </div>
          <ThemeToggle />
        </header>

        {/* ------------------------------------------------------- Hero -- */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-8">
          <div className="w-full max-w-[640px]">
            <div className="flex flex-col items-center text-center">
              <h1
                className="stagger-in text-balance text-[clamp(2.4rem,6vw,3.4rem)] font-medium leading-[1.06] tracking-[-0.03em]"
                style={{ "--stagger-index": 1 } as React.CSSProperties}
              >
                What will you <em className="font-display text-brand">build</em>{" "}
                today?
              </h1>

              <p
                className="stagger-in mt-4 max-w-[400px] text-balance text-[15px] leading-relaxed text-muted-foreground"
                style={{ "--stagger-index": 2 } as React.CSSProperties}
              >
                Describe it, and Brim writes, runs, and refines the code — right
                in your browser.
              </p>
            </div>

            {/* Primary CTA — an AI prompt affordance, not a button */}
            <button
              onClick={() => setNewProjectDialogOpen(true)}
              style={{ "--stagger-index": 3 } as React.CSSProperties}
              className={cn(
                "stagger-in group mt-10 flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 pl-5 text-left",
                "shadow-elevation-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-elevation-high",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
              )}
            >
              <CodeXmlIcon className="size-4 shrink-0 text-brand transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="flex-1 text-[15px] text-muted-foreground transition-colors group-hover:text-foreground/80">
                Ask Brim to build&hellip;
              </span>
              <span className="flex items-center gap-2">
                <Kbd className="border border-border bg-muted text-[10px]">
                  Ctrl + J
                </Kbd>
                <span className="flex size-8 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-elevation-low transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                  <ArrowUpRightIcon className="size-4" />
                </span>
              </span>
            </button>

            {/* Secondary actions */}
            <div className="mt-4 flex items-center justify-center gap-2.5">
              <SecondaryAction
                icon={<FaGithub />}
                label="Import repo"
                shortcut="Ctrl + I"
                onClick={() => setImportDialogOpen(true)}
                stagger={4}
              />
              <SecondaryAction
                icon={<SearchIcon />}
                label="Search projects"
                shortcut="Ctrl + K"
                onClick={() => setCommandDialogOpen(true)}
                stagger={5}
              />
            </div>

            {/* Projects */}
            <div
              className="stagger-in mt-14"
              style={{ "--stagger-index": 6 } as React.CSSProperties}
            >
              <ProjectsList onViewAll={() => setCommandDialogOpen(true)} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
