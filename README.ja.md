# Sphere Board

**v0.5.1**

Sphere Board（スフィアボード）は、台帳や計画の `map.json` を、見るだけの **Sphere Board** として描くためのビューアです。Sphere Board から計画事実を編集しません。同梱ビューアは `sphere-starter/0.3` の map を読み、ノード、現在地、Ready、関係、ゲート、レーン、テーマを表示します。

![Sphere Board の三工程の模式図](docs/paper/figure-1.svg)

*[短い論文](docs/paper/)の図 1（CC BY 4.0）。模式図で、画面の写しではありません。*

## どう作ったか

Sphere Board（スフィアボード）は、StateToolsLab が AI の支援を受けて作っています。設計の対話、実装、文書と短い論文の下書きを、AI（ChatGPT〔OpenAI〕と Claude〔Anthropic〕）と分担しました。要件を決め、各段階のゲートで判断し、版ごとに試験・チェックサム・計画の台帳と照らして受け入れるのは人です。AI が提案し、人が確かめて決める、という同じ分担を、map を更新するときのやり方として [docs/ai-workflow.md](docs/ai-workflow.md) にも書いています。

## 動かし方

ビルド済みの `index.html` は単体で動きます。ブラウザーで直接開き、**map.json を開く**から Starter の map を選べます。

ローカルサーバーと自動再読込を使う場合は Node.js 22 以上を使います。

```sh
node tools/sphere.mjs serve --map examples/essay.json --port 8787
```

表示されたローカル URL をブラウザーで開いてください。npm install、CDN、API キー、実行時パッケージ依存は不要です。`package.json` の `private: true` は維持しており、パッケージレジストリへの配信は対象外です。

## map.json の形と書き方

Starter の map は `profile: "sphere-starter/0.3"` を持ち、プロジェクト情報、actors、nodes、relations、regions、currents、lanes と任意の layout を記録します。まず [map.json の手引き](docs/map-json-guide.md)、[Starter 形式の説明](spec/starter-map.md)、[JSON Schema](spec/starter-map.schema.json) を参照してください。

AI に計画から Starter の map を作らせる場合は [prompts/plan-to-map.md](prompts/plan-to-map.md) を使えます。不明な事実を補わず、未確定のまま残すための指示を含みます。

## 見るだけの盤とテーマ

hover、選択、Esc、空所クリック、パン、ズーム、一覧表示、テーマ切替は、読み込んだ map を書き換えません。状態は固定の形、レーンは色で表します。World は Core Plain を同梱し、Brand の Example Studio は架空のサンプルです。

## 論文

Sphere Board（スフィアボード）の考え方を説明する短い論文を [`docs/paper/`](docs/paper/) に置いています（英語版と日本語版、版 1.0、2026-10-17、CC BY 4.0）。

## ビルドと試験

```sh
node tools/build.mjs
node tools/build.mjs --check
node --test tests/*.test.cjs
node tools/verify-release.mjs
```

開発用のブラウザー試験では、利用できる場合に Python・Playwright・Chromium を使います。ビューアの実行時依存ではありません。

v0.5.1 は、Linux 上の Node.js、Python、Playwright、Chromium で確認しました。ビルド済み HTML の実ファイル内容を Chromium に直接投入した描画・操作と、Node テストから実ローカル HTTP サーバーへの通信を確認しています。この検証環境では Chromium から `file://` と localhost URL の両方への遷移が管理ポリシーで遮断されるため、それら URL を通したブラウザーの一続きの遷移は未確認です。別に、StateToolsLab が v0.5.0 をデスクトップの Chrome でローカルサーバー経由で、v0.4.0 の内蔵サンプルを iOS Safari と Android Chrome で開いて確かめています。Firefox、公開ホスティング構成、パッケージレジストリ配信は未確認です。

## ライセンス

- コードおよび `docs/paper/` 以外のリポジトリ内容: [MIT License](LICENSE)。Copyright (c) 2026 StateToolsLab。
- [`docs/paper/`](docs/paper/) の文章: [Creative Commons Attribution 4.0 International (CC BY 4.0)](docs/paper/LICENSE)。Copyright (c) 2026 StateToolsLab。
