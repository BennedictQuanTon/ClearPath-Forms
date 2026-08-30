import type { FieldDef, SectionId } from "../types/form";

export const SECTION_ORDER: SectionId[] = [
  "personal_info",
  "household",
  "income",
  "documents",
];

export const SECTION_TITLES: Record<SectionId, string> = {
  personal_info: "Personal information",
  household: "Household",
  income: "Income",
  documents: "Documents and review",
};

export const SECTION_HINTS: Record<SectionId, string> = {
  personal_info: "Who is applying, and how we can reach you.",
  household: "Who lives with you and how your household is set up.",
  income: "What money comes in each month. Use zero if a question does not apply.",
  documents: "This is a mock form. Check that you would have these papers ready, then review.",
};

export const FIELDS: FieldDef[] = [
  {
    id: "full_name",
    sectionId: "personal_info",
    label: "Full legal name",
    kind: "text",
    required: true,
    autocomplete: "name",
  },
  {
    id: "date_of_birth",
    sectionId: "personal_info",
    label: "Date of birth",
    kind: "date",
    required: true,
    autocomplete: "bday",
  },
  {
    id: "street_address",
    sectionId: "personal_info",
    label: "Street address",
    kind: "text",
    required: true,
    autocomplete: "street-address",
  },
  {
    id: "city",
    sectionId: "personal_info",
    label: "City",
    kind: "text",
    required: true,
    autocomplete: "address-level2",
  },
  {
    id: "state",
    sectionId: "personal_info",
    label: "State",
    kind: "text",
    required: true,
    autocomplete: "address-level1",
  },
  {
    id: "zip",
    sectionId: "personal_info",
    label: "ZIP code",
    kind: "text",
    required: true,
    autocomplete: "postal-code",
    inputMode: "numeric",
  },
  {
    id: "phone",
    sectionId: "personal_info",
    label: "Phone number",
    kind: "tel",
    required: true,
    autocomplete: "tel",
    inputMode: "tel",
  },
  {
    id: "email",
    sectionId: "personal_info",
    label: "Email address",
    kind: "email",
    required: true,
    autocomplete: "email",
    inputMode: "email",
  },
  {
    id: "household_composition",
    sectionId: "household",
    label: "Household composition",
    kind: "select",
    required: true,
    options: [
      { value: "", label: "Select one" },
      { value: "single", label: "I live alone" },
      { value: "couple", label: "Two adults, no children" },
      { value: "family_with_children", label: "Adults with children under 18" },
      { value: "multi_adult", label: "Several adults sharing a home" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    id: "household_size",
    sectionId: "household",
    label: "How many people live in your home, including you?",
    kind: "number",
    required: true,
    inputMode: "numeric",
  },
  {
    id: "dependents_under_18",
    sectionId: "household",
    label: "How many of those people are under 18?",
    kind: "number",
    required: true,
    inputMode: "numeric",
  },
  {
    id: "lives_with_others",
    sectionId: "household",
    label: "Do you share housing costs with anyone else?",
    kind: "select",
    required: true,
    options: [
      { value: "", label: "Select one" },
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "employment_status",
    sectionId: "income",
    label: "Employment status",
    kind: "select",
    required: true,
    options: [
      { value: "", label: "Select one" },
      { value: "employed", label: "Employed by someone else" },
      { value: "self_employed", label: "Self-employed" },
      { value: "unemployed", label: "Unemployed" },
      { value: "retired", label: "Retired" },
      { value: "disabled", label: "Unable to work because of a disability" },
      { value: "student", label: "Student" },
    ],
  },
  {
    id: "employer_name",
    sectionId: "income",
    label: "Employer or business name",
    kind: "text",
    required: false,
    requiredWhen: (fields) =>
      fields.employment_status === "employed" ||
      fields.employment_status === "self_employed",
  },
  {
    id: "monthly_income",
    sectionId: "income",
    label: "Monthly take-home pay (USD)",
    kind: "number",
    required: true,
    inputMode: "numeric",
  },
  {
    id: "other_monthly_income",
    sectionId: "income",
    label: "Other monthly income (USD)",
    kind: "number",
    required: true,
    inputMode: "numeric",
  },
  {
    id: "receives_other_benefits",
    sectionId: "income",
    label: "Do you already receive other public benefits?",
    kind: "select",
    required: true,
    options: [
      { value: "", label: "Select one" },
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "identity_ready",
    sectionId: "documents",
    label: "I would have a photo ID ready to upload (mocked — no file is sent).",
    kind: "checkbox",
    required: true,
  },
  {
    id: "income_proof_ready",
    sectionId: "documents",
    label: "I would have proof of income ready (mocked — no file is sent).",
    kind: "checkbox",
    required: true,
  },
  {
    id: "attestation",
    sectionId: "documents",
    label: "I confirm this is a practice application and the answers are not real government data.",
    kind: "checkbox",
    required: true,
  },
];

export function fieldsForSection(sectionId: SectionId): FieldDef[] {
  return FIELDS.filter((field) => field.sectionId === sectionId);
}

export function getField(fieldId: string): FieldDef | undefined {
  return FIELDS.find((field) => field.id === fieldId);
}

export function isKnownSection(value: string): value is SectionId {
  return SECTION_ORDER.includes(value as SectionId);
}
