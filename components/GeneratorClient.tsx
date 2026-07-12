"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Template } from "@/lib/templates/types";
import { formatAgorot } from "@/lib/utils";
import { loadDraft, saveDraft } from "@/lib/drafts";
import { DynamicForm } from "@/components/DynamicForm";
import { ColorSetPicker } from "@/components/ColorSetPicker";
import { DocumentPreview } from "@/components/DocumentPreview";

/**
 * The generator (spec §3): fill the form → the preview updates live, locally —
 * no server round-trip while typing. Work is auto-saved to the device
 * (localStorage draft per template) until cloud drafts land with Supabase.
 */
export function GeneratorClient({ template }: { template: Template }) {
  // Initialize values from the template's field defaults (spec §4).
  const initialValues = useMemo(() => {
    const v: Record<string, string> = {};
    for (const f of template.schema.fields) if (f.default) v[f.key] = f.default;
    return v;
  }, [template]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [colorKey, setColorKey] = useState(template.schema.colorSets[0].key);
  const [restored, setRestored] = useState(false); // draft loaded (or none existed)

  // Restore this template's draft once on mount — closing the tab loses nothing.
  useEffect(() => {
    const draft = loadDraft(template.slug);
    if (draft) {
      setValues((prev) => ({ ...prev, ...draft.values }));
      if (template.schema.colorSets.some((c) => c.key === draft.colorKey)) {
        setColorKey(draft.colorKey);
      }
    }
    setRestored(true);
  }, [template]);

  // Auto-save on every change (after restore, so defaults don't clobber a draft).
  const skipFirstSave = useRef(true);
  useEffect(() => {
    if (!restored) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveDraft({ slug: template.slug, templateTitle: template.title, values, colorKey });
  }, [restored, values, colorKey, template]);

  const colorSet =
    template.schema.colorSets.find((c) => c.key === colorKey) ??
    template.schema.colorSets[0];

  // Draft-PDF link: current values + palette, URL-encoded for the render route.
  const draftPdfUrl = `/api/pdf/${template.slug}?d=${encodeURIComponent(
    JSON.stringify({ values, colorKey }),
  )}`;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* form side */}
      <section aria-label="מילוי פרטים">
        <h2 className="text-lg font-semibold">מילוי פרטים</h2>
        <div className="mt-4">
          <DynamicForm
            schema={template.schema}
            values={values}
            onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
          />
        </div>

        <h2 className="mt-8 text-lg font-semibold">ערכת צבעים</h2>
        <div className="mt-3">
          <ColorSetPicker
            colorSets={template.schema.colorSets}
            selected={colorKey}
            onSelect={setColorKey}
          />
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 rounded-xl border bg-gray-50 p-4">
          <div>
            <div className="font-semibold">{formatAgorot(template.basePriceAgorot)}</div>
            <div className="text-xs text-gray-500">PDF באיכות דפוס · כולל 3 תיקונים</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <a
              href={draftPdfUrl}
              download
              className="rounded-xl border border-brand px-5 py-2 text-sm text-brand transition hover:bg-brand hover:text-brand-fg"
            >
              הורדת טיוטה (PDF)
            </a>
            <button
              type="button"
              disabled
              title="התשלום יופעל בקרוב"
              className="rounded-xl bg-brand px-5 py-2 text-sm text-brand-fg opacity-50"
            >
              לתשלום והורדה (בקרוב)
            </button>
          </div>
        </div>
      </section>

      {/* live preview side — sticky on desktop so it stays visible while typing */}
      <section aria-label="תצוגה מקדימה" className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="text-lg font-semibold">תצוגה מקדימה</h2>
        <p className="text-xs text-gray-500">
          כך ייראה ה-PDF שתורידו — אחד לאחד.
          {restored && <span className="ms-2 text-green-700">✓ נשמר אוטומטית במכשיר זה</span>}
        </p>
        <div className="mt-4">
          <DocumentPreview schema={template.schema} values={values} colorSet={colorSet} />
        </div>
      </section>
    </div>
  );
}
