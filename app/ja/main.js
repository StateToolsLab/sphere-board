/* Static ja presentation source, inserted into the shared controller at build time.
   No language selector or translation lookup. These functions format text only. */
function stateName(key) { return SphereStateText[key]?.name || key; }
function nodeDescription(label, kind, state, current, readiness, owner) { return `${label}。${kind}。${state}。${current}${readiness}。担当 ${owner}`; }
function currentPositionNumber(index, count) { return `現在地 ${index}/${count}`; }
function currentPositionUnset(count) { return `現在地 —/${count}`; }
function focusedCurrent(index, count, label) { return `現在地 ${index}/${count}：${label}`; }
function currentPositionsExplanation(count) { return `現在地は ${count} か所。選択やReadyとは独立した、共有の作業地点です。`; }
function displayCoordinates(mode, x, y) { return `${mode} / (${x}, ${y}) · 表示用`; }
function problemCount(count, suffix) { return `確認事項（${count}件）${suffix}`; }
function textParentChild() { return "親子"; }
function textPrerequisiteSuccessor() { return "前提 → 後続"; }
function textOriginDerivedWork() { return "発生元 → 派生"; }
function textReturnDestination() { return "回収先"; }
function textBlocker() { return "妨げ"; }
function textExplicit() { return "明示"; }
function textRecheck() { return "再判定"; }
function textEvent() { return "イベント"; }
function textBuiltInDemoDisconnected() { return "内蔵デモ · 未接続"; }
function textReadyNo() { return "Ready: いいえ"; }
function textReadyUnknown() { return "Ready: 未確認"; }
function textUnassigned() { return "担当未定"; }
function textConcentricStageBands() { return "工程の同心帯"; }
function textInactive() { return " · 非アクティブ"; }
function textProposed() { return " · 仮説"; }
function textDerived() { return "派生 / "; }
function textAddAPlanToMapJsonToDisplayItHere() { return "map.json に計画を追加すると、ここに表示されます。"; }
function textOverviewHelp() { return "全体 · 同心帯＝工程 / 点線＝予定。印は縮小しても残ります。"; }
function textReadabilityNote() { return "（読みやすさを優先し、近い取れる珠は表示範囲外の場合があります）"; }
function textCurrentPosition() { return "現在地："; }
function textNearbyReadyWork() { return "近い取れる珠："; }
function textNoCurrentOrReady() { return "現在地・Readyはありません。全体を表示しています。"; }
function textBoardRenderingStopped() { return "盤の描画を停止しました"; }
function textFixSourceAndReload() { return "上部の問題を元データで修正し、読み直してください。以前の盤を新しい投影として表示しません。"; }
function textWorkInProgress() { return "いま、進めていること。"; }
function textProjectionWorkflow() { return "これは台帳の読み取り専用の投影です。変更は元の台帳で行い、投影を作り直します。"; }
function textPlanWorkflow() { return "WBSや文章から計画を作り、許可された作業結果を別候補から更新。スキンは設定から差し替えられます。"; }
function textReadOnlyReminder() { return "この画面は表示専用です。状態の更新や人間の承認を、見た目の操作だけで書き換えません。"; }
function textCurrentChip() { return "◎ 現在地"; }
function textOwner() { return "担当"; }
function textLane() { return "レーン"; }
function textUnspecified() { return "未指定"; }
function textCoordinates() { return "座標"; }
function textDerivedChip() { return "派生"; }
function textPlanned() { return "予定"; }
function textReasonForCancellation() { return "中止の理由"; }
function textSourceLedgerFields() { return "元の台帳の欄"; }
function textSourceFieldsHelp() { return "以下は元データをそのまま表示する欄です。盤はこの内容から状態や関係を判断しません。"; }
function textShowSource() { return "source を表示（注記・元の状態・参照を含む）"; }
function textReasonForReadiness() { return "READY の根拠"; }
function textAcceptanceCriteria() { return "完了条件"; }
function textRecordedEvidence() { return "記録された証拠（内容の真偽は別途確認）"; }
function textHumanApprovalRecord() { return "人間の承認記録"; }
function textRelationsAndDirection() { return "関係と向き"; }
function textParent() { return "親"; }
function textChild() { return "子"; }
function textPrerequisite() { return "前提"; }
function textSuccessor() { return "後続"; }
function textOrigin() { return "発生元"; }
function textDerivedWork() { return "派生先"; }
function textReturnSource() { return "回収元"; }
function textInactiveSuffix() { return "（非アクティブ）"; }
function textProposedSuffix() { return "（仮説）"; }
function textUnknown() { return "未確認"; }
function textBlocks() { return "妨げる先"; }
function textBlockedBy() { return "妨げられる元"; }
function textSeparator() { return "、"; }
function textNone() { return "なし"; }
function textListCurrentPrefix() { return "◎ 現在地 / "; }
function textNoMatchingNodes() { return "一致するノードはありません。"; }
function textLayout() { return "配置: "; }
function textWorkStates() { return "状態"; }
function textGateResults() { return "ゲートの結果"; }
function textEmptyLane() { return "空のレーン"; }
function textLoadingStopped() { return "読み込みを停止しました"; }
function textDefaultDescription() { return "計画の構造を、好きなスキンで。"; }
function textProjectionReadOnly() { return "投影 · 読み取り専用"; }
function textRenderingStopped() { return "描画停止"; }
function textProjectionRestrictions() { return "投影は読み取り専用です。snapshot・apply・画面のmap書き出しは使えません。元の台帳で更新し、投影を作り直してください。"; }
function textProjectionExportDisabled() { return "投影の書き出しは無効です。元の台帳で更新してください。"; }
function textAutomaticLayoutHelp() { return "構造と順番の自動配置 · ドラッグ／ピンチで移動"; }
function textManualCoordinatesReadOnly() { return "手動座標 · 読み取り専用"; }
function textCurrentPositions() { return "現在地 "; }
function textReadyWork() { return "取れる珠 "; }
function textCurrentPosition0() { return "現在地 —/0"; }
function textPlannedSuffix() { return " · 予定"; }
function textInputNeedsReview() { return "入力の確認が必要です。描画を停止しました。"; }
function textUnsupportedMap() { return "この形は読めません。sphere-starter/0.3 の map.json を選んでください。"; }
function textCannotLoadTheMapBoardRenderingStopped() { return "mapを読み込めません。盤の描画を停止しました。\n"; }
function textIssuesToReview() { return "確認事項：\n"; }
function textDirectFileHelp() { return "ローカルファイルを直接開いています。「map.jsonを開く」で読み込むか、付属のserveコマンドを使ってください。"; }
function textMapJsonResponseHttp() { return "map.jsonの応答: HTTP "; }
function textConnectedToALocalSameSiteMap() { return "ローカル / 同一サイトのmapに接続"; }
function textReloadFailedBoardRenderingStopped() { return "再読込できません。盤の描画を停止しました。"; }
function textReloadFailedShowingTheLastValidMap() { return "再読込できません。前回の有効なmapを表示しています。"; }
function textCannotLoadTheTheme() { return "themeを読み込めません。\n"; }
function textReservedThemeId() { return "内蔵テーマと同じidです。自作テーマには別のidを指定してください。"; }
function textLoaded() { return "読み込み済み: "; }
function textThisSessionOnly() { return "（このセッションのみ）"; }
function textThemeLoaded() { return "テーマを読み込みました。mapの意味構造は変更していません。"; }
function textTheFileIsTooLarge() { return "ファイルが大きすぎます。"; }
function textManuallyOpenedMapReadOnly() { return "手動で開いたmap · 読み取り専用"; }
function textUpdateProjectionSource() { return "投影は読み取り専用です。元の台帳で更新してください。"; }
function textCouldNotStart() { return "起動できませんでした。\n"; }
function currentPositionSentence() { return "現在地。"; }
function renderingStoppedSuffix() { return " · 描画停止"; }
function themeName(theme) { return (theme.id === "example-studio" ? "Example Studio（架空）" : theme.name); }
