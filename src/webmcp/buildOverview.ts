import { SECTION_ORDER, SECTION_TITLES } from "../data/fields";
import type { FormState } from "../types/form";
import {
  isEntireFormValid,
  remainingRequired,
  sectionCompletionPercent,
} from "../validation/validate";

export function buildOverview(state: FormState) {
  const sections = Object.fromEntries(
    SECTION_ORDER.map((sectionId) => [
      sectionId,
      {
        title: SECTION_TITLES[sectionId],
        percentComplete: sectionCompletionPercent(state, sectionId),
        isComplete: state.sections[sectionId].isComplete,
        errors: state.sections[sectionId].errors,
      },
    ]),
  );

  return {
    submitted: state.submitted,
    activeSection: state.activeSection,
    formFullyValid: isEntireFormValid(state),
    submitToolAvailable: isEntireFormValid(state),
    remainingRequiredFields: remainingRequired(state),
    sections,
    note: state.submitted
      ? "This practice application is already submitted. Use reset_demo if you need to try again."
      : isEntireFormValid(state)
        ? "All required fields are valid. The submit_form tool is now registered."
        : "submit_form is not registered yet because required fields are still missing or invalid.",
  };
}
