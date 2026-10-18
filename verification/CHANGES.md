# Sphere Board v0.6.0 — 変更ファイル一覧

比較元: 添付 `sphere-board-0b018da.zip`（commit `0b018da84bc44795945e9dddc796422d21ed0f2f`）。公開操作は行っていません。

## 移動

| 移動元 | 移動先 | 備考 |
| --- | --- | --- |
| `app/template.html` | `app/ja/template.html` | version・表示ソースの挿入箇所を更新 |
| `examples/essay.json` | `examples/ja/essay.json` | 日本語の元データをバイト単位で保持。元のパスは英語版に差し替え |
| `examples/exhibition.json` | `examples/ja/exhibition.json` | 日本語の元データをバイト単位で保持。元のパスは英語版に差し替え |
| `examples/sample-map.json` | `examples/ja/sample-map.json` | 日本語の元データをバイト単位で保持。元のパスは英語版に差し替え |

## 追加

以下は移動先以外の新規パスです。画面写真も各ファイルを列記しています。

- `app/en/main.js`
- `app/en/states.js`
- `app/en/template.html`
- `app/ja/main.js`
- `app/ja/states.js`
- `docs/viewer-terminology.md`
- `ja/index.html`
- `ja/map.json`
- `preview/v0.6.0/en/essay-375-dark-hover.png`
- `preview/v0.6.0/en/essay-375-dark-selected.png`
- `preview/v0.6.0/en/essay-375-light-hover.png`
- `preview/v0.6.0/en/essay-375-light-selected.png`
- `preview/v0.6.0/en/essay-desktop-dark-hover.png`
- `preview/v0.6.0/en/essay-desktop-dark-selected.png`
- `preview/v0.6.0/en/essay-desktop-light-hover.png`
- `preview/v0.6.0/en/essay-desktop-light-selected.png`
- `preview/v0.6.0/en/exhibition-375-dark-hover.png`
- `preview/v0.6.0/en/exhibition-375-dark-selected.png`
- `preview/v0.6.0/en/exhibition-375-light-hover.png`
- `preview/v0.6.0/en/exhibition-375-light-selected.png`
- `preview/v0.6.0/en/exhibition-desktop-dark-hover.png`
- `preview/v0.6.0/en/exhibition-desktop-dark-selected.png`
- `preview/v0.6.0/en/exhibition-desktop-light-hover.png`
- `preview/v0.6.0/en/exhibition-desktop-light-selected.png`
- `preview/v0.6.0/en/layout/essay-375-bottom-sheet.png`
- `preview/v0.6.0/en/layout/essay-375-initial.png`
- `preview/v0.6.0/en/layout/essay-375-overview.png`
- `preview/v0.6.0/en/layout/essay-desktop-initial.png`
- `preview/v0.6.0/en/layout/essay-desktop-overview.png`
- `preview/v0.6.0/en/layout/exhibition-375-initial.png`
- `preview/v0.6.0/en/layout/exhibition-375-overview.png`
- `preview/v0.6.0/en/layout/exhibition-desktop-initial.png`
- `preview/v0.6.0/en/layout/exhibition-desktop-overview.png`
- `preview/v0.6.0/en/layout/scale-10-375-initial.png`
- `preview/v0.6.0/en/layout/scale-10-375-overview.png`
- `preview/v0.6.0/en/layout/scale-10-desktop-initial.png`
- `preview/v0.6.0/en/layout/scale-10-desktop-overview.png`
- `preview/v0.6.0/en/layout/scale-150-375-initial.png`
- `preview/v0.6.0/en/layout/scale-150-375-overview.png`
- `preview/v0.6.0/en/layout/scale-150-desktop-initial.png`
- `preview/v0.6.0/en/layout/scale-150-desktop-overview.png`
- `preview/v0.6.0/en/layout/scale-300-375-initial.png`
- `preview/v0.6.0/en/layout/scale-300-375-overview.png`
- `preview/v0.6.0/en/layout/scale-300-desktop-initial.png`
- `preview/v0.6.0/en/layout/scale-300-desktop-overview.png`
- `preview/v0.6.0/en/layout/scale-60-375-initial.png`
- `preview/v0.6.0/en/layout/scale-60-375-overview.png`
- `preview/v0.6.0/en/layout/scale-60-desktop-initial.png`
- `preview/v0.6.0/en/layout/scale-60-desktop-overview.png`
- `preview/v0.6.0/en/mobile-375.png`
- `preview/v0.6.0/en/mobile-settings-375.png`
- `preview/v0.6.0/en/plain-dark-desktop.png`
- `preview/v0.6.0/en/plain-desktop.png`
- `preview/v0.6.0/en/readme-dark.png`
- `preview/v0.6.0/en/readme-light.png`
- `preview/v0.6.0/en/settings-theme-lab.png`
- `preview/v0.6.0/en/state-shapes-dark.png`
- `preview/v0.6.0/en/state-shapes-light.png`
- `preview/v0.6.0/ja/essay-375-dark-hover.png`
- `preview/v0.6.0/ja/essay-375-dark-selected.png`
- `preview/v0.6.0/ja/essay-375-light-hover.png`
- `preview/v0.6.0/ja/essay-375-light-selected.png`
- `preview/v0.6.0/ja/essay-desktop-dark-hover.png`
- `preview/v0.6.0/ja/essay-desktop-dark-selected.png`
- `preview/v0.6.0/ja/essay-desktop-light-hover.png`
- `preview/v0.6.0/ja/essay-desktop-light-selected.png`
- `preview/v0.6.0/ja/exhibition-375-dark-hover.png`
- `preview/v0.6.0/ja/exhibition-375-dark-selected.png`
- `preview/v0.6.0/ja/exhibition-375-light-hover.png`
- `preview/v0.6.0/ja/exhibition-375-light-selected.png`
- `preview/v0.6.0/ja/exhibition-desktop-dark-hover.png`
- `preview/v0.6.0/ja/exhibition-desktop-dark-selected.png`
- `preview/v0.6.0/ja/exhibition-desktop-light-hover.png`
- `preview/v0.6.0/ja/exhibition-desktop-light-selected.png`
- `preview/v0.6.0/ja/layout/essay-375-bottom-sheet.png`
- `preview/v0.6.0/ja/layout/essay-375-initial.png`
- `preview/v0.6.0/ja/layout/essay-375-overview.png`
- `preview/v0.6.0/ja/layout/essay-desktop-initial.png`
- `preview/v0.6.0/ja/layout/essay-desktop-overview.png`
- `preview/v0.6.0/ja/layout/exhibition-375-initial.png`
- `preview/v0.6.0/ja/layout/exhibition-375-overview.png`
- `preview/v0.6.0/ja/layout/exhibition-desktop-initial.png`
- `preview/v0.6.0/ja/layout/exhibition-desktop-overview.png`
- `preview/v0.6.0/ja/layout/scale-10-375-initial.png`
- `preview/v0.6.0/ja/layout/scale-10-375-overview.png`
- `preview/v0.6.0/ja/layout/scale-10-desktop-initial.png`
- `preview/v0.6.0/ja/layout/scale-10-desktop-overview.png`
- `preview/v0.6.0/ja/layout/scale-150-375-initial.png`
- `preview/v0.6.0/ja/layout/scale-150-375-overview.png`
- `preview/v0.6.0/ja/layout/scale-150-desktop-initial.png`
- `preview/v0.6.0/ja/layout/scale-150-desktop-overview.png`
- `preview/v0.6.0/ja/layout/scale-300-375-initial.png`
- `preview/v0.6.0/ja/layout/scale-300-375-overview.png`
- `preview/v0.6.0/ja/layout/scale-300-desktop-initial.png`
- `preview/v0.6.0/ja/layout/scale-300-desktop-overview.png`
- `preview/v0.6.0/ja/layout/scale-60-375-initial.png`
- `preview/v0.6.0/ja/layout/scale-60-375-overview.png`
- `preview/v0.6.0/ja/layout/scale-60-desktop-initial.png`
- `preview/v0.6.0/ja/layout/scale-60-desktop-overview.png`
- `preview/v0.6.0/ja/mobile-375.png`
- `preview/v0.6.0/ja/mobile-settings-375.png`
- `preview/v0.6.0/ja/plain-dark-desktop.png`
- `preview/v0.6.0/ja/plain-desktop.png`
- `preview/v0.6.0/ja/readme-dark.png`
- `preview/v0.6.0/ja/readme-light.png`
- `preview/v0.6.0/ja/settings-theme-lab.png`
- `preview/v0.6.0/ja/state-shapes-dark.png`
- `preview/v0.6.0/ja/state-shapes-light.png`
- `tests/bilingual.test.cjs`
- `tests/browser_bilingual.py`
- `tools/release-manifest.mjs`
- `verification/BASELINE_SHA256SUMS.txt`
- `verification/CHANGES.md`
- `verification/browser-bilingual.json`
- `verification/browser-finish-en.json`
- `verification/browser-finish-ja.json`
- `verification/browser-layout-en.json`
- `verification/browser-layout-ja.json`
- `verification/browser-smoke-en.json`
- `verification/browser-smoke-ja.json`

