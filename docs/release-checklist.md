# Release checklist

- `package.json`: name `sphere-board`, version 0.5.1, `private: true`, package license MIT.
- Root `LICENSE` is the unchanged MIT license for StateToolsLab.
- `docs/paper/LICENSE` applies CC BY 4.0 to the paper text and points to the canonical Creative Commons URL.
- English and Japanese README license sections distinguish MIT content from `docs/paper/` text.
- Public text files contain the finalized Sphere Board naming; the former Japanese product label is absent from non-image files.
- `node --test tests/*.test.cjs` passes.
- `python tests/schema_parity.py` passes.
- `node tools/build.mjs --check` passes.
- `node tools/verify-release.mjs` passes.
- Only the current `preview/v0.5.0/` README screenshots and state-shape sheets are kept in the public repository; older preview images were removed. Image text is outside the v0.5.1 wording update.
- Public archive contains only Starter-facing runtime, docs, examples, product templates, and release verification material.
