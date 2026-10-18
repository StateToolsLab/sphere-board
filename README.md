# Sphere Board

**v0.6.0**

Sphere Board renders a `map.json` ledger or plan as a read-only **Sphere Board**. It does not edit planning facts in the board. The bundled viewer reads the `sphere-starter/0.3` map shape, lays it out, and lets you inspect nodes, current positions, readiness, relations, gates, lanes, and themes.

![Three-stage schematic of Sphere Board](docs/paper/figure-1.svg)

*Figure 1 from the [short paper](docs/paper/) (CC BY 4.0). A schematic, not a screenshot.*

## How this was built

Sphere Board is made by StateToolsLab with AI assistance. Design discussion, implementation, and first drafts of the documents and the short paper were shared with AI assistants — ChatGPT (OpenAI) and Claude (Anthropic). People set the requirements, decided at each stage gate, and checked every version against its tests, checksums, and the planning ledger before accepting it. The same division of work — AI proposes, people review and decide — is what [docs/ai-workflow.md](docs/ai-workflow.md) recommends for keeping a map up to date.

## Run it

The built viewers are self-contained: open `index.html` for English or `ja/index.html` for Japanese. Use **Open map.json** (Japanese: **map.json を開く**) to choose a local Starter map. Each viewer includes a fictional example in its own language. There is no in-page language switch; either viewer accepts maps in either language.

For local serving and automatic reload, use Node.js 22 or newer:

```sh
node tools/sphere.mjs serve --map examples/essay.json --port 8787
```

Then open `http://127.0.0.1:8787/` for English or `http://127.0.0.1:8787/ja/` for Japanese. Both show the selected `--map` file; to show Japanese sample data, use `--map examples/ja/essay.json`. In projects created with `init`, run `.sphere/sphere.mjs serve` and use the same URL paths. No npm install, CDN, API key, or runtime package dependency is required. `package.json` remains `private: true`; this repository is not prepared for package-registry publishing.

## Write a map.json

A Starter map uses `profile: "sphere-starter/0.3"` and contains project metadata, actors, nodes, relations, regions, current positions, lanes, and optional layout settings. Start with the [map.json guide](docs/map-json-guide.md), the [Starter format reference](spec/starter-map.md), and the machine-readable [schema](spec/starter-map.schema.json).

To ask an AI assistant to draft a Starter map from a plan, use [prompts/plan-to-map.md](prompts/plan-to-map.md). The prompt tells the assistant to preserve uncertainty instead of inventing facts.

## Read-only board and themes

The board is a viewer. Hover, selection, Esc, empty-space clearing, pan, zoom, list view, and theme switching do not rewrite the loaded map. State is communicated by fixed shapes; lane assignment is communicated by color. Core Plain is the bundled World theme, and Example Studio is a fictional Brand sample.

## Paper

A short paper explaining the ideas behind Sphere Board is in [`docs/paper/`](docs/paper/) (English and Japanese, version 1.1, revised 2026-10-18; first edition 1.0: 2026-10-17; CC BY 4.0).

## Build and test

```sh
node tools/build.mjs
node tools/build.mjs --check
node --test tests/*.test.cjs
node tools/verify-release.mjs
```

Development browser checks use Python, Playwright, and Chromium when available. They are not runtime dependencies of the viewer.

Version 0.6.0 was checked on Linux with Node.js 24, Python 3.12, Playwright 1.57, and Chromium 153. The complete existing Node suite passes, with additional bilingual checks. Both generated viewers passed the smoke, layout, and finish browser suites, plus real `file:` and loopback HTTP navigation. The paper, licenses, historical screenshots, geometry, and schemas are preserved. Results and scope are in [verification/TEST_REPORT.md](verification/TEST_REPORT.md); current captures are in [preview/v0.6.0/](preview/v0.6.0/). Firefox, Safari, mobile hardware, and public hosting were not tested for this version.

English terminology and translation choices are documented in [docs/viewer-terminology.md](docs/viewer-terminology.md). For the static source composition and single shared controller, see [docs/architecture.md](docs/architecture.md).

## License

- Code and other repository content outside `docs/paper/`: [MIT License](LICENSE). Copyright (c) 2026 StateToolsLab.
- Text in [`docs/paper/`](docs/paper/): [Creative Commons Attribution 4.0 International (CC BY 4.0)](docs/paper/LICENSE). Copyright (c) 2026 StateToolsLab.
