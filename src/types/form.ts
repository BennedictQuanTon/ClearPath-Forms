export type SectionId =
  | "personal_info"
  | "household"
  | "income"
  | "documents";

export type FieldValue = string | number | boolean | null;

export interface SectionState {
  fields: Record<string, FieldValue>;
  errors: Record<string, string>;
  isComplete: boolean;
}

export interface FormState {
  sections: Record<SectionId, SectionState>;
  submitted: boolean;
  activeSection: SectionId;
}

export type FieldKind = "text" | "date" | "email" | "tel" | "number" | "select" | "checkbox";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  id: string;
  sectionId: SectionId;
  label: string;
  kind: FieldKind;
  required: boolean;
  requiredWhen?: (fields: Record<string, FieldValue>) => boolean;
  options?: FieldOption[];
  autocomplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
}

export type FormAction =
  | { type: "SET_FIELD"; sectionId: SectionId; fieldId: string; value: FieldValue }
  | { type: "FILL_SECTION"; sectionId: SectionId; data: Record<string, FieldValue> }
  | { type: "SET_ACTIVE_SECTION"; sectionId: SectionId }
  | { type: "VALIDATE_SECTION"; sectionId: SectionId }
  | { type: "SUBMIT" }
  | { type: "RESET" }
  | { type: "LOAD_DEMO" };
