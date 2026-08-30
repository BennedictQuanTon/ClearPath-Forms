# ClearPath Forms

A mock public-assistance application that a screen-reader user, motor-impaired user, or non-native English speaker can complete by talking to an AI agent. The page declares typed WebMCP tools instead of asking the agent to scrape the DOM.

This is a practice form. **No data is sent to a government agency.**

**Live URL:** https://clear-path-forms.vercel.app

## Why this is a WebMCP demo (not “AI fills a form”)

Agents can already click and type on ordinary pages. ClearPath is different because:

1. Tools are **declared** (`document.modelContext.registerTool`) with schemas.
2. UI clicks and tool `execute()` share the **same reducer and validators**.
3. **`submit_form` is only registered when the entire form is valid.** An incomplete application cannot be submitted by calling a tool that does not exist.

That last point is the judging hook (safety by capability, not by prompting).

## Live usage (judges)

1. Open the live URL in **ChatGPT’s desktop in-app browser**, or in **Chrome 150+** with `chrome://flags/#enable-webmcp-testing` set to Enabled.
2. Ask, in ordinary language:
   - “What does household composition mean?”
   - “My name is Maria Santos, born March 4 1990, I live at 12 Elm Street, Oakland CA 94612. Phone 510-555-0142, email maria.santos@example.com.”
   - “Submit my application” **before** the form is complete — `submit_form` should be **absent**. The agent should explain what is missing.
   - Finish the remaining sections (or use **Load complete demo applicant**), then “Submit it.”
3. On the page, watch the **submit_form registered / not registered** badge and **Last agent or page action**. **Reset demo** clears state.

## Local setup

```bash
npm install
npm run dev
```

Open the printed localhost URL in flagged Chrome. Install [WebMCP – Model Context Tool Inspector](https://chromewebstore.google.com/detail/gbpdfapgefenggkahomfgkhfehlcenpd) to call tools by hand.

## Tools

| Tool | When it exists |
| --- | --- |
| `get_form_overview` | Always |
| `validate_section` | Always |
| `navigate_to_section` | Always |
| `explain_field` | Active section (description updates with the current section) |
| `fill_field` | Active section |
| `fill_section` | Active section |
| `submit_form` | Only when the entire form is valid |

## Accessibility

The form is usable with keyboard and screen reader without an agent (labels, fieldsets, focus on section headings, `aria-live` announcements when tools write). WebMCP is additive.

## Devpost text (paste into the four required fields)

### Why your use case is a strong fit for WebMCP

The W3C WebMCP Community Group has an open accessibility issue asking for concrete use cases. Long benefits-style forms are a documented failure mode for screen-reader and motor-impaired users: dozens of poorly labeled fields, legal jargon, and a submit button that still works when the form is incomplete. WebMCP fits because the page can declare what an agent may do (`explain_field`, `fill_section`) and, critically, **withhold** `submit_form` until validation passes. That is a capability the DOM cannot express by scraping.

### How it creates a better user experience

The applicant talks once (“Maria Santos, March 4 1990, 12 Elm Street”) instead of tabbing field-by-field. Jargon is answered from a glossary on the page, not from a generic model guess. Sighted users still see the form update live. Manual typing and agent tools share one state store, so the UI never disagrees with the agent.

### What people and agents can do together that was difficult or impossible before

Together they can complete a multi-section bureaucratic form in one conversation **and** be structurally unable to submit an incomplete packet: if required fields are missing, `submit_form` is not in the agent’s tool list. Previously, an agent using computer-use could still press Submit; the user had to hope the model “checked first.”

### How you implemented WebMCP

Seven tools via the Imperative API (`document.modelContext.registerTool`), registered in React effects and unregistered with `AbortController`. Read-only tools (`get_form_overview`, `explain_field`, `validate_section`) vs mutating tools (`fill_field`, `fill_section`, `navigate_to_section`). `submit_form` is dynamically registered only when `isEntireFormValid` is true. Hosted on Vercel; no backend; mock data only.

## Demo video script (~2:45, English, read aloud)

1. **0:00–0:20** — Show the empty form. “Long benefits forms are hard with a screen reader. Agents can already guess at the DOM. Here the page declares tools — including a submit tool that does not exist until the form is valid.”
2. **0:20–1:20** — In ChatGPT’s browser, open the live URL. Ask what household composition means. Then give Maria’s name, DOB, and address in one sentence. Point at the field updating and the agent-action log.
3. **1:20–2:00** — Say “Submit my application.” Show the badge: `submit_form: not registered`. Agent lists missing fields.
4. **2:00–2:30** — Load complete demo applicant (or finish by voice). Show `submit_form: registered`. Submit. Success screen.
5. **2:30–2:45** — “WebMCP lets the site define the contract. This addresses the open W3C accessibility use-case gap.”

No copyrighted music. YouTube **Public**. Under three minutes.

## License

MIT. See `LICENSE`.
