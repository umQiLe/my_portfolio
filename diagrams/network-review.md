# Network and CLI review

Reviewed the production build on 2026-10-28. Design references and implementation notes are in README.md.

Passed:
- Build and full repository ESLint check.
- Six automated regression groups: graph integrity/reachability, all saved details searchable, virtual files/current role, navigation allowlist, completion, local FAQ/actions.
- Desktop browser review at 1280 × 720 and 1440 × 1000; mobile at 390 × 844.
- Pointer dragging changes a node’s position; Enter selects a node; arrow keys move the selected node; reset and fit restore the overview.
- Projects expand to individual nodes; selecting NetMaster or BSD in Rust displays the saved description and related topic controls.
- Global Rust search opens a detail within a previously collapsed topic; empty search shows guidance.
- CLI filename completion, command navigation, current ANTlabs FAQ, history recall and draft restoration.
- Tab moves focus normally when there is no completion; Escape collapses and restores focus; collapsed input is absent from the DOM.
- Five repeated open/close cycles preserve the surrounding page’s exact scroll position.
- Mobile detail selection and local FAQ are usable; content width equals scroll width (375 CSS pixels at the 390-pixel viewport).
- Fresh production-preview console: no errors or warnings after graph, search, resize and CLI interactions.
- Compatible dependency fixes applied; npm audit reports zero vulnerabilities.

The FAQ is local saved content, not an LLM service. Graph relationships describe the portfolio, not live infrastructure. Earlier Archify verification applies only to the preserved standalone Archify HTML.
