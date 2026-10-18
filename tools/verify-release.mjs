#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{
  const f=path.join(d,e.name);
  return e.isDirectory()?walk(f):[f];
});
const section=(body,heading)=>{
  const marker=`## ${heading}`;
  const start=body.indexOf(marker);
  if(start<0)return '';
  const after=body.slice(start+marker.length);
  const next=after.indexOf('\n## ');
  return next<0?after:after.slice(0,next);
};

try{
  const checksumPath=path.join(R,'SHA256SUMS.txt');
  const lines=fs.readFileSync(checksumPath,'utf8').trim().split('\n').filter(Boolean);
  const listed=new Set();
  for(const line of lines){
    const m=/^([a-f0-9]{64})  (.+)$/.exec(line);
    if(!m)throw new Error('Invalid checksum line');
    const rel=m[2];
    const f=path.resolve(R,rel);
    if(!f.startsWith(R+path.sep)||sha(fs.readFileSync(f))!==m[1])throw new Error('Checksum mismatch: '+rel);
    listed.add(rel.replaceAll('\\','/'));
  }
  const actual=walk(R).map(f=>path.relative(R,f).replaceAll('\\','/')).filter(rel=>rel!=='SHA256SUMS.txt').sort();
  for(const rel of actual)if(!listed.has(rel))throw new Error('File missing from SHA256SUMS.txt: '+rel);
  for(const rel of listed)if(!actual.includes(rel))throw new Error('SHA256SUMS.txt lists missing file: '+rel);

  const build=spawnSync(process.execPath,['tools/build.mjs','--check'],{cwd:R,encoding:'utf8'});
  if(build.status!==0)throw new Error(build.stderr||build.stdout);
  process.stdout.write(build.stdout);

  const inventory=fs.readFileSync(path.join(R,'FILE_LIST.md'),'utf8');
  const inventoryPaths=[...inventory.matchAll(/^- `([^`]+)`$/gm)].map(m=>m[1]).sort();
  const allFiles=walk(R).map(f=>path.relative(R,f).replaceAll('\\','/')).sort();
  if(JSON.stringify(inventoryPaths)!==JSON.stringify(allFiles))throw new Error('FILE_LIST.md differs from the distribution files.');
  for(const rel of allFiles)if(rel.includes('__pycache__')||rel.endsWith('.pyc'))throw new Error('Development cache remains: '+rel);
  for(const line of fs.readFileSync(path.join(R,'verification/BASELINE_SHA256SUMS.txt'),'utf8').trim().split('\n')){
    const [,expected,rel]=/^([a-f0-9]{64})  (.+)$/.exec(line)||[];
    if(!rel||sha(fs.readFileSync(path.join(R,rel)))!==expected)throw new Error('Protected baseline file changed: '+rel);
  }
  const english=fs.readFileSync(path.join(R,'index.html'),'utf8');
  const japanese=fs.readFileSync(path.join(R,'ja/index.html'),'utf8');
  if(/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/u.test(english))throw new Error('Japanese text remains in English HTML.');
  if(!english.includes('<html lang="en"')||!japanese.includes('<html lang="ja"'))throw new Error('Viewer language attributes differ.');
  for(const html of [english,japanese])if(!html.includes('<span class="version">0.6.0</span>'))throw new Error('Viewer version mismatch.');
  for(const lang of ['en','ja'])for(const file of ['main.js','states.js','template.html'])if(!fs.existsSync(path.join(R,'app',lang,file)))throw new Error('Missing presentation source.');
  for(const rel of ['docs/viewer-terminology.md','verification/CHANGES.md','verification/TEST_REPORT.md'])if(!fs.existsSync(path.join(R,rel)))throw new Error('Missing release document: '+rel);

  const C=require('../app/core.js');
  const S=require('../app/states.js');
  const schema=require('../spec/starter-map.schema.json');
  for(const f of ['map.json','ja/map.json',...['','ja/'].flatMap(lang=>['essay','exhibition','sample-map'].map(name=>'examples/'+lang+name+'.json'))]){
    const m=JSON.parse(fs.readFileSync(path.join(R,f),'utf8'));
    const r=C.validateMap(m,schema);
    if(!r.ok)throw new Error('Invalid Starter example: '+f+' '+r.errors.join('; '));
  }

  const Layout=require('../app/layout.js');
  for(const lang of ['en','ja']){
    const labels=require('../app/'+lang+'/states.js');
    for(const key of [...S.WORK_STATES,...S.GATE_STATES])if(!labels[key]?.name||!labels[key]?.shape)throw new Error('Missing state label/description: '+lang+'/'+key);
  }
  for(const name of ['essay','exhibition','sample-map']){
    const en=JSON.parse(fs.readFileSync(path.join(R,'examples',name+'.json'),'utf8'));
    const ja=JSON.parse(fs.readFileSync(path.join(R,'examples/ja',name+'.json'),'utf8'));
    if(JSON.stringify(Layout.layout(en).nodes)!==JSON.stringify(Layout.layout(ja).nodes))throw new Error('Bilingual node geometry differs: '+name);
  }

  const geometry=[...S.WORK_STATES.map(k=>S.geometry(k,'work').d),...S.GATE_STATES.map(k=>S.geometry(k,'gate').d)];
  if(new Set(geometry).size!==21)throw new Error('State/gate shapes are not all distinct.');
  if(S.geometry('cancelled','gate').d!=='M0 -15L15 0 0 15 -15 0ZM-5 -5L5 5M5 -5L-5 5')throw new Error('Cancelled gate mark is not diamond + x.');

  if(fs.existsSync(path.join(R,'AGENTS.md')))throw new Error('Development agent instruction file remains at repository root.');
  for(const rel of ['verification/REQUEST.md','verification/INPUTS.json','verification/source-docs','app/'+'con'+'vert.js']){
    if(fs.existsSync(path.join(R,rel)))throw new Error('Internal-only material remains: '+rel);
  }

  const forbidden=['control'+'-map','con'+'vert','con'+'version','変'+'換'];
  const privateMarkers=['/'+'mnt/','/'+'home/','sand'+'box:','file_'+'000'];
  const formerJapaneseLabel='スフィア'+'盤';
  for(const file of walk(R)){
    const rel=path.relative(R,file).replaceAll('\\','/');
    if(rel==='SHA256SUMS.txt'||/\.(png|jpg|jpeg|gif|webp|zip)$/.test(rel))continue;
    const body=fs.readFileSync(file,'utf8');
    if(body.includes(formerJapaneseLabel))throw new Error('Former Japanese product label remains: '+rel);
    for(const word of forbidden){
      if(rel.toLowerCase().includes(word.toLowerCase())||body.toLowerCase().includes(word.toLowerCase()))throw new Error('Public forbidden term remains: '+rel);
    }
    for(const word of privateMarkers)if(body.includes(word))throw new Error('Local/private marker remains: '+rel);
  }

  const pkg=JSON.parse(fs.readFileSync(path.join(R,'package.json'),'utf8'));
  if(pkg.name!=='sphere-board'||pkg.version!=='0.6.0')throw new Error('package.json name/version mismatch');
  if(pkg.license!=='MIT'||pkg.private!==true)throw new Error('package.json license/private mismatch');

  const rootLicense=path.join(R,'LICENSE');
  const expectedRootLicenseSha='7d4634403a07f2ff035cf315a01d55ccb71f612b151a2ff5150525ca94afea53';
  if(!fs.existsSync(rootLicense)||sha(fs.readFileSync(rootLicense))!==expectedRootLicenseSha)throw new Error('Root MIT LICENSE changed.');
  if(fs.existsSync(path.join(R,'LICENSE.pending.md')))throw new Error('License files are not final.');

  const paperLicensePath=path.join(R,'docs/paper/LICENSE');
  if(!fs.existsSync(paperLicensePath))throw new Error('docs/paper/LICENSE is missing.');
  const paperLicense=fs.readFileSync(paperLicensePath,'utf8');
  for(const required of ['CC BY 4.0','StateToolsLab','https://creativecommons.org/licenses/by/4.0/']){
    if(!paperLicense.includes(required))throw new Error('docs/paper/LICENSE missing: '+required);
  }

  for(const [rel,heading] of [['README.md','License'],['README.ja.md','ライセンス']]){
    const body=fs.readFileSync(path.join(R,rel),'utf8');
    const licenseSection=section(body,heading);
    if(!licenseSection)throw new Error(rel+' license section is missing.');
    for(const required of ['MIT','CC BY 4.0','docs/paper/']){
      if(!licenseSection.includes(required))throw new Error(rel+' license section missing: '+required);
    }
  }

  console.log(`Public release checks: ${lines.length} checksums, Sphere Board 0.6.0 naming, Starter-only files, two reproducible builds, bilingual examples, 21 distinct shapes, preserved baseline, MIT + CC BY 4.0 split.`);
}catch(e){
  console.error('Verification failed: '+e.message);
  process.exitCode=1;
}
