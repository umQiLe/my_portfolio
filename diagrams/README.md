# Portfolio topology

The Topology tab now uses React Flow for a native interactive network. The center connects to seven profile areas. Solid lines represent topic membership; dotted, labeled lines show relationships documented in the saved profile (for example projects completed at work). These are profile relationships, not live network traffic.

Select a node with a pointer, Enter or Space to inspect it. Expand a topic to see its individual connections. Drag nodes to arrange them, pan the canvas, use the zoom/fit controls, or navigate with the minimap. Search covers all 31 details, including collapsed topics. Selecting a result opens its neighborhood. Reset restores the original arrangement. Native topic and detail buttons provide an alternative to navigating the graph, especially on smaller screens.

## Sources and implementation

- `src/data/profile.js` combines `overview.json` and `resume.json`, defines names, explicit relationships and deterministic graph layouts.
- `src/components/MainDashboard.jsx` owns network navigation and the detail inspector.
- `src/lib/portfolioShell.js` reads the same facts for the local portfolio console.
- `tests/portfolio.test.mjs` checks reachability, network integrity, searching, command parsing, file completion and current FAQ facts. Run `npm test`.

Design references: [React Flow interaction examples](https://reactflow.dev/examples), [accessibility](https://reactflow.dev/learn/advanced-use/accessibility), and [Cytoscape.js network exploration](https://js.cytoscape.org/). React Flow was selected for its React node support, drag/pan/zoom, keyboard interaction and minimap. A bitmap workflow such as ComfyUI is unnecessary for these interactive elements.

## Previous Archify version

`portfolio-topology.architecture.json`, `portfolio-topology.delivery.json`, `portfolio-topology.review.json`, `evidence/`, and `public/diagrams/portfolio-topology.html` preserve the earlier Archify diagram and its original verification. They are no longer embedded in the Topology tab. Those receipts apply to that archived HTML only, not the current React Flow feature. Archify’s license is retained in `ARCHIFY-LICENSE.txt`.

## Console behavior

The console is a disclosure panel. Its body unmounts when collapsed so the input cannot receive hidden focus. The transcript scrolls internally, independently of the page. No height animation or simulated typing timers run during opening/closing. Escape restores focus to the disclosure button. Ctrl + backtick toggles the panel; Tab completes an unambiguous prefix and otherwise follows normal focus order; Shift + Tab always moves focus. Up/down recall commands and restore the draft. The console is a virtual profile browser, not a system shell. `ask` and the legacy `ssh admin@host` alias use a local FAQ and do not invoke an AI service. Commands are not transmitted to a logging endpoint.
