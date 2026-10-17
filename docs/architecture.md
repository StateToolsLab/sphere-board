# Architecture

The repository has three runtime layers: `app/core.js` validates Starter data and themes, `app/layout.js` / `app/camera.js` compute display geometry and view bounds, and `app/main.js` renders the read-only UI. `app/states.js` owns the fixed state/result geometry.

`tools/build.mjs` embeds CSS, JavaScript, schemas, themes, and a fictional Starter sample into one `index.html`. `tools/sphere.mjs` provides local Starter validation, snapshot/hash/diff/apply workflow helpers, project initialization, and a loopback-only read-only server.

No network API, CDN, package install, or external runtime dependency is required. Themes may alter presentation tokens but cannot replace state geometry or planning semantics.