## 変更

英語に差し替えた `examples/*.json` もこちらに含めています。

- `CHANGELOG.md`
- `FILE_LIST.md`
- `README.ja.md`
- `README.md`
- `SHA256SUMS.txt`
- `app/main.js`
- `app/states.js`
- `docs/architecture.md`
- `docs/release-checklist.md`
- `docs/testing.md`
- `examples/README.md`
- `examples/essay.json`
- `examples/exhibition.json`
- `examples/sample-map.json`
- `index.html`
- `map.json`
- `package.json`
- `preview/README.md`
- `tests/browser_finish.py`
- `tests/browser_layout.py`
- `tests/browser_smoke.py`
- `tests/cli.test.cjs`
- `tests/schema_parity.py`
- `themes/brand/example-studio.json`
- `themes/world/plain.json`
- `tools/build.mjs`
- `tools/sphere.mjs`
- `tools/verify-release.mjs`
- `verification/TEST_REPORT.md`

## 削除

過去版の集計レポートを、今回の言語別レポートに置き換えました。移動元は上の移動表で扱い、ここには重複計上していません。

- `verification/browser-finish-results.json`
- `verification/browser-layout-results.json`
- `verification/browser-results.json`

## 保持したもの

`docs/paper/` の全ファイル、README 冒頭の図の参照先、`preview/v0.5.0/` の全画像、両 LICENSE、共通 core/layout/camera/CSS、両スキーマは元のバイトのままです。状態の形 21 個・配置の規則・Starter の形・読むだけの操作は保持し、外部依存は追加していません。

`verification/BASELINE_SHA256SUMS.txt` で保護対象のハッシュを確認できます。`FILE_LIST.md` は今回の全ファイル、`SHA256SUMS.txt` はそのうちチェックサムファイル自身以外のハッシュです。
