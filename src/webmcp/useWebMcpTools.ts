import { useEffect, useRef } from "react";
import { fieldsForSection, getField, isKnownSection, SECTION_ORDER, SECTION_TITLES } from "../data/fields";
import { GLOSSARY } from "../data/glossary";
import type { FieldValue, FormAction, FormState, SectionId } from "../types/form";
import {
  coerceValue,
  isEntireFormValid,
  remainingRequired,
  validateField,
  validateSectionFields,
} from "../validation/validate";
import { buildOverview } from "./buildOverview";
import { getModelContext, registerToolWithWebMcp, toolResult } from "./modelContext";

interface ToolHost {
  getState: () => FormState;
  dispatch: (action: FormAction) => void;
  announce: (message: string) => void;
  focusSection: (sectionId: SectionId) => void;
}

async function register(tool: ModelContextTool, signal: AbortSignal): Promise<void> {
  try {
    await registerToolWithWebMcp(tool, { signal });
  } catch (error) {
    console.warn(`WebMCP: could not register ${tool.name}`, error);
  }
}

export function useWebMcpTools(host: ToolHost, formValid: boolean, activeSection: SectionId): boolean {
  const hostRef = useRef(host);
  hostRef.current = host;
  const available = getModelContext() !== null;

  useEffect(() => {
    const ctx = getModelContext();
    if (!ctx) return;
    const controller = new AbortController();
    const current = () => hostRef.current;

    void register(
      {
        name: "get_form_overview",
        description:
          "Get completion status for this public assistance practice form: which sections are done, which required fields are still missing, whether submit_form is available, and the currently visible section. Call this first, and whenever the user asks if they can submit or what is left.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        execute: async () => toolResult(buildOverview(current().getState())),
      },
      controller.signal,
    );

    void register(
      {
        name: "validate_section",
        description:
          "Re-check one section and return plain-language validation errors. sectionId must be one of: personal_info, household, income, documents.",
        inputSchema: {
          type: "object",
          properties: {
            sectionId: {
              type: "string",
              enum: SECTION_ORDER,
              description: "Which section to validate",
            },
          },
          required: ["sectionId"],
        },
        annotations: { readOnlyHint: true },
        execute: async ({ sectionId }) => {
          if (typeof sectionId !== "string" || !isKnownSection(sectionId)) {
            return toolResult({
              ok: false,
              error: "Unknown section. Use personal_info, household, income, or documents.",
            });
          }
          const state = current().getState();
          const errors = validateSectionFields(sectionId, state.sections[sectionId].fields);
          current().dispatch({ type: "VALIDATE_SECTION", sectionId });
          return toolResult({
            sectionId,
            title: SECTION_TITLES[sectionId],
            isComplete: Object.keys(errors).length === 0,
            errors,
          });
        },
      },
      controller.signal,
    );

    void register(
      {
        name: "navigate_to_section",
        description:
          "Move the visible form and keyboard focus to a section. Use when the user says next section, go to income, open household, and similar. sectionId: personal_info, household, income, documents.",
        inputSchema: {
          type: "object",
          properties: {
            sectionId: { type: "string", enum: SECTION_ORDER },
          },
          required: ["sectionId"],
        },
        execute: async ({ sectionId }) => {
          if (typeof sectionId !== "string" || !isKnownSection(sectionId)) {
            return toolResult({
              ok: false,
              error: "Unknown section. Use personal_info, household, income, or documents.",
            });
          }
          current().dispatch({ type: "SET_ACTIVE_SECTION", sectionId });
          current().focusSection(sectionId);
          current().announce(`Moved to ${SECTION_TITLES[sectionId]}.`);
          return toolResult({
            ok: true,
            activeSection: sectionId,
            title: SECTION_TITLES[sectionId],
          });
        },
      },
      controller.signal,
    );

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const ctx = getModelContext();
    if (!ctx) return;
    const controller = new AbortController();
    const current = () => hostRef.current;
    const fieldIds = fieldsForSection(activeSection).map((field) => field.id);

    void register(
      {
        name: "explain_field",
        description: `Explain in plain language what a field on this public assistance form is asking, with an example answer. The user is currently on the ${SECTION_TITLES[activeSection]} section. Field ids in this section: ${fieldIds.join(", ")}. Also works for field ids from other sections. Use this when the user asks what a term means, such as household composition.`,
        inputSchema: {
          type: "object",
          properties: {
            fieldId: {
              type: "string",
              description: "Field id such as household_composition or monthly_income",
            },
          },
          required: ["fieldId"],
        },
        annotations: { readOnlyHint: true },
        execute: async ({ fieldId }) => {
          if (typeof fieldId !== "string") {
            return toolResult("Please pass fieldId as a string.");
          }
          const entry = GLOSSARY[fieldId];
          const field = getField(fieldId);
          if (!entry || !field) {
            return toolResult({
              ok: false,
              error: `No explanation found for "${fieldId}". Known ids: ${Object.keys(GLOSSARY).join(", ")}`,
            });
          }
          return toolResult({
            fieldId,
            label: field.label,
            sectionId: field.sectionId,
            plainLanguage: entry.plainLanguage,
            example: entry.example,
          });
        },
      },
      controller.signal,
    );

    void register(
      {
        name: "fill_field",
        description: `Set one field on the currently visible section (${SECTION_TITLES[activeSection]}). Known field ids here: ${fieldIds.join(", ")}. Dates must be YYYY-MM-DD. Checkbox fields accept true/false. Numbers should be digits only.`,
        inputSchema: {
          type: "object",
          properties: {
            fieldId: { type: "string" },
            value: {
              type: "string",
              description:
                "The new value as text. Numbers are digits only. Checkboxes: true or false. Dates: YYYY-MM-DD.",
            },
          },
          required: ["fieldId", "value"],
        },
        execute: async ({ fieldId, value }) => {
          if (typeof fieldId !== "string") {
            return toolResult({ ok: false, error: "fieldId is required." });
          }
          const field = getField(fieldId);
          if (!field) {
            return toolResult({ ok: false, error: `Unknown field "${fieldId}".` });
          }
          const coerced = coerceValue(fieldId, value);
          const state = current().getState();
          const sectionFields = {
            ...state.sections[field.sectionId].fields,
            [fieldId]: coerced,
          };
          const error = validateField(fieldId, coerced, sectionFields);
          current().dispatch({
            type: "SET_FIELD",
            sectionId: field.sectionId,
            fieldId,
            value: coerced,
          });
          if (state.activeSection !== field.sectionId) {
            current().dispatch({ type: "SET_ACTIVE_SECTION", sectionId: field.sectionId });
            current().focusSection(field.sectionId);
          }
          current().announce(
            error
              ? `Updated ${field.label}, but it still needs a correction.`
              : `Updated ${field.label}.`,
          );
          return toolResult({
            ok: !error,
            fieldId,
            value: coerced,
            error,
          });
        },
      },
      controller.signal,
    );

    void register(
      {
        name: "fill_section",
        description: `Fill several fields at once from information the user said in conversation. Prefer this over many fill_field calls. sectionId: personal_info, household, income, documents. data is an object of fieldId to value. Current section is ${activeSection}. Example: fill_section with sectionId personal_info and data { full_name: "Maria Santos", date_of_birth: "1990-03-04", street_address: "12 Elm Street" }.`,
        inputSchema: {
          type: "object",
          properties: {
            sectionId: { type: "string", enum: SECTION_ORDER },
            data: {
              type: "object",
              description: "Map of fieldId to value",
              additionalProperties: true,
            },
          },
          required: ["sectionId", "data"],
        },
        execute: async ({ sectionId, data }) => {
          if (typeof sectionId !== "string" || !isKnownSection(sectionId)) {
            return toolResult({
              ok: false,
              error: "Unknown section. Use personal_info, household, income, or documents.",
            });
          }
          if (!data || typeof data !== "object" || Array.isArray(data)) {
            return toolResult({ ok: false, error: "data must be an object of fieldId to value." });
          }

          const unknownKeys: string[] = [];
          const coerced: Record<string, FieldValue> = {};
          for (const [key, raw] of Object.entries(data as Record<string, unknown>)) {
            const field = getField(key);
            if (!field || field.sectionId !== sectionId) {
              unknownKeys.push(key);
              continue;
            }
            coerced[key] = coerceValue(key, raw);
          }

          current().dispatch({ type: "FILL_SECTION", sectionId, data: coerced });
          current().focusSection(sectionId);

          const nextFields = {
            ...current().getState().sections[sectionId].fields,
            ...coerced,
          };
          const errors = validateSectionFields(sectionId, nextFields);
          const remaining = remainingRequired({
            ...current().getState(),
            sections: {
              ...current().getState().sections,
              [sectionId]: {
                ...current().getState().sections[sectionId],
                fields: nextFields,
                errors,
                isComplete: Object.keys(errors).length === 0,
              },
            },
          }).filter((id) => getField(id)?.sectionId === sectionId);

          current().announce(
            Object.keys(errors).length === 0
              ? `${SECTION_TITLES[sectionId]} is complete.`
              : `Updated ${SECTION_TITLES[sectionId]}. Some required fields still need answers.`,
          );

          return toolResult({
            ok: true,
            sectionId,
            filledFields: Object.keys(coerced),
            unknownKeys,
            errors,
            remainingRequired: remaining,
          });
        },
      },
      controller.signal,
    );

    return () => controller.abort();
  }, [activeSection]);

  useEffect(() => {
    const ctx = getModelContext();
    if (!ctx || !formValid) return;
    const controller = new AbortController();
    const current = () => hostRef.current;

    void register(
      {
        name: "submit_form",
        description:
          "Submit this completed practice public assistance application. Only registered when every required field is valid. confirm must be true. If this tool is missing, the form is incomplete — call get_form_overview instead of guessing.",
        inputSchema: {
          type: "object",
          properties: {
            confirm: {
              type: "boolean",
              description: "Must be true to submit",
            },
          },
          required: ["confirm"],
        },
        execute: async ({ confirm }) => {
          if (confirm !== true) {
            return toolResult({
              ok: false,
              error: "Submission requires confirm: true.",
            });
          }
          const state = current().getState();
          if (!isEntireFormValid(state)) {
            return toolResult({
              ok: false,
              error: "The form is no longer fully valid.",
              remainingRequiredFields: remainingRequired(state),
            });
          }
          current().dispatch({ type: "SUBMIT" });
          current().announce("Application submitted. This is a practice form. No data was sent to a government agency.");
          return toolResult({
            ok: true,
            message:
              "Practice application submitted. No personal data was sent to a real agency. The user can reset the demo to try again.",
          });
        },
      },
      controller.signal,
    );

    return () => controller.abort();
  }, [formValid]);

  return available;
}
