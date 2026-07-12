"use client";

import type { ColorSet } from "@/lib/templates/types";
import { cn } from "@/lib/utils";

/** Palette selector — the template's colorSets only (spec §15: 4 sets at launch). */
export function ColorSetPicker({
  colorSets,
  selected,
  onSelect,
}: {
  colorSets: ColorSet[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="בחירת ערכת צבעים" className="flex flex-wrap gap-2">
      {colorSets.map((cs) => (
        <button
          key={cs.key}
          type="button"
          role="radio"
          aria-checked={selected === cs.key}
          onClick={() => onSelect(cs.key)}
          className={cn(
            "flex items-center gap-2 rounded-full border ps-2 pe-3 py-1 text-sm transition",
            selected === cs.key
              ? "border-brand ring-1 ring-brand"
              : "border-gray-300 hover:border-gray-400",
          )}
        >
          <span
            className="inline-block h-5 w-5 rounded-full border"
            style={{ background: cs.accent }}
            aria-hidden
          />
          {cs.label}
        </button>
      ))}
    </div>
  );
}
