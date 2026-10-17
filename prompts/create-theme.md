# Create Theme — AIへ渡すスキン作成プロンプト

---

添付する `templates/theme.world.json` と `spec/theme.schema.json`、および私が書く見た目の希望をもとに、
Sphere Board starterの**data-only**なtheme.jsonを一つ作成してください。
テーマ生成時にはmap.jsonを変更しません。任意CSS・HTML・JS・SVG・外部URLを含めません。

`themeSpec: theme-spec/0.1` と `profile: sphere-theme/0.1` を維持し、固有のidとname、SemVer形式のversionを付けます。
Worldなら許可されたlight/dark色、typography、3つのslotsのみ。Brandならaccentとtypographyのみです。
Project/Phase/Group/Management/Gate/Issue/Decision/Actorの固定外枠と、app/states.jsにある全stateの形、ready/current/selection/focus、relationの線種・方向・端点は変更しません。
returnは派生から回収先、差し戻しはゲートのsent_backです。状態の印を変更せず、状態に色の意味を付けません。レーン色は盤が別に扱います。
色は #RRGGBB のみです。欠けたtokenはCore Plainから補完され、可読性不足はrendererが補正することを前提にします。
特定作品・企業のロゴや固有意匠をそのまま複製せず、一般化した世界観にしてください。

JSONのみ出力し、最後に付加説明を入れないでください。
実行環境がある場合は `node tools/sphere.mjs validate <theme-file> --theme` で検証してください。
