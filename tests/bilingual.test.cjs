'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const R=path.resolve(__dirname,'..'),C=require('../app/core.js'),L=require('../app/layout.js'),S=require('../app/states.js');
const read=f=>fs.readFileSync(path.join(R,f),'utf8'),json=f=>JSON.parse(read(f));
const japanese=/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/u;
test('both standalone builds are repeatable and --check detects drift in either output',t=>{
 const dir=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'sphere-build-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const f of ['app','tools/build.mjs','themes','examples','spec'])fs.cpSync(path.join(R,f),path.join(dir,f),{recursive:true});
 const run=flag=>cp.spawnSync(process.execPath,['tools/build.mjs',...(flag?[flag]:[])],{cwd:dir,encoding:'utf8'});
 assert.equal(run().status,0);
 for(const f of ['index.html','ja/index.html'])assert.equal(fs.readFileSync(path.join(dir,f),'utf8'),read(f));
 assert.equal(run().status,0);assert.equal(run('--check').status,0);
 for(const f of ['index.html','ja/index.html']){fs.appendFileSync(path.join(dir,f),'\n');const bad=run('--check');assert.notEqual(bad.status,0);assert.ok(bad.stderr.includes(f));assert.equal(run().status,0);}
});
test('English HTML, presentation sources, themes and examples contain no Japanese characters',()=>{
 for(const f of ['index.html','app/en/main.js','app/en/template.html','app/en/states.js','map.json',...fs.readdirSync(path.join(R,'examples')).filter(f=>f.endsWith('.json')).map(f=>'examples/'+f),...['world/plain','brand/example-studio'].map(f=>'themes/'+f+'.json')])assert.equal(japanese.test(read(f)),false,f);
 assert.match(read('index.html'),/<html lang="en"/);assert.match(read('ja/index.html'),/<html lang="ja"/);
});
test('15 work-state names, 6 gate-result names and their shape descriptions exist in each language',()=>{
 for(const lang of ['en','ja']){const labels=require('../app/'+lang+'/states.js');
  for(const [kind,keys] of [['work',S.WORK_STATES],['gate',S.GATE_STATES]]){assert.equal(keys.length,kind==='work'?15:6);for(const key of keys){assert.ok(labels[key].name,key);assert.ok((kind==='gate'?labels[key].gateShape:null)||labels[key].shape,key);assert.ok(S.geometry(key,kind).d);}}
  for(const name of (lang==='en'?['Explicit','Recheck','Event']:['明示','再判定','イベント']))assert.ok(read('app/'+lang+'/main.js').includes(name));
 }
});
for(const name of ['essay','exhibition','sample-map'])test(name+': translated samples retain structure and exact node geometry',()=>{
 const en=json('examples/'+name+'.json'),ja=json('examples/ja/'+name+'.json');
 assert.ok(C.validateMap(en,json('spec/starter-map.schema.json')).ok);assert.ok(C.validateMap(ja,json('spec/starter-map.schema.json')).ok);
 assert.match(JSON.stringify(en),/fictional/i);assert.match(JSON.stringify(ja),/架空/);
 const textKeys=new Set(['label','description','title','readyReason','acceptance','reason','summary','evidence','note','problems']);
 const normalize=(value,key='',map=en)=>{
  if(key==='lane')return map.lanes.indexOf(value);
  if(key==='lanes')return value.map((_,i)=>i);
  if(key==='source')return '<opaque source data>';
  if(textKeys.has(key))return '<display prose>';
  if(Array.isArray(value))return value.map(v=>normalize(v,'',map));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalize(v,k,map)]));
  return value;
 };
 assert.deepEqual(normalize(en,'',en),normalize(ja,'',ja));
 assert.deepEqual(L.layout(en).nodes,L.layout(ja).nodes);
 assert.deepEqual(L.layout(en).bounds,L.layout(ja).bounds);
});
test('default maps match the correct built-in samples byte for byte',()=>{
 assert.equal(read('map.json'),read('examples/essay.json'));assert.equal(read('ja/map.json'),read('examples/ja/essay.json'));
});
