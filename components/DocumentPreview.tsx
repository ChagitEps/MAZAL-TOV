import type { ColorSet, TemplateField, TemplateSchema } from "@/lib/templates/types";
import { formatHebrewDate } from "@/lib/hebrewDate";

/**
 * The live document preview — THIS HTML is what Puppeteer will rasterize to PDF
 * (spec §12–13): the downloaded file must match this rendering exactly.
 * Print-exact proportions (A5 = 148×210mm → aspect-ratio), colors only from the
 * template's colorSets, embedded Hebrew typography.
 *
 * Fully generic (spec §4): fields render in JSON order, styled by their declared
 * `role` (opening / body / name / detail / signature) — never by a hard-coded
 * document type. Dates print as Hebrew calendar date + Gregorian in parentheses.
 */

export interface PreviewProps {
  schema: TemplateSchema;
  values: Record<string, string>;
  colorSet: ColorSet;
}

function displayValue(field: TemplateField, values: Record<string, string>): string {
  const v = values[field.key] ?? field.default ?? "";
  if (!v) return "";
  let text = v;
  if (field.type === "select")
    text = field.options?.find((o) => o.value === v)?.label ?? v;
  if (field.type === "date") text = formatHebrewDate(v);
  return `${field.prefix ?? ""}${text}`;
}

/** A field prints only if it has a value and its dependsOn (if any) is satisfied. */
function printable(field: TemplateField, values: Record<string, string>): boolean {
  if (!displayValue(field, values)) return false;
  if (field.dependsOn) {
    const dep = values[field.dependsOn] ?? "";
    if (!dep.trim()) return false;
  }
  return true;
}

export function DocumentPreview({ schema, values, colorSet }: PreviewProps) {
  const fields = schema.fields.filter((f) => printable(f, values));
  const role = (f: TemplateField) => f.role ?? "detail";

  const opening = fields.filter((f) => role(f) === "opening");
  const signature = fields.filter((f) => role(f) === "signature");
  const middle = fields.filter((f) => role(f) !== "opening" && role(f) !== "signature");
  const firstDetailKey = middle.find((f) => role(f) === "detail")?.key;

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
        {/* opening line(s), e.g. בס"ד */}
        <div className="min-h-[1.5em] text-sm opacity-80">
          {opening.map((f) => (
            <div key={f.key}>{displayValue(f, values)}</div>
          ))}
        </div>

        {/* middle: body / names / details, in the template's declared order */}
        <div className="flex w-full flex-col items-center gap-3">
          {middle.map((f) => {
            const v = displayValue(f, values);
            switch (role(f)) {
              case "body":
                return (
                  <p
                    key={f.key}
                    className="max-w-[85%] whitespace-pre-line text-[0.95rem] leading-relaxed"
                  >
                    {v}
                  </p>
                );
              case "name":
                return (
                  <div
                    key={f.key}
                    className="text-3xl font-bold leading-snug"
                    style={{ color: colorSet.accent }}
                  >
                    {v}
                  </div>
                );
              default: // detail
                return (
                  <div key={f.key} className="text-sm">
                    {f.key === firstDetailKey && (
                      <div
                        className="mx-auto mb-3 h-px w-24"
                        style={{ background: colorSet.accent, opacity: 0.6 }}
                      />
                    )}
                    <span className="font-medium">{v}</span>
                  </div>
                );
            }
          })}
        </div>

        {/* signature block: closing line, parents, grandparents */}
        <div className="flex flex-col items-center gap-1 text-sm">
          {signature.map((f) => (
            <div
              key={f.key}
              className={f.emphasis ? "text-base font-semibold" : "opacity-85"}
            >
              {displayValue(f, values)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
