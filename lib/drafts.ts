/**
 * Local draft persistence (client-side only).
 *
 * Until Supabase accounts land (spec §14 `documents` + V2 cloud drafts), drafts
 * are auto-saved to the browser's localStorage so closing the tab loses nothing.
 * One draft per template. This module is imported only from Client Components.
 */

export interface Draft {
  slug: string;
  templateTitle: string;
  values: Record<string, string>;
  colorKey: string;
  updatedAt: number; // epoch ms
}

const STORAGE_KEY = "mazaltov:drafts";

function readAll(): Record<string, Draft> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeAll(drafts: Record<string, Draft>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // storage full/blocked — auto-save silently unavailable
  }
}

export function loadDraft(slug: string): Draft | null {
  return readAll()[slug] ?? null;
}

export function saveDraft(draft: Omit<Draft, "updatedAt">): void {
  const all = readAll();
  all[draft.slug] = { ...draft, updatedAt: Date.now() };
  writeAll(all);
}

export function deleteDraft(slug: string): void {
  const all = readAll();
  delete all[slug];
  writeAll(all);
}

/** All drafts, newest first — for the "המסמכים שלי" page. */
export function listDrafts(): Draft[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}
