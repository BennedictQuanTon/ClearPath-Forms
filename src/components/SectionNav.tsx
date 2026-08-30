import type { SectionId } from "../types/form";
import { SECTION_ORDER, SECTION_TITLES } from "../data/fields";
import { sectionCompletionPercent } from "../validation/validate";
import { useFormState } from "../state/FormStateContext";

interface SectionNavProps {
  onNavigate: (sectionId: SectionId) => void;
}

export function SectionNav({ onNavigate }: SectionNavProps) {
  const { state } = useFormState();

  return (
    <nav className="section-nav" aria-label="Application sections">
      <ol>
        {SECTION_ORDER.map((sectionId) => {
          const selected = state.activeSection === sectionId;
          const percent = sectionCompletionPercent(state, sectionId);
          return (
            <li key={sectionId}>
              <button
                type="button"
                className={selected ? "nav-item is-active" : "nav-item"}
                aria-current={selected ? "step" : undefined}
                onClick={() => onNavigate(sectionId)}
              >
                <span className="nav-item-title">{SECTION_TITLES[sectionId]}</span>
                <span className="nav-item-meta">
                  {state.sections[sectionId].isComplete ? "Complete" : `${percent}%`}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
