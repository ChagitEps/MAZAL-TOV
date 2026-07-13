import type { CSSProperties, ReactNode } from "react";
import type { ColorSet, TemplateField, TemplateSchema } from "@/lib/templates/types";
import { formatHebrewDate } from "@/lib/hebrewDate";
import {
  backgroundCss,
  fontCss,
  isImageBackground,
  scaledRem,
  spacingFactor,
  type FieldStyles,
} from "@/lib/styleOptions";

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
  /** User style choices (lib/styleOptions.ts) — travel with the draft & PDF. */
  font?: string;
  background?: string;
  spacing?: string;
  styles?: FieldStyles;
  /** Print mode: exact page dimensions in mm, no screen chrome (shadow/rounding).
   *  Used by the /print page that Puppeteer rasterizes — spec §12. */
  print?: boolean;
}

/** fontSize override for a field: the role's base size (rem) scaled by the
 *  user's delta. undefined when untouched — the Tailwind class stays in charge. */
function sizeStyle(
  styles: FieldStyles | undefined,
  key: string,
  baseRem: number,
): CSSProperties | undefined {
  const fontSize = scaledRem(baseRem, styles?.[key]?.sizeDelta);
  return fontSize ? { fontSize } : undefined;
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

/** Document variant (CV, letters): start-aligned professional flow — spec §6. */
function DocumentVariant({ schema, values, colorSet, spacing, styles }: Omit<PreviewProps, "print">) {
  const fields = schema.fields.filter((f) => printable(f, values));
  const role = (f: TemplateField) => f.role ?? "detail";
  const sp = spacingFactor(spacing);

  // Consecutive details merge into one "phone · email · city" contact line.
  const blocks: (TemplateField | TemplateField[])[] = [];
  for (const f of fields) {
    const last = blocks[blocks.length - 1];
    if (role(f) === "detail" && Array.isArray(last)) last.push(f);
    else if (role(f) === "detail") blocks.push([f]);
    else blocks.push(f);
  }

  return (
    <div
      className="flex h-full flex-col p-[8%] text-start"
      style={{ rowGap: `${1 * sp}rem`, lineHeight: +(1.5 * sp).toFixed(3) }}
    >
      {blocks.map((block) => {
        if (Array.isArray(block)) {
          return (
            <div key={block[0].key} className="text-sm opacity-85">
              {block.map((f, i) => (
                <span key={f.key} style={sizeStyle(styles, f.key, 0.875)}>
                  {i > 0 && <span className="mx-2 opacity-60">·</span>}
                  {f.prefix}
                  {rawValue(f, values)}
                </span>
              ))}
            </div>
          );
        }
        const f = block;
        const v = rawValue(f, values);
        switch (role(f)) {
          case "opening":
            return (
              <div key={f.key} className="text-xs opacity-70" style={sizeStyle(styles, f.key, 0.75)}>
                {v}
              </div>
            );
          case "name":
            return (
              <h1
                key={f.key}
                className="text-3xl font-bold leading-tight"
                style={{ color: colorSet.accent, ...sizeStyle(styles, f.key, 1.875) }}
              >
                {v}
              </h1>
            );
          case "body":
            return (
              <p key={f.key} className="-mt-2 whitespace-pre-line text-base" style={sizeStyle(styles, f.key, 1)}>
                {v}
              </p>
            );
          case "section":
            return (
              <section key={f.key}>
                <h2
                  className="mb-1 border-b pb-1 text-sm font-bold"
                  style={{ color: colorSet.accent, borderColor: `${colorSet.accent}66` }}
                >
                  {f.label}
                </h2>
                <div
                  className="whitespace-pre-line text-sm"
                  style={{ lineHeight: +(1.625 * sp).toFixed(3), ...sizeStyle(styles, f.key, 0.875) }}
                >
                  {v}
                </div>
              </section>
            );
          default: // signature
            return (
              <div
                key={f.key}
                className={
                  (f.emphasis ? "font-semibold " : "opacity-85 ") +
                  "mt-auto whitespace-pre-line text-sm"
                }
                style={sizeStyle(styles, f.key, 0.875)}
              >
                {f.prefix}
                {v}
              </div>
            );
        }
      })}
    </div>
  );
}

export function DocumentPreview({
  schema,
  values,
  colorSet,
  font,
  background,
  spacing,
  styles,
  print,
}: PreviewProps) {
  const fields = schema.fields.filter((f) => printable(f, values));
  const role = (f: TemplateField) => f.role ?? "detail";
  const sp = spacingFactor(spacing);
  const lh = (base: number): CSSProperties => ({ lineHeight: +(base * sp).toFixed(3) });

  const opening = fields.filter((f) => role(f) === "opening");
  const signature = fields.filter((f) => role(f) === "signature");
  const middle = fields.filter((f) => role(f) !== "opening" && role(f) !== "signature");
  const firstDetail = middle.find((f) => role(f) === "detail");

  const page = PAGE_MM[schema.layout.pageSize];
  const surface: CSSProperties = {
    ...backgroundCss(background, colorSet),
    color: colorSet.fg,
    fontFamily: fontCss(font),
  };
  const outerStyle: CSSProperties = print
    ? { width: `${page.w}mm`, height: `${page.h}mm`, ...surface }
    : { aspectRatio: `${page.w} / ${page.h}`, ...surface };

  const renderField = (f: TemplateField) => {
    const v = rawValue(f, values);
    switch (role(f)) {
      case "body":
        return (
          <p
            key={f.key}
            className="max-w-[92%] whitespace-pre-line text-[0.95rem]"
            style={{ ...lh(1.625), ...sizeStyle(styles, f.key, 0.95) }}
          >
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
              className="text-3xl font-bold"
              style={{ color: colorSet.accent, ...lh(1.375), ...sizeStyle(styles, f.key, 1.875) }}
            >
              {v}
            </span>
          </div>
        );
      default: // detail
        return (
          <div key={f.key} className="text-sm" style={lh(1.5)}>
            {f === firstDetail && (
              <div
                className="mx-auto mb-3 h-px w-24"
                style={{ background: colorSet.accent, opacity: 0.6 }}
              />
            )}
            <span className="font-medium" style={sizeStyle(styles, f.key, 0.875)}>
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
        "whitespace-pre-line"
      }
      style={{ ...lh(1.625), ...sizeStyle(styles, f.key, f.emphasis ? 0.95 : 0.875) }}
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

  if (schema.layout.variant === "document") {
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
        <DocumentVariant
          schema={schema}
          values={values}
          colorSet={colorSet}
          spacing={spacing}
          styles={styles}
        />
      </div>
    );
  }

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
        style={{
          // Artwork backgrounds carry their own framing — the accent border
          // is drawn only over plain/CSS backgrounds.
          border: isImageBackground(background) ? "none" : `1px solid ${colorSet.accent}`,
          margin: "4%",
          height: "92%",
        }}
      >
        {/* opening: בס"ד + motto/verse lines */}
        <div
          className="flex min-h-[1.5em] flex-col items-center text-sm opacity-80"
          style={{ rowGap: `${0.25 * sp}rem` }}
        >
          {opening.map((f) => (
            <div key={f.key} style={sizeStyle(styles, f.key, 0.875)}>
              {rawValue(f, values)}
            </div>
          ))}
        </div>

        {/* middle: body / names / details, in the template's declared order */}
        <div className="flex w-full flex-col items-center" style={{ rowGap: `${0.75 * sp}rem` }}>
          {renderGroups(middle, renderField)}
        </div>

        {/* signature: closing line + family columns */}
        <div
          className="flex w-full flex-col items-center text-sm"
          style={{ rowGap: `${0.5 * sp}rem` }}
        >
          {renderGroups(signature, renderSignatureField)}
        </div>
      </div>
    </div>
  );
}
