#!/usr/bin/env node
/** Build a portable, offline-capable HTML without npm dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const list=dir=>fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.json')).sort().map(f=>json(dir+'/'+f));
const worlds=list('themes/world');worlds.sort((a,b)=>a.id==='plain'?-1:b.id==='plain'?1:0);
const bundle={sample:json('examples/essay.json'),worlds,brands:list('themes/brand'),mapSchema:json('spec/starter-map.schema.json'),themeSchema:json('spec/theme.schema.json')};
let html=read('app/template.html');
for(const [key,value] of Object.entries({CSS:read('app/styles.css'),STATES:read('app/states.js'),CORE:read('app/core.js'),LAYOUT:read('app/layout.js'),CAMERA:read('app/camera.js'),APP:read('app/main.js'),BUNDLE:JSON.stringify(bundle).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')}))html=html.replace('/*__'+key+'__*/',()=>value);
if(/\/\*__(CSS|STATES|CORE|LAYOUT|CAMERA|APP|BUNDLE)__\*\//.test(html))throw new Error('Unresolved build placeholder');
if(process.argv.includes('--check')) {
  if(read('index.html')!==html)throw new Error('index.html differs from current source. Run node tools/build.mjs.');
  console.log('Build check: index.html is byte-identical to current source output.');
} else {
  fs.writeFileSync(path.join(root,'index.html'),html);
  console.log('Built index.html ('+Buffer.byteLength(html)+' bytes), no external runtime dependencies.');
}
