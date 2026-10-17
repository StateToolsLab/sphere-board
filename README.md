# Sphere Board

**v0.5.1**

Sphere Board renders a `map.json` ledger or plan as a read-only **Sphere Board**. It does not edit planning facts in the board. The bundled viewer reads the `sphere-starter/0.3` map shape, lays it out, and lets you inspect nodes, current positions, readiness, relations, gates, lanes, and themes.

![Three-stage schematic of Sphere Board](docs/paper/figure-1.svg)

*Figure 1 from the [short paper](docs/paper/) (CC BY 4.0). A schematic, not a screenshot.*

## How this was built

Sphere Board is made by StateToolsLab with AI assistance. Design discussion, implementation, and first drafts of the documents and the short paper were shared with AI assistants — ChatGPT (OpenAI) and Claude (Anthropic). People set the requirements, decided at each stage gate, and checked every version against its tests, checksums, and the planning ledger before accepting it. The same division of work — AI proposes, people review and decide — is what [docs/ai-workflow.md](docs/ai-workflow.md) recommends for keeping a map up to date.

## Run it

The built `index.html` is self-contained. You can open it directly in a browser and use **Open map.json** to choose a local Starter map.

For local serving and automatic reload, use Node.js 22 or newer:

```sh
node tools/sphere.mjs serve --map examples/essay.json --port 8787
```

Then open the local URL printed by the command. No npm install, CDN, API key, or runtime package dependency is required. `package.json` remains `private: true`; this repository is not prepared for package-registry publishing.

## Write a map.json

A Starter map uses `profile: "sphere-starter/0.3"` and contains project metadata, actors, nodes, relations, regions, current positions, lanes, and optional layout settings. Start with the [map.json guide](docs/map-json-guide.md), the [Starter format reference](spec/starter-map.md), and the machine-readable [schema](spec/starter-map.schema.json).

To ask an AI assistant to draft a Starter map from a plan, use [prompts/plan-to-map.md](prompts/plan-to-map.md). The prompt tells the assistant to preserve uncertainty instead of inventing facts.

## Read-only board and themes

The board is a viewer. Hover, selection, Esc, empty-space clearing, pan, zoom, list view, and theme switching do not rewrite the loaded map. State is communicated by fixed shapes; lane assignment is communicated by color. Core Plain is the bundled World theme, and Example Studio is a fictional Brand sample.

## Paper

A short paper explaining the ideas behind Sphere Board is in [`docs/paper/`](docs/paper/) (English and Japanese, version 1.0, 2026-10-17; CC BY 4.0).

## Build and test

```sh
node tools/build.mjs
node tools/build.mjs --check
node --test tests/*.test.cjs
node tools/verify-release.mjs
```

Development browser checks use Python, Playwright, and Chromium when available. They are not runtime dependencies of the viewer.

Version 0.5.1 was checked with Node.js, Python, Playwright, and Chromium on Linux. The exact built HTML bytes were rendered and exercised in Chromium, and the Node test suite exercised the real local HTTP server at the protocol level. This verification environment blocks Chromium navigation to both `file://` and localhost URLs by policy, so end-to-end browser navigation through those URLs remains unverified here. Separately, StateToolsLab opened v0.5.0 in desktop Chrome through the local server, and the built-in sample of v0.4.0 in iOS Safari and Android Chrome. Firefox, public hosting configurations, and package-registry publishing have not been verified.

## License

- Code and other repository content outside `docs/paper/`: [MIT License](LICENSE). Copyright (c) 2026 StateToolsLab.
- Text in [`docs/paper/`](docs/paper/): [Creative Commons Attribution 4.0 International (CC BY 4.0)](docs/paper/LICENSE). Copyright (c) 2026 StateToolsLab.
