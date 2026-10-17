/* Starter-owned vocabulary and fixed monochrome state geometry. No source-schema parsing. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SphereStates=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // This is the sole assignment of state shapes. Themes may not override it.
  const definitions={
    not_started:{ja:'未着手',shape:'中空の円',d:'M0 -13A13 13 0 1 1 0 13A13 13 0 1 1 0 -13'},
    in_progress:{ja:'進行中',shape:'円と右向きの進行矢印',d:'M0 -14A14 14 0 1 1 0 14A14 14 0 1 1 0 -14M-6 0H7M2 -6L8 0 2 6'},
    frozen:{ja:'凍結',shape:'六方向の雪印',d:'M0 -15V15M-13 -7L13 7M-13 7L13 -7M-4 -11L0 -7 4 -11M-4 11L0 7 4 11',gateShape:'菱形の中の停止十字',gateD:'M0 -15L15 0 0 15 -15 0ZM-7 0H7M0 -7V7'},
    carried_over:{ja:'持越し',shape:'折れ矢印と持越し線',d:'M-14 -7H3V-13L14 -2 3 9V3H-9M-13 14H13'},
    spanning:{ja:'跨り',shape:'交差する二つの輪',d:'M-7 -10A10 10 0 1 1 -7 10A10 10 0 1 1 -7 -10M7 -10A10 10 0 1 1 7 10A10 10 0 1 1 7 -10'},
    returned:{ja:'回収済',shape:'受け皿へ降りる回収矢印',d:'M10 -13C-4 -13 -8 -5 -8 2H-14L-5 11 4 2H-2C-2 -1 0 -5 10 -5M-12 15H12'},
    handed_over:{ja:'引き継ぎ済',shape:'境界を越える右矢印',d:'M-14 -14V14M-8 0H12M5 -7L12 0 5 7M15 -14V14'},
    record_only:{ja:'記録のみ',shape:'折り返し角のある記録紙',d:'M-12 -15H5L12 -8V15H-12ZM5 -15V-8H12M-6 -3H6M-6 3H6M-6 9H2'},
    off_mainline:{ja:'本線外',shape:'本線から外へ分岐する矢印',d:'M-9 15V-15M-9 2L12 -12M3 -12H12V-3'},
    cancelled:{ja:'中止',shape:'八角形と交差線',d:'M-7 -15H7L15 -7V7L7 15H-7L-15 7V-7ZM-7 -7L7 7M7 -7L-7 7',gateShape:'菱形の中に×',gateD:'M0 -15L15 0 0 15 -15 0ZM-5 -5L5 5M5 -5L-5 5'},
    discarded:{ja:'廃棄',shape:'ふた付きの廃棄箱',d:'M-13 -9H13M-5 -9V-15H5V-9M-10 -5L-8 15H8L10 -5M-3 -2V10M3 -2V10'},
    out_of_scope:{ja:'対象外',shape:'斜線を引いた円',d:'M0 -14A14 14 0 1 1 0 14A14 14 0 1 1 0 -14M-10 10L10 -10'},
    scheduled:{ja:'予定',shape:'日付点のある予定表',d:'M-13 -11H13V14H-13ZM-13 -4H13M-7 -16V-7M7 -16V-7M-7 2H-3M4 2H8M-7 7H-3M4 7H8'},
    none:{ja:'状態なし',shape:'短い一本線',d:'M-11 0H11'},
    unknown:{ja:'不明',shape:'疑問符と点',d:'M-8 -8C-8 -18 10 -19 10 -7C10 0 0 0 0 6M0 13V14'},
    pending:{ja:'未',shape:'砂時計',d:'M-12 -15H12M-12 15H12M-9 -15C-9 -3 9 3 9 15M9 -15C9 -3 -9 3 -9 15'},
    passed:{ja:'通過',shape:'大きなチェック',d:'M-14 0L-4 11 15 -12'},
    passed_with_defects:{ja:'通過(瑕疵)',shape:'チェックと注意の縦印',d:'M-15 -6L-8 2 2 -10M10 -10V5M10 11V12'},
    sent_back:{ja:'差し戻し',shape:'左へ折り返すUターン矢印',d:'M13 12V1C13 -7 7 -11 0 -11H-11M-4 -18L-12 -11 -4 -4'}
  };
  const WORK_STATES=['not_started','in_progress','frozen','carried_over','spanning','returned','handed_over','record_only','off_mainline','cancelled','discarded','out_of_scope','scheduled','none','unknown'];
  const GATE_STATES=['pending','passed','passed_with_defects','sent_back','frozen','cancelled'];
  const CLOSED_WORK=['returned','handed_over','record_only','off_mainline','cancelled','discarded','out_of_scope'];
  const CLOSED_GATE=['passed','passed_with_defects'];
  const KINDS=['project','phase','group','management','task','gate','issue','decision','actor'];
  for(const [key,v] of Object.entries(definitions)){v.en=key.replaceAll('_',' ');if(v.gateD)v.gate=Object.freeze({ja:v.ja,en:v.en,shape:v.gateShape,d:v.gateD});Object.freeze(v);}
  const geometry=(state,kind='work')=>kind==='gate'&&definitions[state]?.gate?definitions[state].gate:definitions[state];
  const label=(state,language='ja')=>definitions[state]?.[language]||state;
  const closed=n=>(n.kind==='gate'?CLOSED_GATE:CLOSED_WORK).includes(n.state);
  return Object.freeze({definitions:Object.freeze(definitions),WORK_STATES:Object.freeze(WORK_STATES),GATE_STATES:Object.freeze(GATE_STATES),CLOSED_WORK:Object.freeze(CLOSED_WORK),CLOSED_GATE:Object.freeze(CLOSED_GATE),KINDS:Object.freeze(KINDS),geometry,label,closed});
});
