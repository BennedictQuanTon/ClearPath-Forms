import { useCallback, useMemo, useRef, useState } from "react";
import { SECTION_ORDER, SECTION_TITLES } from "./data/fields";
import { SectionNav } from "./components/SectionNav";
import { SectionPanel } from "./components/SectionPanel";
import { useFormState } from "./state/FormStateContext";
import type { SectionId } from "./types/form";
import { isEntireFormValid, remainingRequired } from "./validation/validate";
import { useWebMcpTools } from "./webmcp/useWebMcpTools";

const ALWAYS_TOOLS = [
  "get_form_overview",
  "explain_field",
  "fill_field",
  "fill_section",
  "validate_section",
  "navigate_to_section",
];

export default function App() {
  const { state, dispatch } = useFormState();
  const [announcement, setAnnouncement] = useState("");
  const headingRefs = useRef<Partial<Record<SectionId, HTMLHeadingElement | null>>>({});
  const stateRef = useRef(state);
  stateRef.current = state;
  const formValid = isEntireFormValid(state);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  const focusSection = useCallback((sectionId: SectionId) => {
    headingRefs.current[sectionId]?.focus();
  }, []);

  const host = useMemo(
    () => ({
      getState: () => stateRef.current,
      dispatch,
      announce,
      focusSection,
    }),
    [dispatch, announce, focusSection],
  );

  const webmcpAvailable = useWebMcpTools(host, formValid, state.activeSection);
  const missing = remainingRequired(state);
  const activeIndex = SECTION_ORDER.indexOf(state.activeSection);

  function goTo(sectionId: SectionId) {
    dispatch({ type: "SET_ACTIVE_SECTION", sectionId });
    requestAnimationFrame(() => focusSection(sectionId));
  }

  function handleSubmit() {
    if (!formValid) {
      announce(`Cannot submit yet. ${missing.length} required items still need answers.`);
      return;
    }
    dispatch({ type: "SUBMIT" });
    announce("Application submitted. This is a practice form. No data was sent to a government agency.");
  }

  const statusCopy = state.submitted
    ? "Submitted. The form is locked and submit_form has been unregistered so it cannot be sent twice."
    : formValid
      ? "All required fields are valid. The submit_form tool is registered for agents."
      : `${missing.length} required item${missing.length === 1 ? "" : "s"} still need a valid answer. submit_form is not registered — an agent cannot submit yet.`;

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to application
      </a>
      <header className="site-header">
        <p className="eyebrow">ClearPath Forms</p>
        <h1>Public assistance application</h1>
        <p className="lede">
          A practice benefits form you can complete yourself or by talking to your AI agent. The
          page declares typed WebMCP tools, so the agent does not scrape the DOM — and it cannot
          submit until every required field is valid.
        </p>
        <ul className="how">
          <li>
            <strong>Without WebMCP:</strong> an agent guesses at labels and can still press Submit.
          </li>
          <li>
            <strong>With WebMCP:</strong> <code>explain_field</code>, <code>fill_section</code>, and
            a gated <code>submit_form</code> that only exists when the form is complete.
          </li>
          <li>
            Ask an agent “What does household composition mean?” then try “Submit my application”
            while fields are empty.
          </li>
        </ul>
        <p className="banner" role="note">
          Mock data only. Nothing here is sent to a government agency.
        </p>
        <p className={webmcpAvailable ? "status-ok" : "status-warn"}>
          {webmcpAvailable
            ? "WebMCP is available in this browser. An agent can discover tools on this page."
            : "WebMCP is not available in this browser. You can still fill the form. For agent tools, use Chrome with the WebMCP testing flag or ChatGPT’s in-app browser."}
        </p>
      </header>

      <div className="layout">
        <SectionNav onNavigate={goTo} />
        <main id="main">
          {state.submitted ? (
            <div className="success" role="status">
              <h2
                tabIndex={-1}
                ref={(node) => {
                  if (node) node.focus();
                }}
              >
                Practice application submitted
              </h2>
              <p>
                The form is locked. No personal information left this browser. Use Reset demo to
                try the incomplete-submit path again: <code>submit_form</code> will unregister
                until every required field is valid.
              </p>
            </div>
          ) : (
            <>
              {SECTION_ORDER.map((sectionId) => (
                <SectionPanel
                  key={sectionId}
                  sectionId={sectionId}
                  headingRef={(node) => {
                    headingRefs.current[sectionId] = node;
                  }}
                />
              ))}
              <div className="pager">
                <button
                  type="button"
                  className="btn secondary"
                  disabled={activeIndex <= 0}
                  onClick={() => goTo(SECTION_ORDER[activeIndex - 1])}
                >
                  Previous section
                </button>
                {activeIndex < SECTION_ORDER.length - 1 ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => goTo(SECTION_ORDER[activeIndex + 1])}
                  >
                    Next: {SECTION_TITLES[SECTION_ORDER[activeIndex + 1]]}
                  </button>
                ) : (
                  <button type="button" className="btn" onClick={handleSubmit} disabled={!formValid}>
                    Submit application
                  </button>
                )}
              </div>
            </>
          )}

          <div className="judge-tools">
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                dispatch({ type: "RESET" });
                announce("Form reset to empty. submit_form is unregistered.");
                goTo("personal_info");
              }}
            >
              Reset demo
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                dispatch({ type: "LOAD_DEMO" });
                announce("Loaded Maria Santos demo data. submit_form should now be registered.");
                goTo("documents");
              }}
            >
              Load complete demo applicant
            </button>
          </div>
        </main>
      </div>

      <aside className="overview" aria-label="WebMCP and completion status">
        <h2>Agent tools on this page</h2>
        <p className={formValid && !state.submitted ? "badge-on" : "badge-off"}>
          {state.submitted
            ? "submit_form: unregistered (already submitted)"
            : formValid
              ? "submit_form: registered — an agent may submit"
              : "submit_form: not registered — form incomplete"}
        </p>
        <p>
          Currently offered:{" "}
          {[...ALWAYS_TOOLS, ...(formValid ? ["submit_form"] : [])].map((name) => (
            <code key={name}>{name} </code>
          ))}
        </p>
        <h3>Status</h3>
        <p>{statusCopy}</p>
        {!state.submitted && missing.length > 0 ? (
          <ul>
            {missing.slice(0, 8).map((id) => (
              <li key={id}>
                <code>{id}</code>
              </li>
            ))}
          </ul>
        ) : null}
        <h3>Last agent or page action</h3>
        <p className="agent-log">{announcement || "None yet. Talk to your agent, or use Reset / Load demo."}</p>
      </aside>

      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}
