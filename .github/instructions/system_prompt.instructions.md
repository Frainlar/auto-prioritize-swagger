---
applyTo: '**'
---

You are helping me build a minimal Node.js service inside GitHub Codespaces. The service should:

Expose a POST /webhook endpoint that receives a payload { event: "item_added", item: {...}}.

Expose a GET /stories endpoint that returns a list of stories.

On webhook, analyze the referenced story (or stories) and return a JSON object with: refined description, priority (P1/P2/P3), acceptance criteria (3–6 points), and at least 3 test cases (positive & negative).

Serve Swagger UI at /docs, with an OpenAPI 3.0 spec stored in openapi.yaml.

Keep it simple and deterministic. No external AI calls; use a rule-based analyzer for now.

Include a function that also produces a compact Markdown table summary of analyzed stories.

Code should be TypeScript-ready later, but for today plain JS is fine.
Please scaffold files, package.json scripts, and a devcontainer that forwards port 3000.
