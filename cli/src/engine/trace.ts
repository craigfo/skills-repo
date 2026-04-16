import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tracesPath } from "./paths.js";

export interface TraceEntry {
  type: string;
  status: "ok" | "fail" | "warn";
  timestamp: string;
  [key: string]: unknown;
}

export function appendTrace(cwd: string, entry: Omit<TraceEntry, "timestamp">): void {
  const dir = tracesPath(cwd);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const file = join(dir, `${date}.jsonl`);
  const full = { ...entry, timestamp: new Date().toISOString() } as TraceEntry;
  appendFileSync(file, JSON.stringify(full) + "\n", "utf8");
}
