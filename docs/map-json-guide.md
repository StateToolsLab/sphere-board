# map.json の書き方

## Starter 0.3 と入門の4語

`profile: sphere-starter/0.3` がこの製品の形式です。上位 `spec` は使いません。元の台帳の形式や番地を知らなくても書けます。スキーマは `spec/starter-map.schema.json`、語彙の完全な説明は `spec/starter-map.md`、追加の参照・循環・証跡の検証は `app/core.js` にあります。

最初は次の4語で作業を記録します。

| state | 表示 | 意味 |
|---|---|---|
| not_started | 未着手 | まだ始めていない |
| in_progress | 進行中 | 作業中 |
| returned | 回収済 | 成果が親・本線・正本へ戻った。単なる実装終了とは区別する |
| cancelled | 中止 | 意味のあった作業を途中で打ち切った。理由と途中の成果の所在を残す |

returned には evidence、cancelled には reason を記録します。入力にない成果・承認・人物・関係を推測で足してはいけません。高度な状態とゲートは全語彙の定義を確認してから使います。

## root

| フィールド | 意味 |
|---|---|
| profile | sphere-starter/0.3 |
| meta.title / id / description / isDemo | 表題、任意の識別子、説明、架空fixtureの明示。識別子の書式を盤は解釈しない |
| revision | 非負整数。初期0。直接管理mapのapplyが1加算 |
| updatedAt / updatedBy / lastChange | 初期null / null / 空文字。更新時はUTC時刻・actor ID・理由 |
| actors | id・label・kind。kindはhuman / ai / system / unknown。文字列だけから種別を推測しない |
| lanes | レーン文字列の配列。順が色の順。色に状態の意味を割り当てない |
| problems | 確認事項の文字列配列。上部に表示する |
| currents | 現在地node IDの配列。複数可。選択・focus・Readyとは別 |
| nodes / edges / regions | ノード・意味関係・計画領域 |
| source（任意） | 存在すれば読み取り専用の投影。内部は表示するだけの元データ |
| layout（任意） | mode: auto（既定）/ manual。manualは全ノードのx/yが必要 |
| extensions（任意） | 名前空間付き追加データ。盤は意味を推測しない |

`lanes`・`problems`・`lastChange` も必須です。無ければ空配列・空文字で明示します。`source` を付けて証跡の検証を回避する運用は禁止です。投影を生成する経路だけが付けます。

## ノード

必須は `id, kind, label, owner, state, ready`。種類は project / phase / group / management / task / gate / issue / decision / actor の9種です。actorはStarter専用の表示ノードです。ownerはactorsのID、未定ならnullです。

IDは1〜80 Unicode文字、空白・日本語・スラッシュを使用できます。制御文字（U+0000–001F、U+007F–009F）と `__proto__` / `prototype` / `constructor` は禁止します。同じ配列内のIDを重複させません。IDは人の役割・階層・工程を推測する材料ではありません。

`x` / `y` は任意です。既定のautoでは存在しても使いません。layout.mode="manual"と全ノードのx/yが揃うときだけ使用します。自動座標・座席はmapへ書き戻しません。orderは任意の整数、gateKindはgateだけの任意のexplicit/recheck/eventです。詳しくはdocs/auto-layout.mdを参照。位置から日付・工数・優先順位を推定しません。

`lane`、`derived`（派生か）、`planned`（予定か）はStarter自身の任意の欄です。派生はIDや番地でなくderivedで見分けます。`source` は元の欄をまとめる任意のオブジェクトで、詳細欄にそのまま表示します。source内の注記から状態・依存・ownerを作りません。

## Ready・証跡・承認

直接管理mapではready=trueは根拠付きの着手可能、falseは不可、nullは未確認です。readyReasonを記録し、確定した前提が閉じていること、activeなblocksがないことを確認します。作業中でもReady=falseはあり得ます。閉じたノード、凍結等の利用不能な状態はReady=trueにできません。actor表示ノードはunknown / ready=nullです。

returned / handed_over には、少なくとも一つの `evidence: {kind, reference, summary}` が必要です。kindはuser / artifact / test / review。ゲートの passed / passed_with_defects には `approval: {actorId, evidence, recordedAt}` が必要で、actorIdはhuman、時刻は実際のUTC記録です。decisionまたはrequiresHumanApproval=trueの回収・引き継ぎも従来どおり人の承認を必要とします。cancelledにはreasonを必須とし、途中の成果がある場合は所在をdescriptionやevidenceに書きます。

この検証は記録の形と参照しか保証しません。成果の正しさ・承認の真実性・URLの存在を自動で証明しません。

上位 `source` を持つ投影では、証跡と approval は元の台帳側で管理します。投影に snapshot・apply は使いません。

## 関係の方向

| kind | from → to | 意味 |
|---|---|---|
| parent | 親 → 子 | 分解・包含。依存や完了集約ではない |
| dependency | 前提 → 後続 | 後続の前提 |
| origin | 発生元 → 派生 | 作業の由来 |
| return | 派生 → 回収先 | 成果を戻す先。回収済みという実績そのものではない |
| blocks | 妨げる側 → 妨げられる側 | activeなら妨げ印を表示する |

差し戻しはゲート結果sent_backで表します。returnを差し戻しの線にしません。origin/returnが輪を作ることは正常です。dependency/blocksとは別の関係です。id / from / to / kind / active / certaintyは必須。certaintyはexplicitかproposedです。

先のない関係、自己関係、確定activeなparentまたはdependencyの循環は拒否します。判定は関係種ごとに行い、origin/returnを混ぜません。非active・proposedは画面に明記します。解消したblocksは削除せずactive=falseとしてnoteへ根拠を残せます。

## 初回計画と進捗更新

空の雛形は `templates/project/.sphere/map.json`。初回はrevision=0です。直接管理mapでは別candidateからapplyし、運用の正本はWORKFLOWです。state更新の都合でID・owner・座標・関係を作り直しません。

安全上限は2MiB、500nodes、1500edges、100regions、100actors、100lanesです。`source` を含む投影も2MiB以下である必要があります。上限は性能の保証ではありません。
