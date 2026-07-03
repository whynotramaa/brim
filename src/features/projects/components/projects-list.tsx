import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  FolderIcon,
  Loader2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Doc } from "../../../../convex/_generated/dataModel";

import { useProjectsPartial } from "../hooks/use-projects";

const formatTimestamp = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });
};

const getProjectIcon = (project: Doc<"projects">, className?: string) => {
  const cls = cn("size-3.5 text-muted-foreground", className);

  if (project.importStatus === "completed") {
    return <FaGithub className={cls} />;
  }
  if (project.importStatus === "failed") {
    return <AlertCircleIcon className={cn(cls, "text-danger")} />;
  }
  if (project.importStatus === "importing") {
    return <Loader2Icon className={cn(cls, "animate-spin text-brand")} />;
  }
  return <FolderIcon className={cls} />;
};

interface ProjectsListProps {
  onViewAll: () => void;
}

const ProjectCard = ({
  data,
  featured = false,
  stagger = 0,
}: {
  data: Doc<"projects">;
  featured?: boolean;
  stagger?: number;
}) => {
  return (
    <Link
      href={`/projects/${data._id}`}
      style={{ "--stagger-index": stagger } as React.CSSProperties}
      className={cn(
        "stagger-in group relative flex flex-col justify-between gap-5 overflow-hidden rounded-xl border border-border bg-surface-raised p-4",
        "transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-[3px] hover:border-hairline-strong hover:shadow-elevation-medium",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        featured && "sm:col-span-2 sm:flex-row sm:items-center",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent transition-colors duration-200 group-hover:bg-brand-muted [&_svg]:transition-transform [&_svg]:duration-200 group-hover:[&_svg]:scale-110">
          {getProjectIcon(data)}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium tracking-tight">
            {data.name}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTimestamp(data.updatedAt)}
          </span>
        </div>
      </div>

      <span
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium text-muted-foreground/0 transition-all duration-200",
          "group-hover:text-muted-foreground",
          featured ? "shrink-0" : "self-end",
        )}
      >
        Open
        <ArrowRightIcon className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
    </Link>
  );
};

const ListSkeleton = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={cn(
          "h-[76px] animate-pulse rounded-xl border border-border bg-accent/30",
          i === 0 && "sm:col-span-2",
        )}
        style={{ animationDelay: `${i * 110}ms` }}
      />
    ))}
  </div>
);

export const ProjectsList = ({ onViewAll }: ProjectsListProps) => {
  const projects = useProjectsPartial(6);

  if (projects === undefined) {
    return <ListSkeleton />;
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-hairline-strong px-6 py-10 text-center">
        <FolderIcon className="mb-1.5 size-5 text-muted-foreground/50" />
        <span className="text-sm font-medium">Nothing here yet</span>
        <span className="max-w-[260px] text-xs leading-relaxed text-muted-foreground">
          Your projects will appear here. Start one above, or import from
          GitHub.
        </span>
      </div>
    );
  }

  const [mostRecent, ...rest] = projects;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Recent work
        </span>
        <button
          onClick={onViewAll}
          className="group flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="link-sweep">View all</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mostRecent ? (
          <ProjectCard data={mostRecent} featured stagger={0} />
        ) : null}
        {rest.map((project, i) => (
          <ProjectCard key={project._id} data={project} stagger={i + 1} />
        ))}
      </div>
    </div>
  );
};
