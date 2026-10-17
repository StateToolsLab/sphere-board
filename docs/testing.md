# Testing

Run `node --test tests/*.test.cjs` for data rules, layout, camera, CLI safety, themes, and state geometry. Run `node tools/build.mjs --check` to confirm that the committed `index.html` is byte-identical to the current source output. Run `node tools/verify-release.mjs` for the distribution-level checks.

Optional browser checks use Playwright and Chromium. `tests/browser_smoke.py`, `tests/browser_layout.py`, and `tests/browser_finish.py` exercise rendering and interactions; `tests/schema_parity.py` checks bundled Starter examples against the schema. These development tools are not viewer runtime dependencies.
