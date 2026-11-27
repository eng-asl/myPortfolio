"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import type { TerminalBlockData, TerminalLine } from "@/types/security-notes";
import styles from "./SecurityNotes.module.css";

interface NoteTerminalProps {
  terminal: TerminalBlockData;
  compact?: boolean;
}

function getCopyText(terminal: TerminalBlockData): string {
  if (terminal.copyCommand) return terminal.copyCommand;
  const copyable = terminal.lines.filter((line) => line.kind === "command" || line.copyable);
  if (copyable.length > 0) {
    return copyable.map((line) => line.text).join("\n");
  }
  return terminal.lines.map((line) => line.text).join("\n");
}

function getToneClass(tone?: string): string {
  switch (tone) {
    case "ok":
      return styles.termToneOk;
    case "info":
      return styles.termToneInfo;
    case "warn":
      return styles.termToneWarn;
    case "alert":
      return styles.termToneAlert;
    default:
      return styles.termToneInfo;
  }
}

function renderTerminalLine(line: TerminalLine, index: number) {
  if (line.kind === "command") {
    return (
      <div key={index} className={styles.termLineCommand}>
        <span className={styles.termPrompt}>{line.prompt || "$"}</span>
        <span className={styles.termCommandText}>{line.text}</span>
      </div>
    );
  }

  if (line.kind === "input") {
    return (
      <div key={index} className={styles.termLineInput}>
        <span className={styles.termInputPrompt}>{line.prompt || "Input:"}</span>
        <span className={styles.termInputValue}>{line.text}</span>
      </div>
    );
  }

  if (line.kind === "response") {
    const codeMatch = /^(\d{3})\s+([\s\S]+)$/.exec(line.text);
    return (
      <div key={index} className={styles.termLineResponse}>
        {codeMatch ? (
          <>
            <span className={`${styles.termStatusCode} ${getToneClass(line.statusTone)}`}>
              {codeMatch[1]}
            </span>
            <span className={styles.termResponseText}>{codeMatch[2]}</span>
          </>
        ) : (
          <span className={styles.termResponseText}>{line.text}</span>
        )}
      </div>
    );
  }

  if (line.kind === "comment") {
    return (
      <div key={index} className={styles.termLineComment}>
        {line.text}
      </div>
    );
  }

  return (
    <div key={index} className={styles.termLineOutput}>
      {line.text}
    </div>
  );
}

export function NoteTerminal({ terminal, compact = false }: NoteTerminalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCopyText(terminal));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`${styles.terminalShell} ${compact ? styles.terminalCompact : ""}`}
      data-testid={`note-terminal-${terminal.id}`}
    >
      <div className={styles.terminalChrome}>
        <div className={styles.terminalDots} aria-hidden="true">
          <span className={styles.terminalDotRed} />
          <span className={styles.terminalDotAmber} />
          <span className={styles.terminalDotGreen} />
        </div>
        <div className={styles.terminalTitleGroup}>
          <Terminal size={13} aria-hidden="true" />
          <span className={styles.terminalTitle}>{terminal.title}</span>
        </div>
        <div className={styles.terminalActions}>
          <span className={styles.terminalEnv}>{terminal.environment}</span>
          <button
            type="button"
            className={styles.terminalCopyBtn}
            onClick={handleCopy}
            aria-label={`Copy command for ${terminal.title}`}
            data-copied={copied ? "true" : "false"}
          >
            {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      <div className={styles.terminalBody} role="region" aria-label={terminal.title}>
        {terminal.lines.map((line, index) => renderTerminalLine(line, index))}
      </div>

      {terminal.caption ? <p className={styles.terminalCaption}>{terminal.caption}</p> : null}
    </div>
  );
}
