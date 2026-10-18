# Testing

No dependency is required to build, use, or run the Node tests (Node.js 22+).

```sh
node tools/build.mjs --check
node --test tests/*.test.cjs
node tools/verify-release.mjs
```

Optional development-only dependencies are listed in `requirements-dev.txt`. Install those and a Chromium browser supported by Playwright. Set `SPHERE_BROWSER` to a local Chromium executable if needed. Run the complete existing browser matrix in both languages:

```sh
SPHERE_LANG=en python3 tests/browser_smoke.py
SPHERE_LANG=ja python3 tests/browser_smoke.py
SPHERE_LANG=en python3 tests/browser_layout.py
SPHERE_LANG=ja python3 tests/browser_layout.py
SPHERE_LANG=en python3 tests/browser_finish.py
SPHERE_LANG=ja python3 tests/browser_finish.py
python3 tests/browser_bilingual.py
python3 tests/schema_parity.py
```

The first three scripts inject the exact generated HTML bytes and mock fixture fetches. The bilingual suite additionally navigates real `file:` URLs and the local CLI HTTP server, checks the correct built-in samples, English errors/empty views/ARIA, and Japanese user data in the English viewer. The Node suite exercises CLI conflict guards and both server routes.

Reports go to `verification/`; screenshots go to `preview/v0.6.0/en/` and `preview/v0.6.0/ja/` (only eight representative images are kept in the repository; see `preview/README.md`). The accepted `preview/v0.5.0/` images are never overwritten. After a final test run, remove Python cache files, then run `node tools/release-manifest.mjs` and `node tools/verify-release.mjs` before packaging. Do not rerun screenshot-generating tests after creating final checksums without refreshing the manifests.
