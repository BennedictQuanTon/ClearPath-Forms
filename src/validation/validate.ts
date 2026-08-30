import { FIELDS, fieldsForSection, getField, SECTION_ORDER } from "../data/fields";
import type { FieldValue, FormState, SectionId } from "../types/form";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP = /^\d{5}(-\d{4})?$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isEmpty(value: FieldValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "boolean") return value === false;
  return false;
}

export function fieldIsRequired(
  fieldId: string,
  fields: Record<string, FieldValue>,
): boolean {
  const field = getField(fieldId);
  if (!field) return false;
  if (field.requiredWhen) return field.requiredWhen(fields);
  return field.required;
}

export function validateField(
  fieldId: string,
  value: FieldValue,
  sectionFields: Record<string, FieldValue>,
): string | null {
  const field = getField(fieldId);
  if (!field) return "That field is not on this form.";

  const required = fieldIsRequired(fieldId, { ...sectionFields, [fieldId]: value });

  if (required && isEmpty(value)) {
    return `Please fill in ${field.label.toLowerCase()}.`;
  }

  if (isEmpty(value)) return null;

  if (field.kind === "email" && typeof value === "string" && !EMAIL.test(value.trim())) {
    return "Please enter an email that looks like name@example.com.";
  }

  if (fieldId === "zip" && typeof value === "string" && !ZIP.test(value.trim())) {
    return "Please enter a 5-digit ZIP code, or ZIP+4.";
  }

  if (field.kind === "tel" && typeof value === "string" && !PHONE.test(value.trim())) {
    return "Please enter a phone number with at least 7 digits.";
  }

  if (field.kind === "date" && typeof value === "string") {
    if (!DATE.test(value)) {
      return "Please use a date like 1990-03-04.";
    }
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return "That date is not valid.";
    }
    if (parsed > new Date()) {
      return "Date of birth cannot be in the future.";
    }
  }

  if (field.kind === "number") {
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return `${field.label} must be a number.`;
    }
    if (numeric < 0) {
      return `${field.label} cannot be negative. Use 0 if it does not apply.`;
    }
    if (fieldId === "household_size" && (numeric < 1 || numeric > 20)) {
      return "Household size should be between 1 and 20.";
    }
    if (fieldId === "dependents_under_18" && numeric > 20) {
      return "Please enter a number of children between 0 and 20.";
    }
  }

  if (field.kind === "select" && field.options) {
    const allowed = field.options.map((option) => option.value).filter(Boolean);
    if (typeof value === "string" && !allowed.includes(value)) {
      return `Please choose one of the listed options for ${field.label.toLowerCase()}.`;
    }
  }

  return null;
}

export function validateSectionFields(
  sectionId: SectionId,
  fields: Record<string, FieldValue>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fieldsForSection(sectionId)) {
    const message = validateField(field.id, fields[field.id] ?? null, fields);
    if (message) errors[field.id] = message;
  }
  return errors;
}

export function isSectionComplete(
  sectionId: SectionId,
  fields: Record<string, FieldValue>,
): boolean {
  return Object.keys(validateSectionFields(sectionId, fields)).length === 0;
}

export function isEntireFormValid(state: FormState): boolean {
  if (state.submitted) return false;
  return SECTION_ORDER.every((sectionId) =>
    isSectionComplete(sectionId, state.sections[sectionId].fields),
  );
}

export function remainingRequired(state: FormState): string[] {
  const missing: string[] = [];
  for (const field of FIELDS) {
    const sectionFields = state.sections[field.sectionId].fields;
    const message = validateField(field.id, sectionFields[field.id] ?? null, sectionFields);
    if (message) missing.push(field.id);
  }
  return missing;
}

export function coerceValue(fieldId: string, raw: unknown): FieldValue {
  const field = getField(fieldId);
  if (!field) return raw == null ? null : String(raw);

  if (field.kind === "checkbox") {
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") {
      const lowered = raw.trim().toLowerCase();
      return lowered === "true" || lowered === "yes" || lowered === "1";
    }
    return Boolean(raw);
  }

  if (field.kind === "number") {
    if (raw === "" || raw === null || raw === undefined) return null;
    const numeric = typeof raw === "number" ? raw : Number(String(raw).replace(/[$,]/g, ""));
    return Number.isNaN(numeric) ? String(raw) : numeric;
  }

  if (raw === null || raw === undefined) return null;
  return String(raw);
}

export function sectionCompletionPercent(state: FormState, sectionId: SectionId): number {
  const fields = state.sections[sectionId].fields;
  const required = fieldsForSection(sectionId).filter((field) =>
    fieldIsRequired(field.id, fields),
  );
  if (required.length === 0) return 0;
  const validCount = required.filter(
    (field) => !validateField(field.id, fields[field.id] ?? null, fields),
  ).length;
  return Math.round((validCount / required.length) * 100);
}
