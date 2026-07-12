/**
 * Smart Template contract (spec §4). A template's `schema` (jsonb in the DB)
 * declares its fields, wording, and layout — adding a document type is inserting
 * a row, never writing code. The DynamicForm and DocumentPreview render from this.
 */

export type FieldType = "text" | "textarea" | "date" | "select";

export interface TemplateField {
  /** Stable key stored in documents.content[key]. */
  key: string;
  label: string;
  type: FieldType;
  /** Default wording (may be a traditional Hebrew phrase, e.g. "בס\"ד") — spec §12. */
  default?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  /** Options for type "select". */
  options?: { value: string; label: string }[];
  /** Whether the AI Writer may act on this field. */
  aiEnabled?: boolean;
}

export interface ColorSet {
  key: string;
  label: string;
  /** CSS values used identically in the live preview and the PDF (spec §12). */
  bg: string;
  fg: string;
  accent: string;
}

export interface TemplateLayout {
  /** Page size for the PDF (spec §12): A5 for invitations, A4 for CVs. */
  pageSize: "A5" | "A4";
  orientation: "portrait" | "landscape";
}

export interface TemplateSchema {
  fields: TemplateField[];
  colorSets: ColorSet[];
  layout: TemplateLayout;
}

/** A row of the `templates` table (spec §14). */
export interface Template {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string | null;
  schema: TemplateSchema;
  basePriceAgorot: number;
  isActive: boolean;
}
