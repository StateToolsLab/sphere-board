# v0.5.1 public candidate test report

- Node test suite: 90 passed, 0 failed.
- Starter schema parity: 5 maps passed.
- Browser smoke: 38 checks passed, 0 failed.
- Browser layout: 250 checks passed, 25 screenshots generated in the disposable test copy, 0 failed.
- Browser finish: 37 checks passed, 20 screenshots generated in the disposable test copy, 0 failed.
- Build check: `index.html` is byte-identical to current source output.
- State/result geometry: gate `cancelled` is diamond + ×; all 21 displayed shapes are distinct; the other 20 geometries match the accepted v0.4.0 baseline.
- Public boundary: only `sphere-starter/0.3` maps are accepted; unsupported input stops drawing and shows 「この形は読めません」.
- v0.5.1 release checks: package name/version are `sphere-board` / `0.5.1`; the root MIT `LICENSE` is byte-identical to v0.5.0; `docs/paper/LICENSE` contains CC BY 4.0, StateToolsLab, and the canonical Creative Commons URL; both README license sections list MIT and CC BY 4.0; the former Japanese product label is absent from all non-image public files; every release file except `SHA256SUMS.txt` is covered by `SHA256SUMS.txt`.
- Public release verifier: `node tools/verify-release.mjs` passed.
- Browser tests were run against a disposable copy of the exact v0.5.1 app source and built `index.html`, so test-generated screenshots did not overwrite the retained `preview/v0.5.0/` history assets in this archive.
- Browser environment note: Chromium URL navigation to both local files and localhost is blocked by administrator policy. Exact built HTML bytes were exercised in Chromium, while the Node suite exercised the real loopback HTTP server separately.
