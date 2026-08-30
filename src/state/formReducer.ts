import { FIELDS, fieldsForSection, SECTION_ORDER } from "../data/fields";
import type { FieldValue, FormAction, FormState, SectionId } from "../types/form";
import { isSectionComplete, validateSectionFields } from "../validation/validate";

const STORAGE_KEY = "clearpath-form-state";

function emptyFields(sectionId: SectionId): Record<string, FieldValue> {
  const fields: Record<string, FieldValue> = {};
  for (const field of fieldsForSection(sectionId)) {
    fields[field.id] = field.kind === "checkbox" ? false : "";
  }
  return fields;
}

function buildSection(sectionId: SectionId, fields: Record<string, FieldValue>) {
  const errors = validateSectionFields(sectionId, fields);
  return {
    fields,
    errors,
    isComplete: Object.keys(errors).length === 0,
  };
}

export function createEmptyState(): FormState {
  const sections = {
    personal_info: buildSection("personal_info", emptyFields("personal_info")),
    household: buildSection("household", emptyFields("household")),
    income: buildSection("income", emptyFields("income")),
    documents: buildSection("documents", emptyFields("documents")),
  };
  return {
    sections,
    submitted: false,
    activeSection: "personal_info",
    touchedFields: {},
  };
}

export const MARIA_DEMO: Record<SectionId, Record<string, FieldValue>> = {
  personal_info: {
    full_name: "Maria Elena Santos",
    date_of_birth: "1990-03-04",
    street_address: "12 Elm Street, Apt 3B",
    city: "Oakland",
    state: "CA",
    zip: "94612",
    phone: "510-555-0142",
    email: "maria.santos@example.com",
  },
  household: {
    household_composition: "family_with_children",
    household_size: 4,
    dependents_under_18: 2,
    lives_with_others: "yes",
  },
  income: {
    employment_status: "employed",
    employer_name: "Oakland Community Clinic",
    monthly_income: 2400,
    other_monthly_income: 150,
    receives_other_benefits: "no",
  },
  documents: {
    identity_ready: true,
    income_proof_ready: true,
    attestation: true,
  },
};

function loadDemoState(): FormState {
  const base = createEmptyState();
  const touchedFields: Record<string, boolean> = {};
  for (const sectionId of SECTION_ORDER) {
    base.sections[sectionId] = buildSection(sectionId, {
      ...base.sections[sectionId].fields,
      ...MARIA_DEMO[sectionId],
    });
    for (const fieldId of Object.keys(MARIA_DEMO[sectionId])) {
      touchedFields[fieldId] = true;
    }
  }
  return { ...base, touchedFields };
}

export function loadPersistedState(): FormState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw) as FormState;
    if (!parsed.sections?.personal_info) return createEmptyState();
    return {
      ...createEmptyState(),
      ...parsed,
      touchedFields: parsed.touchedFields ?? {},
    };
  } catch {
    return createEmptyState();
  }
}

export function persistState(state: FormState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD": {
      const fields = {
        ...state.sections[action.sectionId].fields,
        [action.fieldId]: action.value,
      };
      return {
        ...state,
        submitted: false,
        touchedFields: { ...state.touchedFields, [action.fieldId]: true },
        sections: {
          ...state.sections,
          [action.sectionId]: buildSection(action.sectionId, fields),
        },
      };
    }
    case "FILL_SECTION": {
      const fields = { ...state.sections[action.sectionId].fields };
      const touchedFields = { ...state.touchedFields };
      for (const [key, value] of Object.entries(action.data)) {
        if (FIELDS.some((field) => field.id === key && field.sectionId === action.sectionId)) {
          fields[key] = value;
          touchedFields[key] = true;
        }
      }
      return {
        ...state,
        submitted: false,
        activeSection: action.sectionId,
        touchedFields,
        sections: {
          ...state.sections,
          [action.sectionId]: buildSection(action.sectionId, fields),
        },
      };
    }
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.sectionId };
    case "VALIDATE_SECTION": {
      const fields = state.sections[action.sectionId].fields;
      const touchedFields = { ...state.touchedFields };
      for (const field of fieldsForSection(action.sectionId)) {
        touchedFields[field.id] = true;
      }
      return {
        ...state,
        touchedFields,
        sections: {
          ...state.sections,
          [action.sectionId]: buildSection(action.sectionId, fields),
        },
      };
    }
    case "SUBMIT": {
      const allComplete = SECTION_ORDER.every((id) =>
        isSectionComplete(id, state.sections[id].fields),
      );
      if (!allComplete) return state;
      return { ...state, submitted: true };
    }
    case "RESET":
      return createEmptyState();
    case "LOAD_DEMO":
      return loadDemoState();
    default:
      return state;
  }
}
