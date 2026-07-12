/**
 * Smart Template contract (spec §4). A template's `schema` (jsonb in the DB)
 * declares its fields, wording, and layout — adding a document type is inserting
 * a row, never writing code. The DynamicForm and DocumentPreview render from this.
 */

export type FieldType = "text" | "textarea" | "date" | "select";

/**
 * The field's visual role on the document (declared in the JSON — the preview
 * renders fields in array order, styled by role; nothing is hard-coded per type):
 * - "opening"   — small line at the top (e.g. בס"ד)
 * - "body"      — the invitation wording paragraph
 * - "name"      — celebrant name(s), large in the accent color
 * - "detail"    — date/time/venue lines (value printed with `prefix`, no label)
 * - "signature" — closing block at the bottom (נשמח לראותכם, הורים, סבים)
 */
export type FieldRole = "opening" | "body" | "name" | "detail" | "signature";

export interface TemplateField {
  /** Stable key stored in documents.content[key]. */
  key: string;
  label: string;
  type: FieldType;
  /** Visual role on the document. Defaults to "detail". */
  role?: FieldRole;
  /** Default wording (may be a traditional Hebrew phrase, e.g. "בס\"ד") — spec §12. */
  default?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  /** Options for type "select". */
  options?: { value: string; label: string }[];
  /** Printed immediately before the value on the document (e.g. "בשעה ").
   *  On a "name" field it renders small between the large names (e.g. עב"ג). */
  prefix?: string;
  /** Fields sharing the same row key render side by side (e.g. groom|bride,
   *  reception|chuppah, groom-family|bride-family columns). RTL: first = rightmost. */
  row?: string;
  /** Bold/enlarged on the document (e.g. parents' names in the signature). */
  emphasis?: boolean;
  /** Print this field only when the referenced field has a value. */
  dependsOn?: string;
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
