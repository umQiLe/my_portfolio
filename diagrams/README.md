# Portfolio topology

The Topology tab embeds the exact Archify HTML in `public/diagrams/portfolio-topology.html`. The same HTML opens independently with its full search, focus, pan/zoom, theme and export controls. The React detail explorer uses `src/data/overview.json` and `src/data/resume.json`; selecting a diagram node opens the matching topic with pointer or keyboard input.

This is a personal profile map. Its arrows connect Qi Le to areas of his portfolio; they do not depict network traffic, service dependencies or a chronological workflow. All diagram components use the neutral external type, and the technical component legend is hidden.

## Sources and updates

- `portfolio-topology.architecture.json` is the authored diagram specification.
- `portfolio-topology.delivery.json` records deterministic delivery and SHA-256 hashes.
- `evidence/` contains the artifact-bound automated browser report, contact sheet and four screenshots.
- `portfolio-topology.review.json` records the separate perceptual review and website interaction checks.

When updating the profile map, reconcile the specification with the two data files, then run the installed Archify CLI from the repository root:

```text
node <archify-skill>/bin/archify.mjs validate architecture diagrams/portfolio-topology.architecture.json --quality showcase --json
node <archify-skill>/bin/archify.mjs deliver architecture diagrams/portfolio-topology.architecture.json public/diagrams/portfolio-topology.html --quality showcase --json
node <archify-skill>/bin/archify.mjs visual-check public/diagrams/portfolio-topology.html --json
npm run build
```

Refresh the delivery receipt and browser evidence after changing the specification. Do not hand-edit the delivered HTML. Git preserves the specification and HTML bytes so the receipt remains verifiable after checkout. Image-generation drafts and unrelated local attachments are not part of this feature.

## Review and behavior

The former topology used mouse/touch dragging, radial subnodes and hover-only details. Fixed radii and right-aligned popups could clip at the canvas edges; there was no keyboard route to the details. The replacement uses validated orthogonal relationships, native topic buttons, global text search, and readable detail cards. Mobile starts with the map collapsed and all topics available. The hosting configuration permits same-origin frames so the first-party diagram works on Vercel while other sites remain unable to frame this site.

Archify's license is retained in `ARCHIFY-LICENSE.txt`. The self-contained HTML includes its bundled font license.
