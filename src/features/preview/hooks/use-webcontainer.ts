import { useCallback, useEffect, useRef, useState } from "react";
import { WebContainer, type WebContainerProcess } from "@webcontainer/api";
import type { Terminal } from "@xterm/xterm";

import {
  buildFileTree,
  getFilePath
} from "@/features/preview/utils/file-tree";
import { useFiles } from "@/features/projects/hooks/use-files";

import { Doc, Id } from "../../../../convex/_generated/dataModel";

// Singleton WebContainer instance
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

const getWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (!bootPromise) {
    bootPromise = WebContainer.boot({ coep: "credentialless" });
  }

  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
};

const teardownWebContainer = () => {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
  bootPromise = null;
};

/**
 * Find the directory that holds the project's `package.json` so install/dev run
 * in the right place. Returns:
 *   - ""        → package.json is at the project root
 *   - "app/web" → package.json lives in a subdirectory (monorepo-style)
 *   - null      → no package.json anywhere
 * When multiple exist, the shallowest one wins.
 */
const findPackageJsonDir = (files: Doc<"files">[]): string | null => {
  const filesMap = new Map(files.map((f) => [f._id, f]));
  const packageJsons = files.filter(
    (f) => f.type === "file" && f.name === "package.json"
  );

  if (packageJsons.length === 0) return null;

  let bestDir: string | null = null;
  let bestDepth = Infinity;

  for (const pkg of packageJsons) {
    const path = getFilePath(pkg, filesMap); // e.g. "package.json" or "web/package.json"
    const depth = path.split("/").length;
    if (depth < bestDepth) {
      bestDepth = depth;
      bestDir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    }
  }

  return bestDir;
};

interface UseWebContainerProps {
  projectId: Id<"projects">;
  enabled: boolean;
  settings?: {
    installCommand?: string;
    devCommand?: string;
  };
};

export const useWebContainer = ({
  projectId,
  enabled,
  settings,
}: UseWebContainerProps) => {
  const [status, setStatus] = useState<
    "idle" | "booting" | "installing" | "starting" | "running" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);

  const containerRef = useRef<WebContainer | null>(null);
  const hasStartedRef = useRef(false);

  // Interactive shell wiring. A jsh shell is spawned first so the terminal is
  // always usable (even if install fails); install/dev then run as real
  // processes so status is driven by their exit codes + the server-ready event.
  const shellProcessRef = useRef<WebContainerProcess | null>(null);
  const shellInputRef = useRef<WritableStreamDefaultWriter<string> | null>(null);
  const outputBufferRef = useRef("");
  const terminalWriteRef = useRef<((data: string) => void) | null>(null);

  const writeToTerminal = useCallback((data: string) => {
    outputBufferRef.current += data;
    terminalWriteRef.current?.(data);
  }, []);

  // Fetch files from Convex (auto-updates on changes)
  const files = useFiles(projectId);

  // Initial boot and mount
  useEffect(() => {
    if (!enabled || !files || files.length === 0 || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const start = async () => {
      try {
        setStatus("booting");
        setError(null);
        outputBufferRef.current = "";

        const container = await getWebContainer();
        containerRef.current = container;

        const fileTree = buildFileTree(files);
        await container.mount(fileTree);

        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("running");
        });

        // Where does package.json live? Run everything from there.
        const packageDir = findPackageJsonDir(files);
        const cwd = packageDir ? packageDir : undefined;

        // ---- Interactive shell first, so the terminal always works ---------
        const shell = await container.spawn("jsh", {
          terminal: { cols: 80, rows: 24 },
          cwd,
        });
        shellProcessRef.current = shell;
        shellInputRef.current = shell.input.getWriter();
        shell.output.pipeTo(
          new WritableStream({ write: (data) => writeToTerminal(data) })
        );

        if (packageDir === null) {
          writeToTerminal(
            "\x1b[1;33mNo package.json found in this project.\x1b[0m\r\n" +
              "Use the terminal above to scaffold or configure your app.\r\n"
          );
          setStatus("idle");
          return;
        }

        // ---- Install dependencies ------------------------------------------
        const installCmd = settings?.installCommand || "npm install";
        const [installBin, ...installArgs] = installCmd.split(" ");

        setStatus("installing");
        writeToTerminal(`\x1b[1;33m$ ${installCmd}\x1b[0m\r\n`);

        const installProcess = await container.spawn(installBin, installArgs, {
          cwd,
        });
        installProcess.output.pipeTo(
          new WritableStream({ write: (data) => writeToTerminal(data) })
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          const message = `${installCmd} failed with exit code ${installExitCode}`;
          writeToTerminal(`\r\n\x1b[1;31m${message}\x1b[0m\r\n`);
          setError(message);
          setStatus("error");
          // Keep the shell alive so the user can debug.
          return;
        }

        // ---- Start the dev server ------------------------------------------
        const devCmd = settings?.devCommand || "npm run dev";
        const [devBin, ...devArgs] = devCmd.split(" ");

        setStatus("starting");
        writeToTerminal(`\r\n\x1b[1;33m$ ${devCmd}\x1b[0m\r\n`);

        const devProcess = await container.spawn(devBin, devArgs, { cwd });
        devProcess.output.pipeTo(
          new WritableStream({ write: (data) => writeToTerminal(data) })
        );
        // Not awaited — the dev server runs until teardown; server-ready flips
        // status to "running".
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        writeToTerminal(`\r\n\x1b[1;31m${message}\x1b[0m\r\n`);
        setError(message);
        setStatus("error");
      }
    };

    start();
  }, [
    enabled,
    files,
    restartKey,
    settings?.devCommand,
    settings?.installCommand,
    writeToTerminal,
  ]);

  // Sync file changes (hot-reload)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !files || status !== "running") return;

    const filesMap = new Map(files.map((f) => [f._id, f]));

    for (const file of files) {
      if (file.type !== "file" || file.storageId || !file.content) continue;

      const filePath = getFilePath(file, filesMap);
      container.fs.writeFile(filePath, file.content);
    }
  }, [files, status]);

  // Reset when disabled — syncs external (prop) state into the container
  // lifecycle; the direct setState on the disable transition is intentional.
  useEffect(() => {
    if (!enabled) {
      hasStartedRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("idle");
      setPreviewUrl(null);
      setError(null);
    }
  }, [enabled]);

  // Attach an xterm terminal to the running shell. Returns a cleanup function.
  const bindTerminal = useCallback((terminal: Terminal) => {
    // Replay any output produced before the terminal mounted.
    if (outputBufferRef.current) {
      terminal.write(outputBufferRef.current);
    }

    terminalWriteRef.current = (data) => terminal.write(data);

    const dataListener = terminal.onData((data) => {
      shellInputRef.current?.write(data);
    });
    const resizeListener = terminal.onResize(({ cols, rows }) => {
      shellProcessRef.current?.resize({ cols, rows });
    });

    return () => {
      terminalWriteRef.current = null;
      dataListener.dispose();
      resizeListener.dispose();
    };
  }, []);

  // Restart the entire WebContainer process
  const restart = useCallback(() => {
    shellInputRef.current = null;
    shellProcessRef.current = null;
    terminalWriteRef.current = null;
    outputBufferRef.current = "";
    teardownWebContainer();
    containerRef.current = null;
    hasStartedRef.current = false;
    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
    setRestartKey((k) => k + 1);
  }, []);

  return {
    status,
    previewUrl,
    error,
    restart,
    bindTerminal,
  };
};
