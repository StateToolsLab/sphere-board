# 自分のスキンを作る

## 最小の入口

`templates/theme.world.json` を複製して、自分だけのid/nameと配色に変更します。

```json
{
  "themeSpec": "theme-spec/0.1",
  "profile": "sphere-theme/0.1",
  "id": "my-world",
  "name": "My World",
  "version": "0.1.0",
  "layer": "world",
  "tokens": {
    "light": {"accent": "#315C45"},
    "dark": {"accent": "#9FD3A5"}
  }
}
```

```sh
node tools/sphere.mjs validate my-theme.json --theme
```

画面の **設定 → theme.jsonを読み込む** で確認します。読み込んだ自作テーマはセッション中のみ保持します。
内蔵IDと同じテーマは拒否します。スキン変更で選択やcurrentは消えません。

## tokenとslot

Worldに許可する色：light/darkのcanvas, surface, text, muted, border, accent, ready, issue。
色形式は厳密な#RRGGBB。透明色、url()、任意CSS関数は受け付けません。
tokens.typography.uiはsans/serif/mono。システムフォントの列を参照し、フォントファイルは配布しません。

| slot | 許可値 |
|---|---|
| node.shell.shape | circle / rounded / cut / plaque / shield / seal / soft / organic |
| board.canvas.pattern | dots / grid / washi / parchment / lattice / hanji / botanical / none |
| node.ornament.variant | none / double-ring / corners / engraving / stitch |

node.shellの変更はTaskの外観だけ。Project・Phase・Group・Management・Gate・Issue・Decision・Actorは固定された種類の外枠と状態の形を持ちます。
ornamentは記号を覆わない既定recipeです。任意の描画コードやSVGの差し込みは未実装で、受け付けません。

## WorldとBrand

合成はCore Plain → World → Brand → 可読性補正 → rendererの固定意味記号。
Brandはlight/darkのaccentとtypographyだけです。Brandからcanvas/surface/slot/stateを変更することはできません。
`templates/theme.brand.json` が雛形です。Example Studioのサンプル配色は仮のものです。
不足tokenはCore Plainへ戻し、未知tokenは無視せずエラーにします。安全に使える範囲を狭くしたstarter実装です。
元のTheme Spec草案より制限が強い部分は `docs/compatibility.md` に記載しています。

## 固定されるもの

座標・ラベル・ノードID・state・ready・複数current・owner・edgeの種類と向き・regionは不変です。
returnは派生→回収先で、差し戻しはゲートのsent_backです。この意味も変更しません。
Currentは二重外周、Readyは独立した三角マーク、Selectionは角括弧、Focusは外側の点線枠。
stateとownerは文字も表示します。状態15語とゲート6結果の形はapp/states.jsのdefinitionsに固定され、スキンから変更できません。docs/state-shapes.mdが一覧です。色はlanesの順にレーンへ使用し、状態の意味に使いません。旧ready/issue配色tokenは互換性と診断のために残します。
TaskをGateとして見せる設定や、dependencyをblocksの端点に変える設定はありません。

## 375pxと明暗を確認する

両モード・375/768/1280px、複数current、ready+current+selection、全関係、長いラベルを確認します。
375pxでは全体を無理に縮小せず、横スクロールと一覧表示を使って読めるようにします。
Theme Labに可読性補正後のtokenが表示されます。指定色が必ずそのまま採用されるわけではありません。
文字・線の数値試験だけでアクセシビリティ適合を認定しません。

## 配布

初期版は単一のJSONをローカルから取り込みます。公開は別の許可・権利確認を要し、今回の配布では実行しません。URLから直接インストールする機能や署名・registry・zipインポートは未実装です。
本体に同梱する場合はthemes/worldまたはthemes/brandへ追加してbuildします。
READMEに対象profile、version、制作者、ライセンス、light/darkのプレビュー、検証した範囲を記載してください。
特定作品のロゴや固有意匠をそのまま使わず、一般化した世界観で作ってください。
