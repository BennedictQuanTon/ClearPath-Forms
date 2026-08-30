import type { ChangeEvent } from "react";
import type { FieldDef, FieldValue } from "../types/form";
import { GLOSSARY } from "../data/glossary";

interface FieldControlProps {
  field: FieldDef;
  value: FieldValue;
  error?: string;
  disabled?: boolean;
  onChange: (value: FieldValue) => void;
}

export function FieldControl({ field, value, error, disabled, onChange }: FieldControlProps) {
  const describedBy = [
    `hint-${field.id}`,
    error ? `error-${field.id}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  const fullHint = GLOSSARY[field.id]?.plainLanguage ?? "";
  const hint = fullHint.includes(". ") ? `${fullHint.split(". ")[0]}.` : fullHint;
  const invalid = Boolean(error);

  function handleText(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    onChange(event.target.value);
  }

  function handleNumber(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    onChange(next === "" ? "" : Number(next));
  }

  function handleCheck(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.checked);
  }

  return (
    <div className="field">
      {field.kind === "checkbox" ? (
        <div className="field-check">
          <input
            id={field.id}
            name={field.id}
            type="checkbox"
            checked={value === true}
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={handleCheck}
          />
          <label htmlFor={field.id}>{field.label}</label>
        </div>
      ) : (
        <>
          <label htmlFor={field.id}>{field.label}</label>
          {field.kind === "select" ? (
            <select
              id={field.id}
              name={field.id}
              value={typeof value === "string" ? value : ""}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              onChange={handleText}
            >
              {field.options?.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.id}
              name={field.id}
              type={field.kind === "number" ? "number" : field.kind}
              inputMode={field.inputMode}
              autoComplete={field.autocomplete}
              value={value === null || value === false ? "" : String(value)}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              min={field.kind === "number" ? 0 : undefined}
              onChange={field.kind === "number" ? handleNumber : handleText}
            />
          )}
        </>
      )}
      {hint ? (
        <p id={`hint-${field.id}`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`error-${field.id}`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
