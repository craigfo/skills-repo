export interface PresetMapping {
  from: string; // path in the source repo (relative to repo root)
  to: string; // path inside the sidecar (relative to .skills-repo/)
}

export interface Preset {
  id: string;
  description: string;
  mappings: PresetMapping[];
}

/**
 * Bundled MVP preset. Content is small and deterministic so local bare-git
 * fixtures in tests can reproduce it exactly.
 *
 * Real presets with a wider skill + standards set land in ps3.1 once the
 * workflow.yaml schema is finalised.
 */
export const STORY_UNIT_MIN: Preset = {
  id: "story-unit-min",
  description: "MVP walking preset: minimal skill + standards subset for dogfood validation.",
  mappings: [
    { from: "skills/definition.md", to: "skills/definition/SKILL.md" },
    { from: "skills/test-plan.md", to: "skills/test-plan/SKILL.md" },
    { from: "skills/definition-of-ready.md", to: "skills/definition-of-ready/SKILL.md" },
    { from: "skills/definition-of-done.md", to: "skills/definition-of-done/SKILL.md" },
    { from: "standards/core.md", to: "standards/software-engineering/core.md" },
  ],
};

export function getPreset(id: string): Preset {
  if (id === STORY_UNIT_MIN.id) return STORY_UNIT_MIN;
  throw new Error(`unknown preset: ${id}`);
}
