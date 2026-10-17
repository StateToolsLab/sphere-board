/* Sphere Board shared, dependency-free core. This is not a general JSON Schema engine. */
(function(root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./states.js') : root.SphereStates);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SphereCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(S) {
  'use strict';
  const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor']);
  const terminal = S.closed;
  const isProjection = map => !!map && typeof map === 'object' && Object.hasOwn(map,'source');
  const clone = x => JSON.parse(JSON.stringify(x));
  function safeObject(x, depth = 0) {
    if (depth > 40) throw new Error('JSON nesting exceeds 40 levels');
    if (x && typeof x === 'object') for (const k of Object.keys(x)) {
      if (FORBIDDEN.has(k)) throw new Error('Forbidden JSON key: ' + k);
      safeObject(x[k], depth + 1);
    }
  }
  function parse(text, maxBytes = 2 * 1024 * 1024) {
    if (new TextEncoder().encode(text).length > maxBytes) throw new Error('JSON file is too large');
    const x = JSON.parse(text); safeObject(x); return x;
  }
  function freeze(x) {
    if (x && typeof x === 'object' && !Object.isFrozen(x)) {
      Object.freeze(x); for (const v of Object.values(x)) freeze(v);
    }
    return x;
  }
  // Implements only keywords used by the bundled schemas. Unsupported external schemas are never loaded.
  function schemaErrors(schema, value, path = '$') {
    const errors = [];
    const err = m => errors.push(path + ': ' + m);
    if (schema === false) { err('not allowed'); return errors; }
    if (schema === true) return errors;
    if ('const' in schema && JSON.stringify(value) !== JSON.stringify(schema.const)) err('expected ' + JSON.stringify(schema.const));
    if (schema.enum && !schema.enum.some(v => JSON.stringify(v) === JSON.stringify(value))) err('unsupported value ' + JSON.stringify(value));
    if (schema.anyOf && !schema.anyOf.some(s => !schemaErrors(s,value,path).length)) err('no permitted type/value matched');
    if (schema.not && !schemaErrors(schema.not,value,path).length) err('not allowed');
    if (schema.allOf) for (const s of schema.allOf) errors.push(...schemaErrors(s,value,path));
    if (schema.if) errors.push(...schemaErrors(!schemaErrors(schema.if,value,path).length ? (schema.then || {}) : (schema.else || {}),value,path));
    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      const matches = type => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) :
        type === 'object' ? !!value && typeof value === 'object' && !Array.isArray(value) :
        type === 'integer' ? Number.isInteger(value) : type === 'number' ? typeof value === 'number' && Number.isFinite(value) : typeof value === type;
      if (!types.some(matches)) { err('expected ' + types.join('|')); return errors; }
    }
    if (typeof value === 'string') {
      const length = [...value].length;
      if (schema.minLength !== undefined && length < schema.minLength) err('string too short');
      if (schema.maxLength !== undefined && length > schema.maxLength) err('string too long');
      if (schema.pattern && !new RegExp(schema.pattern,'u').test(value)) err('invalid format');
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) err('non-finite number');
      if (schema.minimum !== undefined && value < schema.minimum) err('below minimum');
      if (schema.maximum !== undefined && value > schema.maximum) err('above maximum');
      if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) err('must exceed minimum');
    }
    if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) err('too few items');
      if (schema.maxItems !== undefined && value.length > schema.maxItems) err('too many items');
      if (schema.uniqueItems && new Set(value.map(v=>JSON.stringify(v))).size !== value.length) err('duplicate items');
      if (schema.items) value.forEach((v,i)=>errors.push(...schemaErrors(schema.items,v,`${path}[${i}]`)));
    } else if (value && typeof value === 'object') {
      for (const k of schema.required || []) if (!Object.hasOwn(value,k)) err('missing ' + k);
      for (const [k,v] of Object.entries(value)) {
        if (FORBIDDEN.has(k)) { err('forbidden key'); continue; }
        if (schema.propertyNames) errors.push(...schemaErrors(schema.propertyNames,k,path+'.<key>'));
        if (schema.properties && Object.hasOwn(schema.properties,k)) errors.push(...schemaErrors(schema.properties[k],v,path+'.'+k));
        else if (schema.additionalProperties === false) err('unknown field ' + k);
        else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') errors.push(...schemaErrors(schema.additionalProperties,v,path+'.'+k));
      }
    }
    return errors;
  }
  function validateMap(map, schema) {
    const warnings = [], errors = [];
    try { safeObject(map); errors.push(...schemaErrors(schema,map)); }
    catch(e) { errors.push(e.message); }
    if (errors.length) return {ok:false, errors, warnings, problems:[]};
    const projection=isProjection(map), problems=[...map.problems];
    const nodes = new Map(map.nodes.map(n=>[n.id,n])), actors = new Map(map.actors.map(a=>[a.id,a]));
    const warn = message => {if(!warnings.includes(message))warnings.push(message); if(projection&&!problems.includes(message))problems.push(message);};
    for (const [list,name] of [[map.nodes,'node'],[map.actors,'actor'],[map.edges,'edge'],[map.regions,'region']]) {
      const seen = new Set(); for (const row of list) { if(seen.has(row.id)) errors.push(`duplicate ${name} id: ${row.id}`); seen.add(row.id); }
    }
    if (map.updatedAt !== null && !Number.isFinite(Date.parse(map.updatedAt))) errors.push('updatedAt is not a valid date');
    if (map.updatedBy !== null && !actors.has(map.updatedBy)) errors.push('updatedBy actor does not exist');
    if (map.revision > 0 && (!map.updatedAt || !map.updatedBy || !map.lastChange.trim())) errors.push('revisions > 0 require updatedAt, updatedBy and lastChange');
    for (const id of map.currents) if (!nodes.has(id)) errors.push(`current does not exist: ${id}`);
    for (const n of map.nodes) {
      if(n.owner !== null && !actors.has(n.owner)) errors.push(`${n.id}: owner actor does not exist`);
      if(n.kind==='gate' && ![...S.GATE_STATES,'unknown'].includes(n.state)) errors.push(`${n.id}: invalid gate state`);
      if(n.kind!=='gate' && !S.WORK_STATES.includes(n.state)) errors.push(`${n.id}: invalid work state`);
      if(n.state==='scheduled' && n.kind!=='group') errors.push(`${n.id}: scheduled is for group only`);
      if(n.state==='none' && !['project','phase'].includes(n.kind)) errors.push(`${n.id}: none is for project/phase only`);
      if(n.kind==='actor' && (n.state!=='unknown' || n.ready!==null)) errors.push(`${n.id}: actor nodes use state unknown and ready null`);
      if(n.lane && !map.lanes.includes(n.lane)) warn(`${n.id}: lane is not in lanes; displayed without an assigned lane color`);
      if(n.state==='unknown' && n.kind!=='actor' && !problems.some(p=>p.startsWith(n.id+':')&&p.includes('unknown'))) warn(`${n.id}: unknown state; no planning fact is inferred`);
      if(n.ready===true && !projection && !n.readyReason?.trim()) errors.push(`${n.id}: ready=true requires readyReason`);
      if(n.ready===true && (terminal(n) || ['frozen','carried_over','spanning','unknown','none','scheduled','cancelled'].includes(n.state))) errors.push(`${n.id}: closed or unavailable nodes cannot be ready`);
      if(!projection) {
        if(['returned','handed_over'].includes(n.state) && !n.evidence?.some(e=>e.reference.trim()&&e.summary.trim())) errors.push(`${n.id}: returned/handed_over requires recorded evidence`);
        if(n.state==='cancelled' && !n.reason?.trim()) errors.push(`${n.id}: cancelled requires a reason`);
        if((n.kind==='gate'&&['passed','passed_with_defects'].includes(n.state)) || ((n.kind==='decision'||n.requiresHumanApproval)&&['returned','handed_over'].includes(n.state))) {
          const a=n.approval;
          if(!a || actors.get(a.actorId)?.kind!=='human' || !a.evidence.trim() || !Number.isFinite(Date.parse(a.recordedAt))) errors.push(`${n.id}: human approval record is required`);
        }
      } else if(Object.hasOwn(n,'evidence')||Object.hasOwn(n,'approval')) errors.push(`${n.id}: projections must not carry Starter evidence/approval; consult the original ledger`);
      if(terminal(n) && map.currents.includes(n.id)) warn(`${n.id}: closed node is still current; check scope, do not silently delete`);
    }
    for (const e of map.edges) {
      if(!nodes.has(e.from)||!nodes.has(e.to)){errors.push(`${e.id}: dangling endpoint (${e.from} -> ${e.to})`);continue;}
      if(e.from===e.to) errors.push(`${e.id}: self relations are not supported`);
      if(e.kind==='dependency' && e.active && nodes.get(e.to).ready===true && (e.certainty!=='explicit'||!terminal(nodes.get(e.from)))) errors.push(`${e.to}: ready conflicts with prerequisite ${e.from}`);
      if(e.kind==='blocks' && e.active && nodes.get(e.to).ready===true) {
        const message=`${e.to}: ready conflicts with active blocker ${e.from}`;
        if(projection)warn(message);else errors.push(message);
      }
      if(e.kind==='blocks'&&e.active&&terminal(nodes.get(e.from)))warn(`${e.id}: blocker source is closed but edge is still active`);
      if(e.certainty==='proposed')warn(`${e.id}: proposed relation, not a confirmed planning fact`);
    }
    for(const kind of ['dependency','parent']) {
      const adj=new Map(map.nodes.map(n=>[n.id,[]])),incoming=new Map(map.nodes.map(n=>[n.id,0]));
      for(const e of map.edges)if(e.kind===kind&&e.active&&e.certainty==='explicit'&&adj.has(e.from)&&adj.has(e.to)){adj.get(e.from).push(e.to);incoming.set(e.to,incoming.get(e.to)+1);}
      const queue=[...incoming.keys()].filter(id=>incoming.get(id)===0);let visited=0;
      for(let i=0;i<queue.length;i++){const id=queue[i];visited++;for(const next of adj.get(id)){incoming.set(next,incoming.get(next)-1);if(incoming.get(next)===0)queue.push(next);}}
      if(visited!==nodes.size)errors.push(`active ${kind} cycle detected (origin/return loops are allowed)`);
    }
    return {ok:!errors.length,errors,warnings,problems};
  }
  function validateTheme(theme,schema) {
    const errors=[]; try{safeObject(theme);errors.push(...schemaErrors(schema,theme));}catch(e){errors.push(e.message);}
    return {ok:!errors.length,errors,warnings:[]};
  }
  function luminance(hex) {
    const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  }
  function contrast(a,b) { const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
  function resolveTheme(plain,world,brand,mode='light',highContrast=false) {
    const color={...plain.tokens[mode],...(world?.tokens[mode]||{}),...(brand?.tokens[mode]||{})};
    const fixes=[];
    function repair(key,against,min) {
      if(against.every(k=>contrast(color[key],color[k])>=min))return;
      const options=['#000000','#FFFFFF'].map(v=>({v,score:Math.min(...against.map(k=>contrast(v,color[k])))})).sort((a,b)=>b.score-a.score);
      if(options[0].score<min) {
        // Incompatible canvas/surface backgrounds: use a known accessible neutral pair.
        color.canvas=plain.tokens[mode].canvas;color.surface=plain.tokens[mode].surface;
        fixes.push('canvas/surface → Core Plain (contrast fallback)');
      }
      const best=['#000000','#FFFFFF'].sort((a,b)=>Math.min(...against.map(k=>contrast(b,color[k])))-Math.min(...against.map(k=>contrast(a,color[k]))))[0];
      color[key]=best;fixes.push(`${key} → ${best}`);
    }
    repair('text',['canvas','surface'],highContrast?7:4.5);
    repair('muted',['canvas','surface'],highContrast?7:4.5);
    for(const k of ['accent','ready','issue'])repair(k,['canvas','surface'],4.5);
    repair('border',['canvas','surface'],3);
    // A fallback at any point must re-check earlier tokens against the final backgrounds.
    for(const k of ['text','muted'])repair(k,['canvas','surface'],highContrast?7:4.5);
    for(const k of ['accent','ready','issue'])repair(k,['canvas','surface'],4.5);
    const slots={...plain.slots,...(world?.slots||{})};
    return {color,slots,font:brand?.tokens.typography?.ui||world?.tokens.typography?.ui||plain.tokens.typography.ui,fixes};
  }
  function stable(x) {
    if(Array.isArray(x))return '['+x.map(stable).join(',')+']';
    if(x && typeof x==='object')return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}';
    return JSON.stringify(x);
  }
  function diffMaps(before,after) {
    const changes=[];
    function walk(a,b,path) {
      if(stable(a)===stable(b))return;
      if(a && b && typeof a==='object' && typeof b==='object' && !Array.isArray(a) && !Array.isArray(b)) {
        for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],path+'/'+k.replaceAll('~','~0').replaceAll('/','~1'));
      } else changes.push({path,before:a,after:b});
    }
    // Stable entity IDs, not array indices, keep review readable.
    const keyed=m=>({...m,nodes:Object.fromEntries(m.nodes.map(n=>[n.id,n])),edges:Object.fromEntries(m.edges.map(e=>[e.id,e])),actors:Object.fromEntries(m.actors.map(a=>[a.id,a])),regions:Object.fromEntries(m.regions.map(r=>[r.id,r]))});
    walk(keyed(before),keyed(after),'');return changes;
  }
  function planChanges(before,after) {
    return diffMaps(before,after).filter(c=>
      /^\/(profile|source|layout|lanes|actors|regions)(\/|$)/.test(c.path) ||
      /^\/nodes\/[^/]+\/(kind|label|order|gateKind|x|y|owner|lane|derived|planned|source|acceptance|requiresHumanApproval)(\/|$)/.test(c.path) ||
      /^\/nodes\/[^/]+$/.test(c.path) ||
      /^\/edges\/[^/]+\/(from|to|kind|certainty)(\/|$)/.test(c.path) || /^\/edges\/[^/]+$/.test(c.path));
  }
  return {isProjection,terminal,parse,clone,freeze,safeObject,schemaErrors,validateMap,validateTheme,resolveTheme,contrast,stable,diffMaps,planChanges};
});
