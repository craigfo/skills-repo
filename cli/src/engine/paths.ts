import { join } from "node:path";

export const SIDECAR = ".skills-repo";
export const ARTEFACTS = "artefacts";

export function sidecarPath(cwd: string) {
  return join(cwd, SIDECAR);
}
export function artefactsPath(cwd: string) {
  return join(cwd, ARTEFACTS);
}
export function statePath(cwd: string) {
  return join(sidecarPath(cwd), "state");
}
export function tracesPath(cwd: string) {
  return join(sidecarPath(cwd), "traces");
}
export function skillsPath(cwd: string) {
  return join(sidecarPath(cwd), "skills");
}
export function workflowPath(cwd: string) {
  return join(sidecarPath(cwd), "workflow.yaml");
}
export function profilePath(cwd: string) {
  return join(sidecarPath(cwd), "profile.yaml");
}
export function lockPath(cwd: string) {
  return join(sidecarPath(cwd), "lock.json");
}
export function gitignorePath(cwd: string) {
  return join(cwd, ".gitignore");
}
