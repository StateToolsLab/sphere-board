# Sphere Board Starter map specification — sphere-starter/0.3

## この仕様の位置付け

Starter自身が定義する製品形式です。特定の台帳形式・番地・プロジェクト識別子の書式に依存しません。機械的な型はstarter-map.schema.json、意味の検証はapp/core.js、状態の形と表示名はapp/states.jsが定義します。Sphere Board は、この Starter 形式だけを入力として扱います。

## 15の状態

| state | 日本語表示 | 意味 | 閉じたか |
|---|---|---|---|
| not_started | 未着手 | まだ始めていない。 | 生きている |
| in_progress | 進行中 | 作業中。 | 生きている |
| frozen | 凍結 | 止めているが再開できる。再開条件を記録する。 | 生きている |
| carried_over | 持越し | 次の期で扱う。 | 生きている |
| spanning | 跨り | 次の期でも使っているので閉じない。 | 生きている |
| returned | 回収済 | 成果が親・本線・正本へ戻った。 | 閉じた |
| handed_over | 引き継ぎ済 | 成果と未決を親ではない後継へ渡して閉じた。 | 閉じた |
| record_only | 記録のみ | 検討の記録として閉じた。親へ戻したことは確認できない。 | 閉じた |
| off_mainline | 本線外 | 別の計画へ切り出した。 | 閉じた |
| cancelled | 中止 | 意味のあった作業を途中で打ち切った。理由と途中の成果の所在を記録する。 | 閉じた |
| discarded | 廃棄 | 不要と判断して閉じた。残す成果がない。 | 閉じた |
| out_of_scope | 対象外 | この計画と無関係。 | 閉じた |
| scheduled | 予定 | まだ始めていない予定の工程。groupだけが使用する。 | — |
| none | 状態なし | 状態を持たない。project / phaseだけが使用する。 | — |
| unknown | 不明 | 対応・判断が確定していない。読み込み時は必ず problems に出す。 | — |

## ゲートの6結果

ゲートは以下の6結果、または異常を明示するunknownを使います。ゲートに通常作業のreturned等を割り当てません。

| state | 日本語表示 | 意味 | 閉じた前提か |
|---|---|---|---|
| pending | 未 | まだ判定していない。現在地として目立たせる。 | いいえ |
| passed | 通過 | ゲートを通した。 | はい |
| passed_with_defects | 通過(瑕疵) | 通したが残りがある。 | はい |
| sent_back | 差し戻し | 戻り先でやり直す。returnの関係ではない。 | いいえ |
| frozen | 凍結 | 止めているが再開できる。再開条件を記録する。 | いいえ |
| cancelled | 中止 | 意味のあった作業を途中で打ち切った。理由と途中の成果の所在を記録する。 | いいえ |

ゲートのcancelledは通常作業と異なり、閉じた前提には数えません。どちらもReadyにはできません。英語表示名は符号のアンダースコアを空白に置き換えて作ります。全体で19の異なる符号があり、frozen / cancelledは通常状態とゲート結果で共通です。形は種類ごとに識別でき、ゲートの外枠は固定の菱形です。

## 関係・補助軸

parentは親→子、dependencyは前提→後続、originは発生元→派生、returnは派生→回収先、blocksは妨げる側→妨げられる側。returnは差し戻しでも実績でもなく回収先の関係です。差し戻しはsent_back。回収済みという実績はreturnedです。

ready・currents・derived・planned・active blocksはstateとは別の軸です。blockedという状態はありません。kindはproject / phase / group / management / task / gate / issue / decision / actor。actorはunknown / ready=nullを使います。scheduledはgroup、noneはproject/phaseだけに使います。

## 直接管理mapと投影

sourceがない直接管理mapではreturned / handed_overにevidence、ゲートpassed / passed_with_defectsにhuman actorのapproval、cancelledにreasonを要求します。decisionまたはrequiresHumanApproval=trueの回収・引き継ぎにも人の承認を要求します。ready=trueにはreadyReasonと整合した前提が必要です。

上位sourceが存在すると投影です。書込みツールは拒否し、evidence / approvalを写さず・要求せず、元の台帳で確認します。active blocksとreadyの矛盾はproblemsへ追加して表示し、投影を拒否しません。sourceは不透明な元データで、rendererが状態や関係を導出することはありません。

## 座標・識別子・安全

orderは任意の整数で、未指定はnodes[]の順。gateKindはgateだけの任意欄でexplicit/recheck/event、未指定はexplicit。layout.modeはauto（既定）/manual。x / yは任意で、manualと全座標が揃うときだけ使用する。その他は全体を自動配置にし、部分manualの理由を表示する。IDは1〜80文字で制御文字・予約名を除く自由な文字列です。schemaに番地正規表現はありません。参照先なし・自己関係・確定activeなparent/dependencyの循環は拒否し、origin/returnの輪は許可します。その他の上限・root/node各欄・更新手順はdocs/map-json-guide.mdとWORKFLOWを参照してください。
