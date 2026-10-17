# Contributing

This is a draft contribution guide for Sphere Board v0.5.1.

## Issues

Open an issue with the smallest reproducible example you can provide. Include the browser and Node version when relevant, the Starter profile version, the steps you took, what you expected, and what happened. Remove private project data before attaching a map.

## Changes

Keep changes focused. Before proposing a change, run the Node test suite and rebuild the bundled HTML. `node tools/build.mjs --check` must confirm that `index.html` is byte-identical to the current source output. If your change affects browser behavior, run the relevant browser checks and update intentional screenshots.

Do not hand-edit generated `index.html` without making the same source change under `app/`. A contribution is not ready when the generated HTML and source disagree.

## Themes

A theme may change presentation, not planning semantics. Do not add real work titles, logos, trademarked characters, product-specific artwork, or another work's distinctive visual identity. State remains encoded by the fixed state shapes; color is reserved for lanes and general presentation tokens. Theme data must stay within the documented JSON token and slot model.

The repository ships only sample themes: one world theme (Core Plain) and one fictional brand (Example Studio). More themes will be added over time as they are made; new themes are welcome if they follow the rules above.

## Conduct

There is no separate `CODE_OF_CONDUCT.md` in this candidate. Keep technical discussion specific, respectful, and relevant to the proposed change.
