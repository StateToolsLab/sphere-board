/* Sphere Starter 0.3: pure deterministic geometry. No ledger adapter, state, or theme input.
 * Fixed radial bands deliberately trade automatic band growth for cross-group locality.
 * All generated coordinates, seats and label boxes live in this return value, not in map.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SphereLayout=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const TAU=Math.PI*2, BAND=460, BASE=120, STRUCTURAL=new Set(['project','phase','group']);
  const round=n=>Math.round(n*1e8)/1e8;
  const polar=(r,a)=>({x:round(r*Math.cos(a)),y:round(r*Math.sin(a))});
  const lexical=(a,b)=>a<b?-1:a>b?1:0;
  function comparator(nodes){const index=new Map(nodes.map((n,i)=>[n.id,i]));return (a,b)=>(a.order??Infinity)-(b.order??Infinity)||index.get(a.id)-index.get(b.id)||lexical(a.kind,b.kind)||lexical(a.id,b.id);}
  const factor=n=>n.kind==='management'?.64:n.kind==='gate'&&n.gateKind&&n.gateKind!=='explicit'?.65:n.derived?.72:['issue','decision'].includes(n.kind)?.68:1;
  function boxes(n,p){
    const size=p.size, structural=STRUCTURAL.has(n.kind);
    return {...p,id:n.id,beadRadius:structural?0:36*size,seat:structural?null:{x:round(p.x+50*size),y:round(p.y-12*size),r:10*size},label:{x:round(p.x-84*size),y:round(p.y+(structural?-13:49)*size),width:168*size,height:(structural?26:34)*size,visible:true}};
  }
  function rectCircle(box,c){const x=Math.max(box.x,Math.min(c.x,box.x+box.width)),y=Math.max(box.y,Math.min(c.y,box.y+box.height));return Math.hypot(c.x-x,c.y-y)<c.r-1e-7;}
  function rectRect(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
  function labelVisibility(nodes){
    // Geometry, not measured text, is authoritative. Renderer clips text to these boxes.
    // Hidden labels remain available through the list, accessible name and detail panel.
    const accepted=[];
    for(const p of nodes){const b=p.label;
      b.visible=!nodes.some(q=>(q.seat&&rectCircle(b,q.seat))||(q.id!==p.id&&q.beadRadius&&rectCircle(b,{x:q.x,y:q.y,r:q.beadRadius})))&&!accepted.some(q=>rectRect(b,q));
      if(b.visible)accepted.push(b);
    }
  }
  function layout(map){
    const cmp=comparator(map.nodes),ordered=[...map.nodes].sort(cmp),byId=new Map(map.nodes.map(n=>[n.id,n])),parents=new Map(),warnings=[];
    for(const n of ordered){const choices=map.edges.filter(e=>e.kind==='parent'&&e.active&&e.certainty==='explicit'&&e.to===n.id&&byId.has(e.from)).map(e=>byId.get(e.from)).sort(cmp);if(choices.length)parents.set(n.id,choices[0].id);if(choices.length>1)warnings.push(`${n.id}: multiple explicit parents; first in Starter order used for placement only`);}
    function ancestor(n,kind){const seen=new Set();while(n&&!seen.has(n.id)){if(n.kind===kind)return n;seen.add(n.id);n=byId.get(parents.get(n.id));}return null;}
    const explicitPhases=ordered.filter(n=>n.kind==='phase'),phases=(explicitPhases.length?explicitPhases:[null]).map((n,i)=>({id:n?.id??null,start:-Math.PI/2+i*TAU/(explicitPhases.length||1),end:-Math.PI/2+(i+1)*TAU/(explicitPhases.length||1),groups:[]}));
    const phaseOf=n=>ancestor(n,'phase')?.id??phases[0].id;
    const groupOf=n=>ancestor(n,'group')?.id??null;
    for(const phase of phases){phase.groups=ordered.filter(n=>n.kind==='group'&&phaseOf(n)===phase.id).sort((a,b)=>Number(!!a.planned)-Number(!!b.planned)||cmp(a,b));}
    const regions=[],positions=new Map();
    function put(n,point,size,phaseId,groupId,role,extra={}){const p=boxes(n,{...point,size,phaseId,groupId,role,...extra});positions.set(n.id,p);return p;}
    const manual=map.layout?.mode==='manual'&&map.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y));
    if(map.layout?.mode==='manual'&&!manual)warnings.push('manual requires x and y on every node; entire board uses auto (no mixed coordinates)');
    if(manual){
      for(const n of ordered)put(n,{x:n.x,y:n.y},factor(n),phaseOf(n),groupOf(n),STRUCTURAL.has(n.kind)?'structure':'manual');
      labelVisibility([...positions.values()]);
      const result=finish('manual',map.nodes.map(n=>positions.get(n.id)),[],phases,warnings);
      if(map.regions.length){const b=result.bounds,x=Math.min(b.x,...map.regions.map(r=>r.x-30)),y=Math.min(b.y,...map.regions.map(r=>r.y-30));result.bounds={x,y,width:Math.max(b.x+b.width,...map.regions.map(r=>r.x+r.width+30))-x,height:Math.max(b.y+b.height,...map.regions.map(r=>r.y+r.height+30))-y};}
      const collisions=seatCollisions(result);if(collisions.length)warnings.push(`manual: ${collisions.length} seat collisions; supplied coordinates preserved`);
      return result;
    }
    function allocate(items,phase,inner,outer,groupId){
      if(!items.length)return;
      const ids=new Set(items.map(n=>n.id)),width=phase.end-phase.start,gap=Math.min(.12,width*.045),lo=phase.start+gap,hi=phase.end-gap,span=hi-lo;
      const laneCount=map.lanes.length;
      function laneRange(n){const index=map.lanes.indexOf(n.lane);if(!laneCount)return [lo,hi];if(index<0)return [lo+span*.90,hi];return [lo+span*.90*index/laneCount,lo+span*.90*(index+1)/laneCount];}
      const attached=n=>(n.derived||n.kind==='issue'||n.kind==='decision')&&ids.has(parents.get(n.id))&&!STRUCTURAL.has(byId.get(parents.get(n.id))?.kind);
      const gates=items.filter(n=>n.kind==='gate'&&!attached(n)).sort((a,b)=>Number((a.gateKind??'explicit')!=='explicit')-Number((b.gateKind??'explicit')!=='explicit')||cmp(a,b));
      const managers=items.filter(n=>n.kind==='management'&&!attached(n));
      const roots=items.filter(n=>!attached(n)&&!gates.includes(n)&&!managers.includes(n));
      const base=new Map(),main=lo+span*.72,step=Math.min(.13,span*.25/Math.max(1,gates.length));
      gates.forEach((n,i)=>base.set(n.id,{...polar(outer,main+(i?Math.ceil(i/2)*(i%2?1:-1)*step:0)),role:i===0&&(n.gateKind??'explicit')==='explicit'?'primary-gate':'gate',angle:main+(i?Math.ceil(i/2)*(i%2?1:-1)*step:0)}));
      managers.forEach((n,i)=>{const [a,b]=laneRange(n),same=managers.filter(q=>q.lane===n.lane),j=same.indexOf(n),angle=a+(b-a)*(j+1)/(same.length+1);base.set(n.id,{...polar(inner+85,angle),role:'management',angle});});
      const buckets=new Map();for(const n of roots){const key=map.lanes.indexOf(n.lane);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(n);}
      for(const list of buckets.values()){
        const [a,b]=laneRange(list[0]);
        // Column-major order keeps angle order equal to Starter order. More radial rows
        // are used only inside this group's fixed band; no downstream radius changes.
        let rows=1,best=-Infinity;
        for(let k=1;k<=Math.min(list.length,12);k++){const cols=Math.ceil(list.length/k),radial=(outer-inner-230)/k,angular=(inner+200)*(b-a)/cols,score=Math.min(radial,angular);if(score>best){best=score;rows=k;}}
        const cols=Math.ceil(list.length/rows);
        list.forEach((n,i)=>{const col=Math.floor(i/rows),row=i%rows,angle=a+(b-a)*(col+.5)/cols,r=inner+150+(outer-inner-230)*(row+.5)/rows;base.set(n.id,{...polar(r,angle),role:groupId===null?'margin':'task',angle});});
      }
      // Retry only this allocation unit. Circle envelopes cover shell, lane stripe,
      // reserved actor seat and both clipped label lines; state never enters packing.
      let chosen=null;
      for(let attempt=0;attempt<55&&!chosen;attempt++){
        const density=.78**attempt,placed=new Map();let failed=false;
        const envelope=n=>110*density*factor(n);
        function collides(n,p){const r=envelope(n);return [...placed.values()].some(q=>Math.hypot(p.x-q.x,p.y-q.y)<r+q.envelope+3*density);}
        for(const n of [...gates,...managers,...roots]){const p=base.get(n.id),r=Math.hypot(p.x,p.y),clearance=r*Math.sin(Math.min(p.angle-phase.start,phase.end-p.angle,Math.PI/2));if((width<TAU-1e-8&&envelope(n)>clearance)||collides(n,p)){failed=true;break;}placed.set(n.id,{...p,envelope:envelope(n)});}
        if(failed)continue;
        const remaining=items.filter(n=>attached(n));
        while(remaining.length&&!failed){let progressed=false;
          for(let i=0;i<remaining.length;i++){
            const n=remaining[i],parent=placed.get(parents.get(n.id));if(!parent)continue;
            const angle=Math.atan2(parent.y,parent.x),parentRadius=Math.hypot(parent.x,parent.y),distance=parent.envelope+envelope(n)+8*density;
            let found=null;
            const offsets=n.derived?[0,-.65,.65,-1.1,1.1]:[-.95,.95,0,-1.5,1.5,Math.PI];
            for(const multiple of [1,1.3,1.7,2.2,3]){for(const offset of offsets){const p={x:round(parent.x+distance*multiple*Math.cos(angle+offset)),y:round(parent.y+distance*multiple*Math.sin(angle+offset))},r=Math.hypot(p.x,p.y);let a=Math.atan2(p.y,p.x);while(a<phase.start)a+=TAU;
              const edgeChild=parentRadius>=outer-12;
              if(r-envelope(n)<inner+8||r+envelope(n)>(edgeChild?outer+36:outer-12)||a<lo||a>hi||(n.derived&&r<=parentRadius+2*density)||collides(n,p))continue;
              found={...p,role:n.derived?'derived':'satellite',angle:a,envelope:envelope(n),parentId:parents.get(n.id)};break;
            }if(found)break;}
            if(!found){failed=true;break;}
            placed.set(n.id,found);remaining.splice(i--,1);progressed=true;
          }
          if(!progressed)failed=true;
        }
        if(!failed)chosen={placed,density};
      }
      if(!chosen)throw new Error('Layout packing failed in '+(groupId??'phase margin')+'; input has not been changed');
      for(const n of items){const p=chosen.placed.get(n.id);put(n,{x:p.x,y:p.y},chosen.density*factor(n),phase.id,groupId,p.role,{angle:p.angle,parentId:p.parentId??null,density:chosen.density});}
      if(chosen.density<.1)warnings.push(`${groupId??phase.id??'implicit phase'}: dense band; zoom/list recommended (scale ${round(chosen.density)})`);
    }
    for(const phase of phases){
      for(const [index,g] of phase.groups.entries()){
        const inner=BASE+index*BAND,outer=inner+BAND;
        regions.push({id:g.id,phaseId:phase.id,label:g.label,inner:index?inner:0,contentInner:inner,outer,start:phase.start,end:phase.end,planned:!!g.planned,index});
        put(g,polar(inner+32,phase.start+(phase.end-phase.start)*.04),.8,phase.id,g.id,'structure');
        const members=ordered.filter(n=>!STRUCTURAL.has(n.kind)&&groupOf(n)===g.id);
        allocate(members,phase,inner,outer,g.id);
      }
      const marginInner=BASE+phase.groups.length*BAND+95;
      allocate(ordered.filter(n=>!STRUCTURAL.has(n.kind)&&groupOf(n)===null&&phaseOf(n)===phase.id),phase,marginInner,marginInner+BAND,null);
      if(phase.id!==null)put(byId.get(phase.id),polar(marginInner+30,(phase.start+phase.end)/2),.85,phase.id,null,'structure');
    }
    ordered.filter(n=>n.kind==='project').forEach((n,i)=>put(n,{x:0,y:-i*40},.9,null,null,'structure'));
    const nodes=map.nodes.map(n=>positions.get(n.id));
    labelVisibility([...nodes].sort((a,b)=>cmp(byId.get(a.id),byId.get(b.id))));
    return finish('auto',nodes,regions,phases,warnings);
  }
  function finish(mode,nodes,regions,phases,warnings){
    const xs=[-120,120],ys=[-120,120];for(const n of nodes){xs.push(n.x-120*n.size,n.x+120*n.size);ys.push(n.y-120*n.size,n.y+120*n.size);}
    for(const r of regions){for(let i=0;i<=64;i++){const p=polar(r.outer,r.start+(r.end-r.start)*i/64);xs.push(p.x);ys.push(p.y);}}
    const minX=Math.min(...xs)-80,minY=Math.min(...ys)-80,maxX=Math.max(...xs)+80,maxY=Math.max(...ys)+80;
    return {mode,nodes,regions,phases:phases.map(p=>({id:p.id,start:p.start,end:p.end})),bounds:{x:minX,y:minY,width:maxX-minX,height:maxY-minY},warnings};
  }
  function seatCollisions(result){const found=[];for(const p of result.nodes){if(!p.seat)continue;for(const q of result.nodes){if(q.id!==p.id&&q.beadRadius&&Math.hypot(p.seat.x-q.x,p.seat.y-q.y)<p.seat.r+q.beadRadius-1e-7)found.push({seat:p.id,node:q.id});if(q.label.visible&&rectCircle(q.label,p.seat))found.push({seat:p.id,label:q.id});}}return found;}
  function regionPath(r){
    const arc=(radius,start,end,back=false)=>{const out=[],steps=Math.max(2,Math.ceil(Math.abs(end-start)/Math.PI));for(let i=1;i<=steps;i++){const p=polar(radius,start+(end-start)*i/steps);out.push(`A${radius} ${radius} 0 0 ${back?0:1} ${p.x} ${p.y}`);}return out.join(' ');};
    const a=polar(r.outer,r.start),b=polar(r.inner,r.end);
    return `M${a.x} ${a.y} ${arc(r.outer,r.start,r.end)} L${b.x} ${b.y} ${r.inner?arc(r.inner,r.end,r.start,true):''} Z`;
  }
  return Object.freeze({layout,comparator,seatCollisions,regionPath,rectCircle,BAND,BASE});
});
