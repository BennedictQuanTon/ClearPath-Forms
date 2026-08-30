import type { SectionId } from "../types/form";
import { fieldsForSection, SECTION_HINTS, SECTION_TITLES } from "../data/fields";
import { useFormState } from "../state/FormStateContext";
import { FieldControl } from "./FieldControl";

interface SectionPanelProps {
  sectionId: SectionId;
  headingRef: (node: HTMLHeadingElement | null) => void;
}

export function SectionPanel({ sectionId, headingRef }: SectionPanelProps) {
  const { state, dispatch } = useFormState();
  const section = state.sections[sectionId];
  const disabled = state.submitted;

  return (
    <section
      className="panel"
      aria-labelledby={`${sectionId}-heading`}
      hidden={state.activeSection !== sectionId}
    >
      <h2 id={`${sectionId}-heading`} tabIndex={-1} ref={headingRef}>
        {SECTION_TITLES[sectionId]}
      </h2>
      <p className="panel-lead">{SECTION_HINTS[sectionId]}</p>
      <fieldset disabled={disabled}>
        <legend className="visually-hidden">{SECTION_TITLES[sectionId]} fields</legend>
        {fieldsForSection(sectionId).map((field) => (
          <FieldControl
            key={field.id}
            field={field}
            value={section.fields[field.id] ?? null}
            error={state.touchedFields[field.id] ? section.errors[field.id] : undefined}
            disabled={disabled}
            onChange={(value) =>
              dispatch({
                type: "SET_FIELD",
                sectionId,
                fieldId: field.id,
                value,
              })
            }
          />
        ))}
      </fieldset>
    </section>
  );
}
