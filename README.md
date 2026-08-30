# ClearPath Forms

A mock public-assistance application that a screen-reader user, motor-impaired user, or non-native English speaker can complete by talking to an AI agent. The page declares typed WebMCP tools instead of asking the agent to scrape the DOM.

This is a practice form. **No data is sent to a government agency.**

## Live usage (judges)

1. Open the live URL in **ChatGPT’s desktop in-app browser**, or in **Chrome 150+** with `chrome://flags/#enable-webmcp-testing` set to Enabled.
2. Ask, in ordinary language:
   - “What does household composition mean?”
   - “My name is Maria Santos, born March 4 1990, I live at 12 Elm Street, Oakland CA 94612. Phone 510-555-0142, email maria.santos@example.com.”
   - “Submit my application” **before** the form is complete — `submit_form` should be **absent**. The agent should explain what is missing.
   - Finish the remaining sections, then “Submit it.”
3. On the page, **Reset demo** clears state. **Load complete demo applicant** fills Maria’s answers so `submit_form` appears immediately.

WebMCP on this page uses the Imperative API: `document.modelContext.registerTool(...)`, with `AbortController` cleanup. `submit_form` is registered only when every required field is valid.

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

UI clicks and tool `execute()` functions share the same React reducer and validation functions.

## Accessibility

The form is usable with keyboard and screen reader without an agent (labels, fieldsets, focus on section headings, `aria-live` announcements when tools write). WebMCP is additive.

## License

MIT. See `LICENSE`.
