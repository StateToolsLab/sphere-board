# 計画の原文 → Starter map.json

このプロンプトを計画の原文と一緒にAIへ渡します。台帳の投影を手書きで作り直すものではありません。

---

## 依頼

原文の計画を、下記のsphere-starter/0.3形式のJSONへしてください。作る前に意味の不明点・欠けた判断があれば、質問を並べて止まってください。人・AI・状態・関係・成果・締切・承認を推測で足さないでください。

上位 `source` を持つ map は読み取り専用の投影として扱い、直接更新しません。元の台帳側で更新する必要があると報告してください。

## 形式と状態

上位profileはsphere-starter/0.3。上位specは書きません。直接管理mapにsourceを勝手に足して証跡を省略しません。revision=0、updatedAt=null、updatedBy=null、lastChange=""から始めます。lanes / problems / regions / edges / currentsが空なら空配列を明示します。

初めての作業記録ではnot_started（まだ始めていない）/ in_progress（作業中）/ returned（成果が本線へ戻った）/ cancelled（途中で打ち切った）の4語を使います。その他の状態は下記schemaとspec/starter-map.mdの定義を確認し、根拠のある場合だけ使います。一般的な「完了」を自動的にreturnedへ置き換えません。

returned / handed_overにはevidence、ゲートpassed / passed_with_defectsにはhumanのapproval、cancelledにはreasonを記録します。記録を作れなければ事実を確かめてください。decisionまたはrequiresHumanApproval=trueの回収・引き継ぎにも人の承認が必要です。承認記録や時刻を合成しません。

## 構造

kindはproject / phase / group / management / task / gate / issue / decision / actor。actorはStarter専用の表示ノードでunknown / ready=nullです。ownerはactorsのid、いなければnull。actor.kindは原文が示すhuman / ai / system、判断できなければunknownです。レーンの順が色の順であり、色に状態の意味を与えません。

IDは自由な文字列です。1〜80文字・制御文字なし・予約名なし・同一配列内で一意。空白や日本語が使え、階層番地は必須ではありません。派生はderived、予定はplannedで示し、IDから推定しません。

parentは親→子、dependencyは前提→後続、originは発生元→派生、returnは**派生→回収先**、blocksは妨げる側→対象。差し戻しはgate.state=sent_backで、returnではありません。回収先の線と回収済みの実績を区別します。blocked状態は使用しません。根拠のない関係をproposedとして大量に追加することもしません。proposedは確認待ちと明記された関係だけに使います。

currentsは複数です。他者の現在地や判定待ちのゲートを勝手に消しません。readyはstateと別で、根拠あるtrueにはreadyReasonが必要です。前提が閉じていてactiveなblocksがないことを確認します。未知はnull。sourceなしStarterでは「依存が無い」だけで着手の許可を作りません。

## 座標

既定は自動配置なので x / y を書きません。順序には任意の整数 order を使い、未指定なら配列の順を使います。gateKind は explicit / recheck / event、未指定は explicit。手動座標を使う場合だけ layout.mode="manual" と全ノードの x / y を指定します。表示座標は原データへ書き戻しません。日付・優先順位を位置から推測せず、他の計画の識別子から線を追加しません。

## 自己確認

先のない参照・自己関係・確定activeなparent/dependency循環を作らない。origin/returnの輪は正常です。JSON以外をコードに埋め込まない。架空のサンプルを作る依頼ならmeta.isDemo=trueと説明で架空を明記し、実績として報告しない。

実行環境があれば `node tools/sphere.mjs validate <候補.json>` を実行し、実行していなければ未実行と書いてください。成果・人の判断・形式検証の成功を区別します。

## 最小形

```json
{"profile":"sphere-starter/0.3","meta":{"title":"My project","description":"計画を入力してから使用してください。","isDemo":false},"revision":0,"updatedAt":null,"updatedBy":null,"actors":[{"id":"agent","label":"Project AI（役割ID）","kind":"ai"}],"currents":[],"nodes":[],"edges":[],"regions":[],"lastChange":"","lanes":[],"problems":[]}
```

## 完全な入力schema

