#!/usr/bin/env node
/** Compose two standalone viewers from shared behavior and static presentation sources.
 * There is no runtime language choice, translation service, or message dictionary.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const list=dir=>fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.json')).sort().map(f=>json(dir+'/'+f));
const worlds=list('themes/world');worlds.sort((a,b)=>a.id==='plain'?-1:b.id==='plain'?1:0);
const safeJSON=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const outputs=[['en','index.html','examples/essay.json'],['ja','ja/index.html','examples/ja/essay.json']];
const builds=outputs.map(([language,file,sample])=>{
  const bundle={sample:json(sample),worlds,brands:list('themes/brand'),mapSchema:json('spec/starter-map.schema.json'),themeSchema:json('spec/theme.schema.json')};
  const app=read('app/main.js').replace('/*__VIEW__*/',()=>read(`app/${language}/main.js`));
  const parts={CSS:read('app/styles.css'),STATES:read('app/states.js'),STATE_TEXT:read(`app/${language}/states.js`),CORE:read('app/core.js'),LAYOUT:read('app/layout.js'),CAMERA:read('app/camera.js'),APP:app,BUNDLE:safeJSON(bundle)};
  let html=read(`app/${language}/template.html`);
  for(const [key,value] of Object.entries(parts))html=html.replace('/*__'+key+'__*/',()=>value);
  if(/\/\*__[A-Z_]+__\*\//.test(html))throw new Error('Unresolved build placeholder: '+file);
  if(language==='en'&&/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/u.test(html))throw new Error('Japanese characters in English build');
  return {file,bytes:Buffer.from(html)};
});
if(process.argv.includes('--check')){
  for(const {file,bytes} of builds)if(!fs.existsSync(path.join(root,file))||!fs.readFileSync(path.join(root,file)).equals(bytes))throw new Error(file+' differs from current source. Run node tools/build.mjs.');
  console.log('Build check: index.html and ja/index.html are byte-identical to current source output.');
}else{
  for(const {file,bytes} of builds){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),bytes);console.log(`Built ${file} (${bytes.length} bytes), no external runtime dependencies.`);}
}
