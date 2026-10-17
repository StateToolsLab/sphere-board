'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const S=require('../app/states.js');

test('gate cancelled is a diamond containing an x',()=>{
  assert.equal(S.geometry('cancelled','gate').d,'M0 -15L15 0 0 15 -15 0ZM-5 -5L5 5M5 -5L-5 5');
});

test('all 21 displayed work/gate shapes are distinct',()=>{
  const rows=[...S.WORK_STATES.map(k=>S.geometry(k,'work').d),...S.GATE_STATES.map(k=>S.geometry(k,'gate').d)];
  assert.equal(rows.length,21);
  assert.equal(new Set(rows).size,21);
});

test('the other 20 displayed geometries match the accepted v0.4.0 baseline',()=>{
  const rows=[...S.WORK_STATES.map(k=>['work',k,S.geometry(k,'work').d]),...S.GATE_STATES.map(k=>['gate',k,S.geometry(k,'gate').d])]
    .filter(([kind,key])=>!(kind==='gate'&&key==='cancelled'));
  const digest=crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
  assert.equal(digest,'e977f0f8f2d15bd7b4834979673f2e9b361f6695c2241465775f88ed1ccb26ec');
});