このschemaだけでは参照整合・循環・証跡・承認・Readyの意味検証を完結しません。付属validatorも使ってください。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Sphere Board Starter map — sphere-starter/0.3",
  "description": "Standalone Sphere Board Starter map format. source, when present, marks a read-only projection. Semantic rules are implemented by app/core.js.",
  "type": "object",
  "properties": {
    "profile": {
      "const": "sphere-starter/0.3"
    },
    "meta": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 240
        },
        "description": {
          "type": "string",
          "maxLength": 5000
        },
        "isDemo": {
          "type": "boolean"
        },
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 80,
          "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
          "not": {
            "enum": [
              "__proto__",
              "prototype",
              "constructor"
            ]
          }
        }
      },
      "required": [
        "title"
      ],
      "additionalProperties": false
    },
    "revision": {
      "type": "integer",
      "minimum": 0
    },
    "updatedAt": {
      "anyOf": [
        {
          "type": "string",
          "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z$"
        },
        {
          "type": "null"
        }
      ]
    },
    "updatedBy": {
      "anyOf": [
        {
          "type": "string",
          "minLength": 1,
          "maxLength": 80,
          "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
          "not": {
            "enum": [
              "__proto__",
              "prototype",
              "constructor"
            ]
          }
        },
        {
          "type": "null"
        }
      ]
    },
    "lastChange": {
      "type": "string",
      "maxLength": 3000
    },
    "actors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 80,
            "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
            "not": {
              "enum": [
                "__proto__",
                "prototype",
                "constructor"
              ]
            }
          },
          "label": {
            "type": "string",
            "maxLength": 160
          },
          "kind": {
            "enum": [
              "human",
              "ai",
              "system",
              "unknown"
            ]
          }
        },
        "required": [
          "id",
          "label",
          "kind"
        ],
        "additionalProperties": false
      },
      "maxItems": 100
    },
    "currents": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 80,
        "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
        "not": {
          "enum": [
            "__proto__",
            "prototype",
            "constructor"
          ]
        }
      },
      "uniqueItems": true,
      "maxItems": 500
    },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 80,
            "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
            "not": {
              "enum": [
                "__proto__",
                "prototype",
                "constructor"
              ]
            }
          },
          "kind": {
            "enum": [
              "project",
              "phase",
              "group",
              "management",
              "task",
              "gate",
              "issue",
              "decision",
              "actor"
            ]
          },
          "label": {
            "type": "string",
            "minLength": 1,
            "maxLength": 240
          },
          "description": {
            "type": "string",
            "maxLength": 8000
          },
          "x": {
            "type": "number",
            "minimum": -100000,
            "maximum": 100000
          },
          "y": {
            "type": "number",
            "minimum": -100000,
            "maximum": 100000
          },
          "owner": {
            "anyOf": [
              {
                "type": "string",
                "minLength": 1,
                "maxLength": 80,
                "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
                "not": {
                  "enum": [
                    "__proto__",
                    "prototype",
                    "constructor"
                  ]
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "state": {
            "enum": [
              "not_started",
              "in_progress",
              "frozen",
              "carried_over",
              "spanning",
              "returned",
              "handed_over",
              "record_only",
              "off_mainline",
              "cancelled",
              "discarded",
              "out_of_scope",
              "scheduled",
              "none",
              "unknown",
              "pending",
              "passed",
              "passed_with_defects",
              "sent_back"
            ]
          },
          "ready": {
            "type": [
              "boolean",
              "null"
            ]
          },
          "readyReason": {
            "type": "string",
            "maxLength": 2000
          },
          "acceptance": {
            "type": "array",
            "items": {
              "type": "string",
              "maxLength": 1500
            },
            "maxItems": 20
          },
          "evidence": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "kind": {
                  "enum": [
                    "user",
                    "artifact",
                    "test",
                    "review"
                  ]
                },
                "reference": {
                  "type": "string",
                  "maxLength": 2000
                },
                "summary": {
                  "type": "string",
                  "maxLength": 2000
                }
              },
              "required": [
                "kind",
                "reference",
                "summary"
              ],
              "additionalProperties": false
            },
            "maxItems": 30
          },
          "requiresHumanApproval": {
            "type": "boolean"
          },
          "approval": {
            "type": "object",
            "properties": {
              "actorId": {
                "type": "string",
                "minLength": 1,
                "maxLength": 80,
                "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
                "not": {
                  "enum": [
                    "__proto__",
                    "prototype",
                    "constructor"
                  ]
                }
              },
              "evidence": {
                "type": "string",
                "maxLength": 2000
              },
              "recordedAt": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z$"
              }
            },
            "required": [
              "actorId",
              "evidence",
              "recordedAt"
            ],
            "additionalProperties": false
          },
          "lane": {
            "type": "string",
            "maxLength": 160
          },
          "derived": {
            "type": "boolean"
          },
          "planned": {
            "type": "boolean"
          },
          "source": {
            "type": "object",
            "additionalProperties": true,
            "description": "Opaque original fields, displayed only as data."
          },
          "reason": {
            "type": "string",
            "maxLength": 3000,
            "description": "Reason for cancellation; record intermediate outputs in description/evidence."
          },
          "order": {
            "type": "integer",
            "description": "Explicit order values sort first numerically; absent orders follow in nodes[] order. Ties use nodes[] index, kind, id."
          },
          "gateKind": {
            "enum": [
              "explicit",
              "recheck",
              "event"
            ]
          }
        },
        "required": [
          "id",
          "kind",
          "label",
          "owner",
          "state",
          "ready"
        ],
        "additionalProperties": false,
        "allOf": [
          {
            "if": {
              "required": [
                "gateKind"
              ]
            },
            "then": {
              "properties": {
                "kind": {
                  "const": "gate"
                }
              }
            }
          }
        ]
      },
      "maxItems": 500
    },
    "edges": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 80,
            "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
            "not": {
              "enum": [
                "__proto__",
                "prototype",
                "constructor"
              ]
            }
          },
          "from": {
            "type": "string",
            "minLength": 1,
            "maxLength": 80,
            "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
            "not": {
              "enum": [
                "__proto__",
                "prototype",
                "constructor"
              ]
            }
          },
          "to": {
            "type": "string",
            "minLength": 1,
            "maxLength": 80,
            "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
            "not": {
              "enum": [
                "__proto__",
                "prototype",
                "constructor"
              ]
            }
          },
          "kind": {
            "enum": [
              "parent",
              "dependency",
              "origin",
              "return",
              "blocks"
            ]
          },
          "active": {
            "type": "boolean"
          },
          "certainty": {
            "enum": [
              "explicit",
              "proposed"
            ]
          },
          "note": {
            "type": "string",
            "maxLength": 2000
          }
        },
        "required": [
          "id",
          "from",
          "to",
          "kind",
          "active",
          "certainty"
        ],
        "additionalProperties": false
      },
      "maxItems": 1500
    },
    "regions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1,
            "maxLength": 80,
            "pattern": "^[^\\u0000-\\u001f\\u007f-\\u009f]+$",
            "not": {
              "enum": [
                "__proto__",
                "prototype",
                "constructor"
              ]
            }
          },
          "kind": {
            "const": "planned"
          },
          "label": {
            "type": "string",
            "maxLength": 240
          },
          "x": {
            "type": "number",
            "minimum": -100000,
            "maximum": 100000
          },
          "y": {
            "type": "number",
            "minimum": -100000,
            "maximum": 100000
          },
          "width": {
            "type": "number",
            "exclusiveMinimum": 0,
            "maximum": 200000
          },
          "height": {
            "type": "number",
            "exclusiveMinimum": 0,
            "maximum": 200000
          }
        },
        "required": [
          "id",
          "kind",
          "label",
          "x",
          "y",
          "width",
          "height"
        ],
        "additionalProperties": false
      },
      "maxItems": 100
    },
    "extensions": {
      "type": "object",
      "propertyNames": {
        "pattern": "^[a-z][a-z0-9-]*:[A-Za-z0-9._-]+$"
      },
      "additionalProperties": true
    },
    "lanes": {
      "type": "array",
      "maxItems": 100,
      "uniqueItems": true,
      "items": {
        "type": "string",
        "maxLength": 160
      }
    },
    "problems": {
      "type": "array",
      "maxItems": 10000,
      "items": {
        "type": "string",
        "maxLength": 12000
      }
    },
    "source": {
      "type": "object",
      "description": "Opaque provenance; its presence makes the entire map read-only. The renderer never interprets these fields.",
      "additionalProperties": true
    },
    "layout": {
      "type": "object",
      "properties": {
        "mode": {
          "enum": [
            "auto",
            "manual"
          ]
        }
      },
      "additionalProperties": false
    }
  },
  "required": [
    "profile",
    "meta",
    "revision",
    "updatedAt",
    "updatedBy",
    "actors",
    "currents",
    "nodes",
    "edges",
    "regions",
    "lastChange",
    "lanes",
    "problems"
  ],
  "additionalProperties": false,
  "$id": "urn:sphere:starter-map:0.3"
}
```
