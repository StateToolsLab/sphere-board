# このプロジェクトのSphere Board

進行情報は `map.json`、共通運用指示は `WORKFLOW.md`。profileはsphere-starter/0.3です。sourceがなければmap自身を直接管理する正本、sourceがあれば元の台帳の読み取り専用投影です。
このフォルダーに置いただけでAIが自動起動するわけではありません。利用するAIのプロジェクト指示にWORKFLOWを読むよう追記してください。

プロジェクトルートから：

```sh
node .sphere/sphere.mjs serve
node .sphere/sphere.mjs validate .sphere/map.json
```

`index.html` を直接開くと内蔵デモが表示されます。自分の計画はmapを手動で開くか、serveを使ってください。
初期mapのactor `agent` はAI作業者の**役割ID**であり、特定製品・特定人物ではありません。
map.json.history/ は更新前のバックアップです。機密情報を含むことがあるため、公開対象に含める前に確認してください。
ローカルツールの操作ログはCLI出力とmapのrevision/lastChangeで確認します。サーバーはread-onlyです。
詳細な更新手順はWORKFLOW.mdが正本です。

投影には snapshot・apply を使いません。元の台帳で更新してください。固定状態定義 `states.js` を同梱しています。return は派生→回収先で、差し戻しは `gate.state=sent_back` です。blocked 状態は使いません。x/y は任意で、ID に番地形式は要求しません。
