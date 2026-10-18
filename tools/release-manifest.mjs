#!/usr/bin/env node
/** Refresh distribution inventory and exact file hashes after validation. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  if(['.git','node_modules','__pycache__'].includes(e.name)||e.name.endsWith('.pyc'))throw new Error('Remove development-only content before packaging: '+e.name);
  const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[path.relative(root,p).replaceAll('\\','/')];
});
const files=[...new Set([...walk(root),'FILE_LIST.md','SHA256SUMS.txt'])].sort();
fs.writeFileSync(path.join(root,'FILE_LIST.md'),'# File list — v0.6.0 distribution\n\n'+files.map(f=>'- `'+f+'`').join('\n')+'\n');
fs.writeFileSync(path.join(root,'SHA256SUMS.txt'),files.filter(f=>f!=='SHA256SUMS.txt').map(f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')+'  '+f).join('\n')+'\n');
console.log(`Manifest: ${files.length} files; ${files.length-1} checksums (excluding SHA256SUMS.txt itself).`);
