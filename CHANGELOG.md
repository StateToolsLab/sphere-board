# Changelog

## 0.6.0 — English-first viewer

- Made `index.html` English and added a standalone Japanese viewer at `ja/index.html`.
- Kept one shared renderer/controller, core, layout, camera, CSS, and all 21 state/result geometries; presentation sources and state descriptions are separated by language with no runtime language switching or translation dictionary.
- Added matching fictional English/Japanese examples, default maps, and English theme metadata.
- Extended the read-only CLI server and portable init output to both viewer paths.
- Added bilingual build, vocabulary, geometry, UI/ARIA, file URL, HTTP, and interaction verification, with both-language screenshots.
- Regenerated the file list and checksums; preserved licenses, schemas, and v0.5.0 screenshots.
- Updated the short paper in `docs/paper/` to version 1.1 (revised 2026-10-18; states may be shown by shapes and marks, or by color; the reference implementation still uses shapes). Version 1.0 remains unchanged in the v0.5.1 release. Figure 1 and the CC BY 4.0 license are unchanged.
- Added `CITATION.cff` (author Kiyoshi Deguchi, ORCID; copyright holder StateToolsLab).
- Kept eight representative screenshots under `preview/v0.6.0/` (essay, English/Japanese, light/dark, desktop/375px); the other browser-test captures are regenerated locally by the tests.

- The README (English and Japanese) now opens with Figure 1 of the short paper (`docs/paper/figure-1.svg`) instead of the v0.5.0 screenshots. The screenshots stay under `preview/v0.5.0/`. This README image change predates the viewer changes in this release.

## 0.5.1 — Sphere Board

- Set the product name to **Sphere Board** and removed the working-name / product-level Starter label from public headings and version metadata.
- Standardized Japanese product wording as **Sphere Board（スフィアボード）** and rebuilt `index.html` from the updated source.
- Added `docs/paper/` as the home for the forthcoming short paper and linked it from both READMEs.
- Added the short paper, version 1.0 (English and Japanese, Figure 1, verification notes), to `docs/paper/`, dated 2026-10-17, licensed CC BY 4.0.
- Added a "How this was built" section to both READMEs (made with AI assistance; people decide and check), and noted in CONTRIBUTING that the repository ships sample themes only and more themes will be added over time.
- Kept only the current README screenshots and state-shape sheets under `preview/v0.5.0/`; removed older preview images from the public repository.
- Kept the root MIT license unchanged and applied CC BY 4.0 to the text under `docs/paper/`, with StateToolsLab attribution guidance and the canonical Creative Commons URL.
- Added release checks for product wording, paper licensing, README license separation, package name/version, and source/build parity.

## 0.5.0 — public candidate

- Added MIT licensing for the full repository, with StateToolsLab as the 2026 copyright holder.
- Added English and Japanese public READMEs, a contribution draft, security reporting note, and release ignore rules.
- Kept the viewer read-only and the Starter 0.3 format unchanged.
- Locked the gate `cancelled` mark to a diamond containing an × and verified that all 21 displayed state/result shapes remain distinct.
- Added refreshed light/dark shape sheets and README screenshots.
- Prepared separate public and internal archives; the public archive contains only the Starter-facing viewer and workflow.
