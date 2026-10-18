/* Starter-owned vocabulary and fixed monochrome state geometry. No source-schema parsing. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SphereStates=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // This is the sole assignment of state shapes. Themes may not override it.
  const definitions={
    not_started:{d:'M0 -13A13 13 0 1 1 0 13A13 13 0 1 1 0 -13'},
    in_progress:{d:'M0 -14A14 14 0 1 1 0 14A14 14 0 1 1 0 -14M-6 0H7M2 -6L8 0 2 6'},
    frozen:{d:'M0 -15V15M-13 -7L13 7M-13 7L13 -7M-4 -11L0 -7 4 -11M-4 11L0 7 4 11',gateD:'M0 -15L15 0 0 15 -15 0ZM-7 0H7M0 -7V7'},
    carried_over:{d:'M-14 -7H3V-13L14 -2 3 9V3H-9M-13 14H13'},
    spanning:{d:'M-7 -10A10 10 0 1 1 -7 10A10 10 0 1 1 -7 -10M7 -10A10 10 0 1 1 7 10A10 10 0 1 1 7 -10'},
    returned:{d:'M10 -13C-4 -13 -8 -5 -8 2H-14L-5 11 4 2H-2C-2 -1 0 -5 10 -5M-12 15H12'},
    handed_over:{d:'M-14 -14V14M-8 0H12M5 -7L12 0 5 7M15 -14V14'},
    record_only:{d:'M-12 -15H5L12 -8V15H-12ZM5 -15V-8H12M-6 -3H6M-6 3H6M-6 9H2'},
    off_mainline:{d:'M-9 15V-15M-9 2L12 -12M3 -12H12V-3'},
    cancelled:{d:'M-7 -15H7L15 -7V7L7 15H-7L-15 7V-7ZM-7 -7L7 7M7 -7L-7 7',gateD:'M0 -15L15 0 0 15 -15 0ZM-5 -5L5 5M5 -5L-5 5'},
    discarded:{d:'M-13 -9H13M-5 -9V-15H5V-9M-10 -5L-8 15H8L10 -5M-3 -2V10M3 -2V10'},
    out_of_scope:{d:'M0 -14A14 14 0 1 1 0 14A14 14 0 1 1 0 -14M-10 10L10 -10'},
    scheduled:{d:'M-13 -11H13V14H-13ZM-13 -4H13M-7 -16V-7M7 -16V-7M-7 2H-3M4 2H8M-7 7H-3M4 7H8'},
    none:{d:'M-11 0H11'},
    unknown:{d:'M-8 -8C-8 -18 10 -19 10 -7C10 0 0 0 0 6M0 13V14'},
    pending:{d:'M-12 -15H12M-12 15H12M-9 -15C-9 -3 9 3 9 15M9 -15C9 -3 -9 3 -9 15'},
    passed:{d:'M-14 0L-4 11 15 -12'},
    passed_with_defects:{d:'M-15 -6L-8 2 2 -10M10 -10V5M10 11V12'},
    sent_back:{d:'M13 12V1C13 -7 7 -11 0 -11H-11M-4 -18L-12 -11 -4 -4'}
  };
  const WORK_STATES=['not_started','in_progress','frozen','carried_over','spanning','returned','handed_over','record_only','off_mainline','cancelled','discarded','out_of_scope','scheduled','none','unknown'];
  const GATE_STATES=['pending','passed','passed_with_defects','sent_back','frozen','cancelled'];
  const CLOSED_WORK=['returned','handed_over','record_only','off_mainline','cancelled','discarded','out_of_scope'];
  const CLOSED_GATE=['passed','passed_with_defects'];
  const KINDS=['project','phase','group','management','task','gate','issue','decision','actor'];
  for(const [key,v] of Object.entries(definitions)){if(v.gateD)v.gate=Object.freeze({d:v.gateD});Object.freeze(v);}
  const geometry=(state,kind='work')=>kind==='gate'&&definitions[state]?.gate?definitions[state].gate:definitions[state];
  const closed=n=>(n.kind==='gate'?CLOSED_GATE:CLOSED_WORK).includes(n.state);
  return Object.freeze({definitions:Object.freeze(definitions),WORK_STATES:Object.freeze(WORK_STATES),GATE_STATES:Object.freeze(GATE_STATES),CLOSED_WORK:Object.freeze(CLOSED_WORK),CLOSED_GATE:Object.freeze(CLOSED_GATE),KINDS:Object.freeze(KINDS),geometry,closed});
});
