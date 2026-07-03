"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";

interface PreviewTerminalProps {
  // Attaches the terminal to the WebContainer shell; returns a cleanup fn.
  bindTerminal: (terminal: Terminal) => () => void;
}

export const PreviewTerminal = ({ bindTerminal }: PreviewTerminalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const terminal = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontSize: 12,
      fontFamily: "monospace",
      theme: { background: "#1f2228" },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    requestAnimationFrame(() => fitAddon.fit());

    // Connect the terminal to the shell (input + output). `bindTerminal` is a
    // stable useCallback, so this effect only ever runs once on mount.
    const unbind = bindTerminal(terminal);

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      unbind();
      terminal.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 p-3 [&_.xterm]:h-full! [&_.xterm-viewport]:h-full! [&_.xterm-screen]:h-full! bg-sidebar"
    />
  );
};
