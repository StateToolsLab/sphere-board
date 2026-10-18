# Viewer terminology — v0.6.0

英語版の実際の表示名に合わせた対訳表です。日本語の元データを読み込んだとき、その内容を英訳する機能はありません。

## 状態 15 語

| ID | 日本語 | English |
| --- | --- | --- |
| `not_started` | 未着手 | Not started |
| `in_progress` | 進行中 | In progress |
| `frozen` | 凍結 | Frozen |
| `carried_over` | 持越し | Carried over |
| `spanning` | 跨り | Spanning |
| `returned` | 回収済 | Returned |
| `handed_over` | 引き継ぎ済 | Handed over |
| `record_only` | 記録のみ | Record only |
| `off_mainline` | 本線外 | Off mainline |
| `cancelled` | 中止 | Cancelled |
| `discarded` | 廃棄 | Discarded |
| `out_of_scope` | 対象外 | Out of scope |
| `scheduled` | 予定 | Scheduled |
| `none` | 状態なし | No state |
| `unknown` | 不明 | Unknown |

## ゲートの結果 6 つ

| ID | 日本語 | English |
| --- | --- | --- |
| `pending` | 未 | Pending |
| `passed` | 通過 | Passed |
| `passed_with_defects` | 通過(瑕疵) | Passed with defects |
| `sent_back` | 差し戻し | Sent back |
| `frozen` | 凍結 | Frozen |
| `cancelled` | 中止 | Cancelled |

## ゲートの種類

| ID | 日本語 | English |
| --- | --- | --- |
| `explicit` | 明示 | Explicit |
| `recheck` | 再判定 | Recheck |
| `event` | イベント | Event |

## 選定に判断を要した用語

| 日本語／ID | 採用した英語 | 理由・読み分け |
| --- | --- | --- |
| 現在地 | Current position | 選択中のノードや Ready と独立した共有の作業地点。複数なら Current positions。 |
| 取れる珠 | Ready work | 珠の比喩を直訳せず、着手できる作業であることを示す。画面上の Ready 値と対応。 |
| 回収済／`returned` | Returned | 派生した成果を本線へ戻した状態。ゲートが作業を戻す Sent back と区別する。 |
| 回収先 | Return destination | 成果を戻す先。承認に失敗したという意味を加えない。 |
| 差し戻し／`sent_back` | Sent back | ゲートの結果として再作業に戻す意味。Returned を使わない。 |
| 持越し／`carried_over` | Carried over | 次の工程などへ持ち越す意味を保つ。中止や凍結とは区別。 |
| 跨り／`spanning` | Spanning | 複数の区分にまたがる状態。重複や終了とは解釈しない。 |
| 本線外／`off_mainline` | Off mainline | 元の語の本線との関係を保つ。Discarded や Out of scope と統合しない。 |
| 通過(瑕疵)／`passed_with_defects` | Passed with defects | 問題が残ったまま通過した意味を保ち、単なる Passed にしない。 |
| 未／`pending` | Pending | ゲートの判断がまだ出ていない意味。作業の Not started と区別。 |
| 予定／`scheduled` | Scheduled | 作業状態の名称。領域やフラグの「予定」は Planned。 |
| 前提→後続 | Prerequisite → successor | 依存関係の向きを明示。時系列だけの関係には広げない。 |
| 妨げ | Blocker / Blocks / Blocked by | 対象・方向に応じて名詞と動詞を使い分ける。 |
| 仮説（関係の確実性） | Proposed | `certainty: proposed` に対応する未確定の関係。確定した事実として見せない。 |
| 明示／`explicit` | Explicit | ゲートの種類のラベル。Human approval の有無とは別。 |
| 再判定／`recheck` | Recheck | 再度の確認・判定を行うゲートの種類。 |
| 座標（詳細欄） | Position | 狭い画面でも見切れにくい表示ラベル。値は `auto/manual / (x, y) · display only`。 |

状態の形の説明も各言語の `app/en/states.js` と `app/ja/states.js` に置き、凡例の title に使用します。SVG の幾何は `app/states.js` の一組だけです。
