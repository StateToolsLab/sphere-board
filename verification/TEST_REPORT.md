# Sphere Board v0.6.0 — verification report

Date: 2026-10-17. Base: supplied `sphere-board-0b018da.zip`, commit `0b018da84bc44795945e9dddc796422d21ed0f2f` (v0.5.1 plus the README Figure 1 update). No push, tag, hosting, or release publication was performed.

## Environment

Linux; Node.js 24.19.0; Python 3.12; Playwright 1.57.0; Chromium 153.0.8010.0. Browser and Python packages were used only for development checks and are not included in the distribution. The viewer, build, and CLI retain zero external runtime/package dependencies.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Original v0.5.1 Node suite | 90/90 passed before changes; all retained in the final suite | Existing core, layout, states, and CLI tests |
| Final Node suite | 97/97 passed (7 new bilingual tests) | `node --test tests/*.test.cjs` |
| Schema parity | 9/9 maps valid | `python3 tests/schema_parity.py` |
| English smoke | 38 passed, 0 failed | `browser-smoke-en.json` |
| Japanese smoke | 38 passed, 0 failed | `browser-smoke-ja.json` |
| English layout | 250 passed, 0 failed | `browser-layout-en.json` |
| Japanese layout | 250 passed, 0 failed | `browser-layout-ja.json` |
| English finish | 37 passed, 0 failed | `browser-finish-en.json` |
| Japanese finish | 37 passed, 0 failed | `browser-finish-ja.json` |
| Additional bilingual browser checks | 36 passed, 0 failed | `browser-bilingual.json` |
| Browser total | 686 passed, 0 failed; no uncaught JavaScript errors | Seven JSON reports above |
| Build parity | English and Japanese outputs match their current sources byte for byte; repeat build stable | `node tools/build.mjs --check`; bilingual Node test also checks drift detection in each output |
| Release inventory and checksums | All files listed; SHA-256 matches every file except the checksum list itself | `node tools/verify-release.mjs` |
| Protected attachment content | All 17 protected files match the supplied archive bytes | `BASELINE_SHA256SUMS.txt` and release verifier |

## Acceptance coverage

- Root `index.html` is English (`lang="en"`); `ja/index.html` is Japanese (`lang="ja"`). Both are self-contained. The English HTML, its UI source, all English examples, and theme metadata contain no Japanese characters.
- English DOM and accessibility text were checked on the built-in map, every essay node's details, theme settings, empty search, malformed JSON, unsupported maps, and an empty board. Japanese map data imports into the English viewer verbatim without changing its UI language.
- Both languages contain all 15 work-state names, 6 gate-result names, 3 gate-kind names, and localized shape descriptions. The 21 fixed SVG paths retain the accepted geometry; the baseline shape digest passes.
- English/Japanese example pairs validate and retain IDs, structure, relation facts, ownership, states, readiness, ordering, node coordinates, seat sizes, and bounds. The default map files match the corresponding essay examples byte for byte.
- Hover tooltip and related-line emphasis; direct selection switching; arrow-key focus, Enter, Esc, and empty-space clearing; focus/selection distinction; current-position cycling; list search; theme and brand switching; pan/pinch/zoom; forced colors and reduced-motion settings all pass in both viewers. Map snapshots and computed geometry stay unchanged by display operations.
- Layout checks include both examples and 10/60/150/300-node fixtures, at 1440px and 375px. Smoke checks also cover 320px, 768px, and 1280px. No horizontal page overflow was found.
- Real browser `file:` navigation confirms each viewer opens its correct built-in demo offline. Real loopback HTTP navigation confirms both viewer paths read the selected CLI map. Node HTTP checks cover HTML content types, Japanese map alias, read-only methods, Host/Origin guards, hidden paths, and portable `init` output.
- `docs/paper/` (including Figure 1 and its CC BY 4.0 license), root MIT license, all four `preview/v0.5.0/` images, common core/layout/camera/CSS, and both schemas are byte-identical to the attachment.

## Screenshots and inspection

`preview/v0.6.0/en/` and `preview/v0.6.0/ja/` contain 50 captures each: smoke screenshots, layout/scale fixtures, both example plans in light/dark at desktop and 375px with hover/selection, and the 21-entry state legend. Representative English desktop/mobile and Japanese mobile images were visually inspected. The narrow English detail label uses “Position” to fit the original shared layout.

Screenshots are actual Chromium captures of fictional plans. Fixture suites inject the exact built HTML and mock only fixture fetches. Separate bilingual checks exercise real file and HTTP navigation. Historical preview images are unchanged.

## Limits

Chromium/Linux only for this release. Mobile widths and touch events are emulated; no physical smartphone, Safari, Firefox, Windows/macOS font rendering, or public hosting was tested. Approval/evidence text in examples remains fictional; passing these tests does not certify any real project's progress.

## Reproduce

See `docs/testing.md` for commands. Run browser checks before regenerating release manifests because screenshots and measurement reports are written by those checks. Regenerate with `node tools/release-manifest.mjs`, then run `node tools/verify-release.mjs`. The ZIP's own SHA-256 is supplied alongside it; it cannot be included as a checksum of itself.

## Packaging note (2026-10-18)

The test run above produced 50 captures per language under `preview/v0.6.0/`. For the published repository only eight representative images are kept (`preview/v0.6.0/{en,ja}/essay-{desktop,375}-{light,dark}.png`); the rest are regenerated by the browser tests. The short paper in `docs/paper/` was updated to version 1.1 and `CITATION.cff` was added after this run; the Node suite, both build checks, and `tools/verify-release.mjs` were re-run on the packaged tree (results in `docs/paper/check.md`, section on version 1.1 verification).

Because the paper text was intentionally revised, `verification/BASELINE_SHA256SUMS.txt` now protects 13 files instead of 17: the four paper text files (`docs/paper/README.md`, both paper versions, `docs/paper/check.md`) were removed from it. `docs/paper/LICENSE`, `docs/paper/figure-1.svg`, the root license, the shared core/layout/camera/CSS, both schemas, and the four `preview/v0.5.0/` images remain protected.
