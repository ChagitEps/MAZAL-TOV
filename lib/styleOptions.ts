import type { CSSProperties } from "react";
import type { ColorSet } from "@/lib/templates/types";

/**
 * User-selectable style options for a document: font, background, and per-field
 * size. Chosen values live on the draft/document (not the template) and travel
 * with the print payload so preview and PDF stay identical (spec §12).
 */

/** Hebrew fonts (spec §12 mentions פרנק-רול, היבו, דוד). Loaded in app/layout.tsx
 *  via next/font — self-hosted, so Puppeteer embeds them in the PDF too. */
export const FONTS = [
  { key: "heebo", label: "היבו", css: "var(--font-heebo)" },
  { key: "frank", label: "פרנק-רול", css: "var(--font-frank)" },
  { key: "david", label: "דוד", css: "var(--font-david)" },
  { key: "rubik", label: "רוביק", css: "var(--font-rubik)" },
  { key: "secular", label: "סקולר", css: "var(--font-secular)" },
] as const;

export type FontKey = (typeof FONTS)[number]["key"];

export function fontCss(key: string | undefined): string | undefined {
  return FONTS.find((f) => f.key === key)?.css;
}

/** Print-safe backgrounds built from the selected color set (CSS gradients —
 *  render identically on screen and in Puppeteer with printBackground). */
export const BACKGROUNDS = [
  { key: "clean", label: "חלק" },
  { key: "glow", label: "הילה עדינה" },
  { key: "gradient", label: "מעבר צבע" },
  { key: "linen", label: "פסים עדינים" },
  { key: "dots", label: "נקודות" },
] as const;

export type BackgroundKey = (typeof BACKGROUNDS)[number]["key"];

/** A background value may also be artwork the wording integrates into —
 *  ONLY same-origin paths under /backgrounds/ are accepted (no URL injection). */
export function isImageBackground(value: string | undefined): boolean {
  return !!value && value.startsWith("/backgrounds/") && !value.includes("..");
}

export function backgroundCss(key: string | undefined, cs: ColorSet): CSSProperties {
  if (isImageBackground(key)) {
    return {
      backgroundColor: cs.bg,
      backgroundImage: `url("${key}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  switch (key) {
    case "glow":
      return {
        background: `radial-gradient(ellipse 90% 65% at 50% 42%, ${cs.bg} 55%, ${cs.accent}22 100%)`,
      };
    case "gradient":
      return {
        background: `linear-gradient(160deg, ${cs.bg} 55%, ${cs.accent}2e 100%)`,
      };
    case "linen":
      return {
        background: `repeating-linear-gradient(0deg, ${cs.bg} 0 7px, ${cs.accent}0d 7px 8px)`,
      };
    case "dots":
      return {
        backgroundColor: cs.bg,
        backgroundImage: `radial-gradient(${cs.accent}26 1px, transparent 1.3px)`,
        backgroundSize: "14px 14px",
      };
    default: // clean
      return { background: cs.bg };
  }
}

/** Line-spacing scale for the whole document: affects text line-height AND the
 *  vertical gaps between the document's rows — preview and PDF identically. */
export const SPACINGS = [
  { key: "compact", label: "צפוף", factor: 0.8 },
  { key: "normal", label: "רגיל", factor: 1 },
  { key: "spacious", label: "מרווח", factor: 1.25 },
  { key: "wide", label: "רחב", factor: 1.5 },
] as const;

export type SpacingKey = (typeof SPACINGS)[number]["key"];

export function spacingFactor(key: string | undefined): number {
  return SPACINGS.find((s) => s.key === key)?.factor ?? 1;
}

/** Per-field style overrides chosen by the user. Keyed by field key. */
export interface FieldStyle {
  /** Size steps: -3..+3. Each step scales the field's base size by 12%. */
  sizeDelta?: number;
}

export type FieldStyles = Record<string, FieldStyle>;

export const SIZE_MIN = -3;
export const SIZE_MAX = 3;

/** Absolute font size for a role's base size (rem) scaled by the user's delta.
 *  Returns undefined when no delta — the role's Tailwind class stays in charge. */
export function scaledRem(baseRem: number, delta: number | undefined): string | undefined {
  if (!delta) return undefined;
  return `${(baseRem * (1 + delta * 0.12)).toFixed(3)}rem`;
}
