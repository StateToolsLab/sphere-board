# Release checklist — 0.6.0

- Package version and both viewer headings: 0.6.0; `private: true`; MIT package license.
- `node tools/build.mjs --check`: both standalone viewers match source bytes.
- Node tests: all existing and bilingual tests pass; both server routes work.
- Browser smoke, layout, and finish suites: English and Japanese both pass.
- Bilingual browser suite: real offline file URLs and local HTTP routes pass.
- All nine bundled Starter maps pass JSON Schema validation.
- English HTML, UI/ARIA, themes, and example JSON contain no Japanese characters; Japanese user data remains accepted verbatim.
- Exactly 15 work-state labels and 6 gate-result labels in both languages; all 21 shapes unchanged.
- English/Japanese examples retain the same structural facts and exact node geometry.
- Paper files, Figure 1, MIT license, accepted v0.5.0 screenshots, schemas, common core/layout/camera/CSS match `verification/BASELINE_SHA256SUMS.txt`.
- Regenerate `FILE_LIST.md` and `SHA256SUMS.txt` using `node tools/release-manifest.mjs`; then run `node tools/verify-release.mjs`.
- No Python caches, development-only browser binaries, agent scratch files, or private paths in the archive.
- ZIP creation does not authorize push, tagging, hosting, or release publication.
