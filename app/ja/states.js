/* Display names and shape descriptions; geometry is shared in app/states.js. */
(function(root,factory){if(typeof module==="object"&&module.exports)module.exports=factory();else root.SphereStateText=factory();})(globalThis,()=>({
  "not_started": {
    "name": "未着手",
    "shape": "中空の円"
  },
  "in_progress": {
    "name": "進行中",
    "shape": "円と右向きの進行矢印"
  },
  "frozen": {
    "name": "凍結",
    "shape": "六方向の雪印",
    "gateShape": "菱形の中の停止十字"
  },
  "carried_over": {
    "name": "持越し",
    "shape": "折れ矢印と持越し線"
  },
  "spanning": {
    "name": "跨り",
    "shape": "交差する二つの輪"
  },
  "returned": {
    "name": "回収済",
    "shape": "受け皿へ降りる回収矢印"
  },
  "handed_over": {
    "name": "引き継ぎ済",
    "shape": "境界を越える右矢印"
  },
  "record_only": {
    "name": "記録のみ",
    "shape": "折り返し角のある記録紙"
  },
  "off_mainline": {
    "name": "本線外",
    "shape": "本線から外へ分岐する矢印"
  },
  "cancelled": {
    "name": "中止",
    "shape": "八角形と交差線",
    "gateShape": "菱形の中に×"
  },
  "discarded": {
    "name": "廃棄",
    "shape": "ふた付きの廃棄箱"
  },
  "out_of_scope": {
    "name": "対象外",
    "shape": "斜線を引いた円"
  },
  "scheduled": {
    "name": "予定",
    "shape": "日付点のある予定表"
  },
  "none": {
    "name": "状態なし",
    "shape": "短い一本線"
  },
  "unknown": {
    "name": "不明",
    "shape": "疑問符と点"
  },
  "pending": {
    "name": "未",
    "shape": "砂時計"
  },
  "passed": {
    "name": "通過",
    "shape": "大きなチェック"
  },
  "passed_with_defects": {
    "name": "通過(瑕疵)",
    "shape": "チェックと注意の縦印"
  },
  "sent_back": {
    "name": "差し戻し",
    "shape": "左へ折り返すUターン矢印"
  }
}));
