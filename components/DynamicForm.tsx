"use client";

import type { TemplateField, TemplateSchema } from "@/lib/templates/types";
import { cn } from "@/lib/utils";

/**
 * The dynamic fill form — rendered ENTIRELY from the template JSON (spec §4).
 * Adding a document type must require zero changes here.
 */

export interface DynamicFormProps {
  schema: TemplateSchema;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white ps-3 pe-3 py-2 text-start " +
  "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: string;
  onChange: (v: string) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={cn(inputClass, "min-h-24 resize-y")}
          value={value}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <select
          className={inputClass}
          value={value}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "date":
      return (
        <input
          type="date"
          className={inputClass}
          value={value}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <input
          type="text"
          className={inputClass}
          value={value}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function DynamicForm({ schema, values, onChange }: DynamicFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      {schema.fields.map((field) => (
        <label key={field.key} className="flex flex-col gap-1 text-start">
          <span className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-600"> *</span>}
          </span>
          <FieldInput
            field={field}
            value={values[field.key] ?? ""}
            onChange={(v) => onChange(field.key, v)}
          />
          {field.aiEnabled && (
            <button
              type="button"
              disabled
              title="שיפור נוסח ב-AI — יופעל בקרוב"
              className="self-start rounded-md border border-dashed border-brand/50 ps-2 pe-2 py-0.5 text-xs text-brand opacity-60"
            >
              ✨ שיפור נוסח ב-AI (בקרוב)
            </button>
          )}
        </label>
      ))}
    </form>
  );
}
