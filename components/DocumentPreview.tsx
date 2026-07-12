import type { CSSProperties, ReactNode } from "react";
import type { ColorSet, TemplateField, TemplateSchema } from "@/lib/templates/types";
import { formatHebrewDate } from "@/lib/hebrewDate";

/**
 * The live document preview — THIS HTML is what Puppeteer will rasterize to PDF
 * (spec §12–13): the downloaded file must match this rendering exactly.
 * Print-exact proportions (A5 = 148×210mm → aspect-ratio), colors only from the
 * template's colorSets, embedded Hebrew typography.
 *
 * Fully generic (spec §4): fields render in JSON order, styled by their declared
 * `role`; fields sharing a `row` render side by side (RTL: first = rightmost) —
 * each invitation type declares its own layout, nothing is hard-coded per type.
 */

export interface PreviewProps {
  schema: TemplateSchema;
  values: Record<string, string>;
  colorSet: ColorSet;
  /** Print mode: exact page dimensions in mm, no screen chrome (shadow/rounding).
   *  Used by the /print page that Puppeteer rasterizes — spec §12. */
  print?: boolean;
}

function rawValue(field: TemplateField, values: Record<string, string>): string {
  const v = values[field.key] ?? field.default ?? "";
  if (!v) return "";
  if (field.type === "select")
    return field.options?.find((o) => o.value === v)?.label ?? v;
  if (field.type === "date") return formatHebrewDate(v);
  return v;
}

/** A field prints only if it has a value and its dependsOn (if any) is satisfied.
 *  dependsOn accepts comma-separated keys — satisfied when ANY of them has a value. */
function printable(field: TemplateField, values: Record<string, string>): boolean {
  if (!rawValue(field, values)) return false;
  if (field.dependsOn) {
    const anyFilled = field.dependsOn
      .split(",")
      .some((key) => (values[key.trim()] ?? "").trim());
    if (!anyFilled) return false;
  }
  return true;
}

/** Group consecutive fields that share the same `row` key into one flex row. */
function groupRows(fields: TemplateField[]): TemplateField[][] {
  const groups: TemplateField[][] = [];
  for (const f of fields) {
    const last = groups[groups.length - 1];
    if (f.row && last && last[0].row === f.row) last.push(f);
    else groups.push([f]);
  }
  return groups;
}

const PAGE_MM = {
  A5: { w: 148, h: 210 },
  A4: { w: 210, h: 297 },
} as const;

export function DocumentPreview({ schema, values, colorSet, print }: PreviewProps) {
  const fields = schema.fields.filter((f) => printable(f, values));
  const role = (f: TemplateField) => f.role ?? "detail";

  const opening = fields.filter((f) => role(f) === "opening");
  const signature = fields.filter((f) => role(f) === "signature");
  const middle = fields.filter((f) => role(f) !== "opening" && role(f) !== "signature");
  const firstDetail = middle.find((f) => role(f) === "detail");

  const page = PAGE_MM[schema.layout.pageSize];
  const outerStyle: CSSProperties = print
    ? { width: `${page.w}mm`, height: `${page.h}mm`, background: colorSet.bg, color: colorSet.fg }
    : { aspectRatio: `${page.w} / ${page.h}`, background: colorSet.bg, color: colorSet.fg };

  const renderField = (f: TemplateField) => {
    const v = rawValue(f, values);
    switch (role(f)) {
      case "body":
        return (
          <p key={f.key} className="max-w-[92%] whitespace-pre-line text-[0.95rem] leading-relaxed">
            {f.prefix}
            {v}
          </p>
        );
      case "name":
        return (
          <div key={f.key} className="flex items-center gap-3">
            {f.prefix && (
              <span className="text-sm font-normal opacity-75">{f.prefix.trim()}</span>
            )}
            <span
              className="text-3xl font-bold leading-snug"
              style={{ color: colorSet.accent }}
            >
              {v}
            </span>
          </div>
        );
      default: // detail
        return (
          <div key={f.key} className="text-sm">
            {f === firstDetail && (
              <div
                className="mx-auto mb-3 h-px w-24"
                style={{ background: colorSet.accent, opacity: 0.6 }}
              />
            )}
            <span className="font-medium">
              {f.prefix}
              {v}
            </span>
          </div>
        );
    }
  };

  const renderSignatureField = (f: TemplateField) => (
    <div
      key={f.key}
      className={
        (f.emphasis ? "text-[0.95rem] font-semibold " : "opacity-85 ") +
        "whitespace-pre-line leading-relaxed"
      }
    >
      {f.prefix}
      {rawValue(f, values)}
    </div>
  );

  const renderGroups = (
    list: TemplateField[],
    render: (f: TemplateField) => ReactNode,
  ) =>
    groupRows(list).map((group) => {
      if (group.length === 1) return render(group[0]);
      // RTL flex row: first field in the JSON lands rightmost (e.g. groom side).
      // Name rows (groom עב"ג bride) sit tight and vertically centered;
      // other rows (times, family columns) keep a wide, top-aligned spread.
      const isNameRow = group.every((f) => (f.role ?? "detail") === "name");
      return (
        <div
          key={group[0].key}
          className={
            isNameRow
              ? "flex w-full items-center justify-center gap-3"
              : "flex w-full items-start justify-center gap-8"
          }
        >
          {group.map((f) => render(f))}
        </div>
      );
    });

  return (
    <div
      dir="rtl"
      className={
        print
          ? "overflow-hidden"
          : "mx-auto w-full max-w-md overflow-hidden rounded-sm shadow-lg"
      }
      style={outerStyle}
    >
      <div
        className="flex h-full flex-col items-center justify-between p-[6%] text-center"
        style={{ border: `1px solid ${colorSet.accent}`, margin: "4%", height: "92%" }}
      >
        {/* opening: בס"ד + motto/verse lines */}
        <div className="flex min-h-[1.5em] flex-col items-center gap-1 text-sm opacity-80">
          {opening.map((f) => (
            <div key={f.key}>{rawValue(f, values)}</div>
          ))}
        </div>

        {/* middle: body / names / details, in the template's declared order */}
        <div className="flex w-full flex-col items-center gap-3">
          {renderGroups(middle, renderField)}
        </div>

        {/* signature: closing line + family columns */}
        <div className="flex w-full flex-col items-center gap-2 text-sm">
          {renderGroups(signature, renderSignatureField)}
        </div>
      </div>
    </div>
  );
}
