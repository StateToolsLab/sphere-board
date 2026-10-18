#!/usr/bin/env node
/** Local workflow utility. No external dependencies; no AI/network calls; no Git writes. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const here=path.dirname(fileURLToPath(import.meta.url));
const portable=fs.existsSync(path.join(here,'core.js'));
const root=portable?here:path.resolve(here,'..');
const C=createRequire(import.meta.url)(portable?path.join(here,'core.js'):path.join(root,'app/core.js'));
const schemaDir=portable?here:path.join(root,'spec');
const read=p=>fs.readFileSync(p,'utf8');
const schemas={map:C.parse(read(path.join(schemaDir,'starter-map.schema.json'))),theme:C.parse(read(path.join(schemaDir,'theme.schema.json')))};
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
function checked(p,type='map') {
  const text=read(p),input=C.parse(text,type==='theme'?128*1024:2*1024*1024);
  const result=type==='theme'?C.validateTheme(input,schemas.theme):C.validateMap(input,schemas.map);
  if(!result.ok){const e=new Error((result.errors||[]).join('\n'));e.problems=result.errors||[];throw e;}
  const value=input;
  return {text,value,result};
}
function assertWritable(value) {
  assert(!C.isProjection(value),'Read-only projection: source is present. Update the source ledger and rebuild the Starter map.');
}
function assert(ok,message){if(!ok)throw new Error(message);}
function defaultMap(){return portable?path.join(here,'map.json'):fs.existsSync(path.resolve('.sphere/map.json'))?path.resolve('.sphere/map.json'):path.resolve('map.json');}
function parseArgs(args) { const positional=[],flags=Object.create(null);for(let i=0;i<args.length;i++){const a=args[i];if(a.startsWith('--')){const key=a.slice(2);assert(!Object.hasOwn(flags,key),'Duplicate flag: '+a);if(['allow-plan-change','help','theme'].includes(key))flags[key]=true;else{assert(args[i+1]&&!args[i+1].startsWith('--'),'Missing value: '+a);flags[key]=args[++i];}}else positional.push(a);}return {positional,flags}; }
function only(flags,names){for(const k of Object.keys(flags))assert(names.includes(k),'Unknown flag: --'+k);}
function help(){console.log(`Sphere Board starter 0.3.0 — local, dependency-free utility

node tools/sphere.mjs init <project-directory>
node tools/sphere.mjs serve [--map map.json] [--port 4173]
  Open / for English or /ja/ for Japanese; both read the selected map.
node tools/sphere.mjs validate [map.json] [--theme]
node tools/sphere.mjs snapshot [map.json] --out base.snapshot.json
node tools/sphere.mjs hash [map.json]
node tools/sphere.mjs diff <before.json> <after.json>
node tools/sphere.mjs apply <candidate.json> --map map.json \\
  --expect-sha256 <snapshot SHA-256> --actor <actor-id> --summary <reason> \\
  [--allow-plan-change]

In an initialized project replace tools/sphere.mjs with .sphere/sphere.mjs.
apply: validate -> exclusive cooperative lock -> exact-byte conflict check -> backup -> atomic rename.
source marks a read-only projection; snapshot/apply are refused.
This is NOT authentication or a distributed transaction. See docs/ai-workflow.md.`);}
function initProject(dir) {
  assert(!portable,'Run init from the starter repository, not a deployed .sphere copy.');
  assert(dir,'Provide a project directory.');
  const project=path.resolve(dir),dest=path.join(project,'.sphere');
  assert(!fs.existsSync(dest),'Refusing to overwrite an existing .sphere directory: '+dest);
  fs.mkdirSync(project,{recursive:true});
  const staging=path.join(project,'.sphere-init-'+crypto.randomUUID());
  fs.mkdirSync(staging);
  try {
    const template=path.join(root,'templates/project/.sphere');
    for(const name of ['map.json','WORKFLOW.md','README.md','package.json'])fs.copyFileSync(path.join(template,name),path.join(staging,name));
    fs.copyFileSync(path.join(root,'index.html'),path.join(staging,'index.html'));
    fs.mkdirSync(path.join(staging,'ja'));
    fs.copyFileSync(path.join(root,'ja/index.html'),path.join(staging,'ja/index.html')); 
    for(const name of ['core.js','states.js'])fs.copyFileSync(path.join(root,'app',name),path.join(staging,name));
    for(const name of ['starter-map.schema.json','theme.schema.json'])fs.copyFileSync(path.join(root,'spec',name),path.join(staging,name));
    fs.copyFileSync(path.join(root,'tools/sphere.mjs'),path.join(staging,'sphere.mjs'));
    fs.renameSync(staging,dest);
    console.log('Created '+dest+'\nNo existing AGENTS.md / CLAUDE.md / GEMINI.md was modified.\nManually append the bridge in templates/bridges/ to your agent instructions.');
  } catch(e){fs.rmSync(staging,{recursive:true,force:true});throw e;}
}
function apply(candidatePath,flags) {
  only(flags,['map','expect-sha256','actor','summary','allow-plan-change']);
  const target=path.resolve(flags.map||defaultMap()),candidateFile=path.resolve(candidatePath||'');
  assert(candidatePath&&candidateFile!==target,'Use a separate candidate file; do not edit the live map in place.');
  assert(/^[a-f0-9]{64}$/i.test(flags['expect-sha256']||''),'--expect-sha256 must be the exact snapshot SHA-256.');
  assert(typeof flags.actor==='string'&&flags.actor,'--actor is required.');
  assert(typeof flags.summary==='string'&&flags.summary.trim()&&flags.summary.length<=3000,'--summary is required (1–3000 characters).');
  assert(!fs.lstatSync(target).isSymbolicLink(),'Refusing a symlink map. Use its real file explicitly.');
  assertWritable(C.parse(read(target)));
  assertWritable(C.parse(read(candidateFile)));
  const lockPath=target+'.lock';let lock=null,tmp=null;
  try {
    try{lock=fs.openSync(lockPath,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw new Error('Map is locked: '+lockPath+'. Never steal the lock while another writer is active.');throw e;}
    fs.writeFileSync(lock,JSON.stringify({pid:process.pid,createdAt:new Date().toISOString(),target}));fs.fsyncSync(lock);
    const before=checked(target),baseHash=hash(before.text);
    assertWritable(before.value);
    assert(baseHash===flags['expect-sha256'].toLowerCase(),'Conflict: live map differs from the snapshot. Re-read and rebase; no write performed.');
    const after=C.parse(read(candidateFile));
    assertWritable(after);
    assert(after.revision===before.value.revision,'Candidate revision must equal the snapshot revision; the tool increments it.');
    for(const key of ['updatedAt','updatedBy','lastChange'])assert(C.stable(after[key])===C.stable(before.value[key]),'Keep snapshot metadata unchanged in the candidate: '+key);
    const preflight=C.validateMap(after,schemas.map);assert(preflight.ok,'Candidate invalid:\n'+preflight.errors.join('\n'));
    const changes=C.diffMaps(before.value,after);assert(changes.length,'No semantic changes to apply.');
    const planning=C.planChanges(before.value,after);
    assert(!planning.length||flags['allow-plan-change'],'Planning changes require --allow-plan-change and prior authorization:\n'+planning.map(c=>c.path).join('\n'));
    assert(after.actors.some(a=>a.id===flags.actor),'--actor must exist in candidate.actors (not an authentication check).');
    after.revision=before.value.revision+1;after.updatedAt=new Date().toISOString();after.updatedBy=flags.actor;after.lastChange=flags.summary.trim();
    const validation=C.validateMap(after,schemas.map);assert(validation.ok,validation.errors.join('\n'));
    const finalText=JSON.stringify(after,null,2)+'\n';
    const history=target+'.history';fs.mkdirSync(history,{recursive:true});
    const backup=path.join(history,'revision-'+String(before.value.revision).padStart(6,'0')+'-'+baseHash.slice(0,16)+'.json');
    try{fs.writeFileSync(backup,before.text,{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST'||read(backup)!==before.text)throw e;}
    tmp=path.join(path.dirname(target),'.'+path.basename(target)+'.'+crypto.randomUUID()+'.tmp');
    const fd=fs.openSync(tmp,'wx',fs.statSync(target).mode&0o777);try{fs.writeFileSync(fd,finalText);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
    assert(hash(read(target))===baseHash,'Conflict immediately before save. No write performed.');
    fs.renameSync(tmp,target);tmp=null;
    console.log(JSON.stringify({applied:true,map:target,revision:after.revision,sha256:hash(finalText),backup,changedPaths:changes.map(c=>c.path),warnings:validation.warnings},null,2));
  } finally {if(tmp)fs.rmSync(tmp,{force:true});if(lock!==null){fs.closeSync(lock);fs.rmSync(lockPath,{force:true});}}
}
function serve(flags) {
  only(flags,['map','port']);
  const mapFile=path.resolve(flags.map||defaultMap()),htmlFile=path.join(root,'index.html'),jaHtmlFile=path.join(root,'ja/index.html');
  checked(mapFile);assert(fs.existsSync(htmlFile),'index.html missing. Run the build command.');
  const port=Number(flags.port||4173);assert(Number.isInteger(port)&&port>=1024&&port<=65535,'Port must be 1024–65535.');
  const hosts=new Set(['127.0.0.1:'+port,'localhost:'+port]),origins=new Set([...hosts].map(x=>'http://'+x));
  const server=http.createServer((req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Cross-Origin-Resource-Policy','same-origin');
    const fail=(code,message)=>{res.writeHead(code,{'Content-Type':'text/plain;charset=utf-8'});res.end(message);};
    if(!hosts.has(req.headers.host))return fail(403,'Host denied');
    if(req.headers.origin&&!origins.has(req.headers.origin))return fail(403,'Origin denied');
    if(!['GET','HEAD'].includes(req.method))return fail(405,'Read-only server');
    let pathname;try{pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;}catch(_){return fail(400,'Bad request');}
    if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const file=pathname==='/'||pathname==='/index.html'?htmlFile:['/ja/','/ja/index.html'].includes(pathname)?jaHtmlFile:['/map.json','/ja/map.json'].includes(pathname)?mapFile:null;
    if(!file)return fail(404,'Not found');
    try {
      let data;
      if(file===mapFile){const q=checked(mapFile);data=Buffer.from(q.text);}
      else data=fs.readFileSync(file);
      res.writeHead(200,{'Content-Type':file!==mapFile?'text/html;charset=utf-8':'application/json;charset=utf-8','Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
    }catch(e){
      if(file===mapFile){const body=JSON.stringify({error:'Map load stopped; do not draw this map.',problems:e.problems||[e.message]});res.writeHead(422,{'Content-Type':'application/json;charset=utf-8','Content-Length':Buffer.byteLength(body)});res.end(req.method==='HEAD'?undefined:body);}
      else fail(503,'File temporarily unavailable');
    }
  });
  server.on('error',e=>{console.error('Server error: '+e.message);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`Sphere Board: http://127.0.0.1:${port}\nRead-only map: ${mapFile}\nJapanese viewer: http://127.0.0.1:${port}/ja/\nOnly the English/Japanese viewers and this map are exposed. Stop with Ctrl+C.`));
}
try {
  const [command,...args]=process.argv.slice(2),{positional:p,flags:f}=parseArgs(args);
  if(!command||command==='help'||f.help)help();
  else if(command==='init'){only(f,[]);assert(p.length===1,'init requires one project directory');initProject(p[0]);}
  else if(command==='serve'){assert(!p.length,'Use --map <path>');serve(f);}
  else if(command==='validate'){only(f,['theme']);assert(p.length<=1,'validate accepts one file');const q=checked(path.resolve(p[0]||defaultMap()),f.theme?'theme':'map');console.log(JSON.stringify({valid:true,warnings:q.result.warnings,problems:q.value.problems||[]},null,2));}
  else if(command==='hash'){only(f,[]);assert(p.length<=1,'hash accepts one file');const q=checked(path.resolve(p[0]||defaultMap()));console.log(hash(q.text));}
  else if(command==='snapshot'){only(f,['out']);assert(p.length<=1&&f.out,'snapshot requires --out <new-file>');const inputPath=path.resolve(p[0]||defaultMap());assertWritable(C.parse(read(inputPath)));const q=checked(inputPath);const out=path.resolve(f.out);fs.writeFileSync(out,q.text,{flag:'wx',mode:0o600});console.log(JSON.stringify({snapshot:out,revision:q.value.revision,sha256:hash(q.text)},null,2));}
  else if(command==='diff'){only(f,[]);assert(p.length===2,'diff requires two files');const a=checked(p[0]),b=checked(p[1]);console.log(JSON.stringify({changes:C.diffMaps(a.value,b.value),planningChanges:C.planChanges(a.value,b.value)},null,2));}
  else if(command==='apply'){assert(p.length===1,'apply requires one candidate file');apply(p[0],f);}
  else throw new Error('Unknown command: '+command);
} catch(e){if(e.problems)console.log(JSON.stringify({ok:false,problems:e.problems},null,2));console.error('Sphere Board: '+e.message);process.exitCode=1;}
