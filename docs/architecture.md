# Architecture

`app/core.js` validates Starter data and themes. `app/layout.js` and `app/camera.js` compute display geometry and camera bounds. `app/states.js` owns the fixed 21 state/result paths and the state sets used for validation. These modules, and `app/styles.css`, are shared byte-for-byte by both viewers.

`app/main.js` is the single renderer and interaction controller. Selection, hover, keyboard navigation, search, theme resolution, file handling, reload, and read-only safeguards have one implementation.

The two presentation source directories, `app/en/` and `app/ja/`, each contain a complete HTML template, a small `main.js` with text-formatting functions, and `states.js` with the display names and shape descriptions. Presentation functions format supplied values; they do not choose work states, readiness, positions, or approval. The build inserts exactly one presentation source into the shared controller's lexical scope. There is no runtime language detection, switching, translation lookup, or external dictionary. No user text is translated.

`node tools/build.mjs` composes `index.html` (English) and `ja/index.html` (Japanese), each standalone and offline-capable. `--check` compares both outputs as bytes. Each embeds the matching essay example; `map.json` and `ja/map.json` contain those same samples for static serving.

The CLI exposes only the two viewers and aliases for the one selected map. `/` and `/index.html` open English; `/ja/` and `/ja/index.html` open Japanese. Both `/map.json` and `/ja/map.json` read the CLI's `--map` target. Choosing a Japanese viewer never changes or translates the selected map. `init` copies both standalone viewers into the portable `.sphere` project.
