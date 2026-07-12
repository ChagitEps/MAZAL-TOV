import type { ColorSet, TemplateField, TemplateSchema } from "@/lib/templates/types";

/**
 * The live document preview — THIS HTML is what Puppeteer will rasterize to PDF
 * (spec §12–13): the downloaded file must match this rendering exactly.
 * Print-exact proportions (A5 = 148×210mm → aspect-ratio), colors only from the
 * template's colorSets, embedded Hebrew typography.
 *
 * Fully generic: visual roles are derived from the template JSON (field order +
 * type), never from a hard-coded document type (spec §4).
 */

export interface PreviewProps {
  schema: TemplateSchema;
  values: Record<string, string>;
  colorSet: ColorSet;
}

interface Roles {
  opening: TemplateField | null;   // first short text field (e.g. בס"ד)
  names: TemplateField[];          // required short texts before the body
  body: TemplateField | null;      // the first textarea
  details: TemplateField[];        // everything after the body
}

function assignRoles(fields: TemplateField[]): Roles {
  const bodyIdx = fields.findIndex((f) => f.type === "textarea");
  const before = bodyIdx === -1 ? fields : fields.slice(0, bodyIdx);
  const after = bodyIdx === -1 ? [] : fields.slice(bodyIdx + 1);
  const opening = before.length && !before[0].required ? before[0] : null;
  return {
    opening,
    names: before.filter((f) => f !== opening && f.type === "text"),
    body: bodyIdx === -1 ? null : fields[bodyIdx],
    details: after,
  };
}

function displayValue(field: TemplateField, values: Record<string, string>): string {
  const v = values[field.key] ?? field.default ?? "";
  if (!v) return "";
  if (field.type === "select")
    return field.options?.find((o) => o.value === v)?.label ?? v;
  if (field.type === "date") {
    const d = new Date(v);
    if (!isNaN(d.getTime()))
      return new Intl.DateTimeFormat("he-IL", { dateStyle: "full" }).format(d);
  }
  return v;
}

export function DocumentPreview({ schema, values, colorSet }: PreviewProps) {
  const roles = assignRoles(schema.fields);
  const aspect = schema.layout.pageSize === "A4" ? "210 / 297" : "148 / 210";

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-md overflow-hidden rounded-sm shadow-lg"
      style={{ aspectRatio: aspect, background: colorSet.bg, color: colorSet.fg }}
    >
      <div
        className="flex h-full flex-col items-center justify-between p-[7%] text-center"
        style={{ border: `1px solid ${colorSet.accent}`, margin: "4%", height: "92%" }}
      >
        {/* opening line (e.g. בס"ד) */}
        <div className="min-h-[1.5em] text-sm opacity-80">
          {roles.opening ? displayValue(roles.opening, values) : ""}
        </div>

        {/* names — the celebrants, large and in the accent color */}
        <div className="flex flex-col items-center gap-1">
          {roles.names.map((f, i) => (
            <div key={f.key} className="flex flex-col items-center">
              {i > 0 && (
                <span className="text-lg leading-none" style={{ color: colorSet.accent }}>
                  ♦
                </span>
              )}
              <span
                className="text-3xl font-bold leading-snug"
                style={{ color: colorSet.accent }}
              >
                {displayValue(f, values) || f.label}
              </span>
            </div>
          ))}
        </div>

        {/* body — the invitation wording */}
        {roles.body && (
          <p className="max-w-[85%] whitespace-pre-line text-[0.95rem] leading-relaxed">
            {displayValue(roles.body, values)}
          </p>
        )}

        {/* details — date, venue, times */}
        <div className="flex flex-col items-center gap-0.5 text-sm">
          <div
            className="mb-2 h-px w-24"
            style={{ background: colorSet.accent, opacity: 0.6 }}
          />
          {roles.details.map((f) => {
            const v = displayValue(f, values);
            return v ? (
              <div key={f.key}>
                <span className="opacity-70">{f.label}: </span>
                <span className="font-medium">{v}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
