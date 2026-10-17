(function() {
  'use strict';
  const C=SphereCore, S=SphereStates, L=SphereLayout, CAM=SphereCamera, B=SPHERE_BUNDLE, $=id=>document.getElementById(id);
  const NS='http://www.w3.org/2000/svg';
  const K={project:'Project',phase:'Phase',group:'Group',management:'Management',task:'Task',gate:'Gate',issue:'Issue',decision:'Decision',actor:'Actor'};
  const SYMBOL={project:'▣',phase:'▤',group:'▱',management:'＋',task:'○',gate:'◇',issue:'!',decision:'D',actor:'A'};
  const STATES=Object.fromEntries(Object.entries(S.definitions).map(([key,value])=>[key,value.ja]));
  const EDGE={parent:'親子',dependency:'前提 → 後続',origin:'発生元 → 派生',return:'回収先',blocks:'妨げ'};
  const GATE_KIND_JA={explicit:'明示',recheck:'再判定',event:'イベント'};
  const STRUCTURAL=new Set(['project','phase','group']);
  let map=C.freeze(C.clone(B.sample)),raw=JSON.stringify(B.sample,null,2)+'\n';
  let loadBlocked=false,blockingProblems=[];
  let selected=null,hovered=null,world=B.worlds[0],brand=null,mode='light',resolved,scale=1,view='map',customWorld=null,customBrand=null;
  let connected=false,source='内蔵デモ · 未接続',requestBusy=false,autoReload=location.protocol!=='file:',viewInitialized=false,lastServerError='';
  let sourceGeneration=0;
  let bounds={x:0,y:0,width:1450,height:745},geometry=L.layout(map),camera={x:0,y:0,scale:1,mode:'initial'},currentIndex=-1,dragSuppressed=false;
  const initialValidation=C.validateMap(map,B.mapSchema);
  if(!initialValidation.ok)throw new Error('Bundled map failed validation: '+initialValidation.errors.join('; '));
  const font={sans:'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',serif:'ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif',mono:'ui-monospace,"SFMono-Regular",Consolas,monospace'};
  function element(tag,attrs={},parent=null,svg=false) {
    const e=svg?document.createElementNS(NS,tag):document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)) { if(k==='text')e.textContent=v;else e.setAttribute(k,String(v)); }
    if(parent)parent.appendChild(e);return e;
  }
  const s=(tag,attrs,parent)=>element(tag,attrs,parent,true);
  const t=(parent,text,x,y,attrs={})=>s('text',{x,y,...attrs,text},parent);
  function announce(message,error=false) { $('notice').textContent=message;$('notice').classList.toggle('error',error);$('notice').hidden=!message; }
  const displayNodes=()=>map.nodes.map((n,i)=>({...n,...geometry.nodes[i],label:n.label,labelBox:geometry.nodes[i].label}));
  const isCurrent=n=>map.currents.includes(n.id)||(n.kind==='gate'&&n.state==='pending');
  function stateMark(parent,state,kind='work',attrs={}){return s('path',{class:'state-mark','data-state':state,d:S.geometry(state,kind).d,fill:'none',stroke:'currentColor','stroke-width':2.3,'stroke-linecap':'round','stroke-linejoin':'round',...attrs},parent);}
  function smallState(parent,state,kind='work'){const icon=element('svg',{class:'state-icon',viewBox:'-21 -21 42 42','aria-hidden':'true'},parent,true);stateMark(icon,state,kind);}
  function laneColor(lane){const i=map.lanes.indexOf(lane);return i<0?resolved.color.border:`hsl(${(i*137.508+205)%360} 58% ${mode==='dark'?68:38}%)`;}
  function readyText(n){return n.ready===true?'⊹ Ready':n.ready===false?'Ready: いいえ':'Ready: 未確認';}
  function ownerName(n){return map.actors.find(a=>a.id===n.owner)?.label||'担当未定';}
  function short(x,limit=17){const a=[...x];return a.length>limit?a.slice(0,limit-1).join('')+'…':x;}
  function preferStore(){try{localStorage.setItem('sphere-board-display-v02',JSON.stringify({world:world.id,brand:brand?.id||'none',mode,contrast:$('contrast').value}));}catch(_){/* Storage is optional, including private/file views. */}}
  function applyTheme(){
    const prior=C.stable(map);
    resolved=C.resolveTheme(B.worlds[0],world,brand,mode,$('contrast').value==='high');
    for(const [k,v] of Object.entries(resolved.color))document.documentElement.style.setProperty('--'+k,v);
    document.documentElement.style.setProperty('--ui',font[resolved.font]);
    const p=resolved.color;document.documentElement.style.setProperty('--line',mode==='light'?blend(p.border,p.surface,.22):blend(p.border,p.surface,.30));
    document.documentElement.style.colorScheme=mode;document.documentElement.dataset.mode=mode;
    $('board-scroll').dataset.pattern=resolved.slots['board.canvas'].pattern;
    $('skin-label').textContent=world.name+(brand?' + '+brand.name:'');
    if(C.stable(map)!==prior)throw new Error('Theme changed semantic state');
    renderBoard();renderThemeGrid();renderLegends();renderDiagnostics();preferStore();
  }
  function blend(a,b,part){const c=[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*part+parseInt(b.slice(i,i+2),16)*(1-part)).toString(16).padStart(2,'0'));return '#'+c.join('');}
  function shapePath(kind,shape){
    if(['project','phase','group'].includes(kind))return 'M-52 -25H52V25H-52Z';
    if(kind==='management')return 'M-32 -28H32V28H-32Z';
    if(kind==='gate')return 'M0 -35L35 0 0 35 -35 0Z';
    if(kind==='decision')return 'M-18 -31H18L36 0 18 31H-18L-36 0Z';
    if(kind==='issue')return 'M-19 -31H19L31 -19V19L19 31H-19L-31 19V-19Z';
    if(kind==='actor')return 'M-16 -30H16A30 30 0 0 1 16 30H-16A30 30 0 0 1 -16 -30Z';
    if(shape==='circle')return 'M-32 0a32 32 0 1 0 64 0a32 32 0 1 0 -64 0';
    if(shape==='cut')return 'M-23 -31H33V21L23 31H-33V-21Z';
    if(shape==='shield')return 'M-32 -30H32V4Q30 25 0 36Q-30 25 -32 4Z';
    if(shape==='seal')return 'M-22 -32H22L32 -22V22L22 32H-22L-32 22V-22Z';
    if(shape==='organic')return 'M-29 -17Q-10 -40 27 -28Q43 4 24 27Q-4 42 -28 24Q-41 3 -29 -17Z';
    const r=shape==='soft'?19:shape==='plaque'?3:10;
    return `M${-33+r} -30H${33-r}Q33 -30 33 ${-30+r}V${30-r}Q33 30 ${33-r} 30H${-33+r}Q-33 30 -33 ${30-r}V${-30+r}Q-33 -30 ${-33+r} -30Z`;
  }
  function renderBoard(){
    const svg=$('board'),p=resolved.color,focused=document.activeElement?.getAttribute('data-node');
    if(loadBlocked){svg.replaceChildren();return;}
    const nodes=displayNodes(),byId=new Map(nodes.map(n=>[n.id,n]));bounds=geometry.bounds;
    svg.replaceChildren();
    const defs=s('defs',{},svg);
    for(const id of ['dependency','origin','return']){const m=s('marker',{id:'mark-'+id,markerWidth:12,markerHeight:10,refX:10,refY:5,orient:'auto',markerUnits:'userSpaceOnUse'},defs);s('path',{d:id==='return'?'M1 1L5 5 1 9M5 1L10 5 5 9':'M1 1L10 5 1 9'+(id==='dependency'?'Z':''),fill:id==='dependency'?p.border:'none',stroke:p.border,'stroke-width':1.8},m);}
    const block=s('marker',{id:'mark-blocks',markerWidth:10,markerHeight:20,refX:6,refY:10,orient:'auto',markerUnits:'userSpaceOnUse'},defs);s('path',{d:'M1 10H6M6 2V18',stroke:p.text,'stroke-width':2.5,fill:'none'},block);
    const ringLayer=s('g',{class:'region-layer','aria-label':'工程の同心帯'},svg);
    for(const r of geometry.regions){s('path',{class:'region auto-region','data-region':r.id,'data-planned':r.planned,d:L.regionPath(r),fill:r.index%2?p.surface:p.canvas,stroke:p.border,'stroke-width':r.planned?1.8:1,'stroke-dasharray':r.planned?'5 5':'none','vector-effect':'non-scaling-stroke'},ringLayer);}
    if(geometry.mode==='manual')for(const r of map.regions)s('rect',{class:'region',x:r.x,y:r.y,width:r.width,height:r.height,fill:'none',stroke:p.border,'stroke-dasharray':'5 5','vector-effect':'non-scaling-stroke'},ringLayer);
    const edgeLayer=s('g',{'aria-hidden':'true',class:'edge-layer'},svg);
    for(const e of map.edges){
      const a=byId.get(e.from),b=byId.get(e.to);if(!a||!b)continue;
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
      const ax=a.x+ux*a.beadRadius,ay=a.y+uy*a.beadRadius,bx=b.x-ux*b.beadRadius,by=b.y-uy*b.beadRadius;
      const bend=e.kind==='origin'?Math.min(90,len*.3):e.kind==='return'?Math.min(90,len*.3):e.kind==='blocks'?Math.min(110,len*.2):0;
      // Opposite directions have opposite normals, so origin and return are separated.
      const cx=(ax+bx)/2-uy*bend,cy=(ay+by)/2+ux*bend;
      const attrs={d:bend?`M${ax} ${ay}Q${cx} ${cy} ${bx} ${by}`:`M${ax} ${ay}L${bx} ${by}`,class:'edge-line','data-kind':e.kind,'data-from':e.from,'data-to':e.to,'data-active':e.active,fill:'none',stroke:p.border,'stroke-width':e.kind==='blocks'?1.8:1.2,'vector-effect':'non-scaling-stroke'};
      if(e.kind!=='parent')attrs['marker-end']='url(#mark-'+e.kind+')';
      if(e.kind==='blocks'||e.certainty==='proposed')attrs['stroke-dasharray']='5 4';
      if(e.kind==='origin')attrs['stroke-dasharray']='2 4';if(e.kind==='return')attrs['stroke-dasharray']='9 3 2 3';
      const structuralParent=e.kind==='parent'&&(STRUCTURAL.has(a.kind)||STRUCTURAL.has(b.kind));
      const g=s('g',{class:'edge','data-kind':e.kind,'data-from':e.from,'data-to':e.to,'data-active':e.active,'data-structural-parent':structuralParent},edgeLayer);s('path',attrs,g);
      t(g,EDGE[e.kind]+(!e.active?' · 非アクティブ':'')+(e.certainty==='proposed'?' · 仮説':''),cx,cy-8,{class:'edge-caption',fill:p.muted,'font-size':11,'text-anchor':'middle',stroke:p.canvas,'stroke-width':4,'paint-order':'stroke fill'});
    }
    for(const [index,n] of nodes.entries()){
      const current=isCurrent(n),structural=n.role==='structure',g=s('g',{class:'node'+(selected===n.id?' selected':'')+(structural?' structural':''),transform:`translate(${n.x} ${n.y})`,tabindex:0,role:'button','aria-pressed':selected===n.id,'data-node':n.id,'data-kind':n.kind,'data-size':n.size,'aria-label':`${n.label}。${K[n.kind]}。${STATES[n.state]}。${current?'現在地。':''}${readyText(n)}。担当 ${ownerName(n)}`},svg);
      s('title',{text:n.label+' — '+STATES[n.state]},g);
      const body=s('g',{class:'node-body',transform:`scale(${n.size})`},g);
      s('circle',{class:'node-hit',r:48,fill:'transparent'},body);
      s('path',{class:'shell',d:shapePath(n.kind,resolved.slots['node.shell'].shape),fill:p.surface,stroke:p.border,'stroke-width':1.7,opacity:structural?0:1},body);
      if(!structural){const orn=resolved.slots['node.ornament'].variant;
        if(orn==='double-ring')s('circle',{r:24,fill:'none',stroke:p.border,'stroke-width':.7},body);
        if(orn==='corners')s('path',{d:'M-24 -12V-23H-13M13 23H24V12',fill:'none',stroke:p.border,'stroke-width':1},body);
        if(orn==='engraving')s('path',{d:'M-21 -20H21M-17 18L0 24 17 18',fill:'none',stroke:p.border,'stroke-width':.8},body);
        if(orn==='stitch')s('rect',{x:-23,y:-21,width:46,height:42,rx:12,fill:'none',stroke:p.border,'stroke-width':.7,'stroke-dasharray':'2 3'},body);
      }
      // State paths are fixed here by app/states.js; themes never override them.
      stateMark(body,n.state,n.kind==='gate'?'gate':'work',{stroke:p.text,...(structural?{visibility:'hidden'}:{})});
      if(n.lane&&!structural)s('path',{class:'lane-mark',d:'M-43 -16V16',stroke:laneColor(n.lane),'stroke-width':4,'stroke-linecap':'round'},body);
      if(n.seat)s('circle',{class:'actor-seat','data-seat-for':n.id,cx:(n.seat.x-n.x)/n.size,cy:(n.seat.y-n.y)/n.size,r:n.seat.r/n.size,fill:'none',stroke:'none','pointer-events':'none'},body);
      if(n.planned&&!structural)s('path',{class:'planned-mark',d:'M-37 38H37',stroke:p.text,'stroke-width':1.5,'stroke-dasharray':'3 4'},body);
      if(map.edges.some(e=>e.kind==='blocks'&&e.active&&e.to===n.id)){s('rect',{class:'blocked-mark',x:-46,y:22,width:22,height:22,rx:3,fill:p.surface,stroke:p.text,'stroke-width':1.5},body);s('path',{d:'M-41 33H-29M-30 26V40',stroke:p.text,'stroke-width':2,fill:'none'},body);}
      s('path',{class:'selection-mark',d:'M-51 -35V-51H-35M35 -51H51V-35M51 35V51H35M-35 51H-51V35',fill:'none',stroke:p.text,'stroke-width':2.5},body);
      s('rect',{class:'focus-mark',x:-54,y:-54,width:108,height:144,rx:10,fill:'none',stroke:p.accent,'stroke-width':2.5,'stroke-dasharray':'4 3'},body);
      if(current)s('path',{class:'current-mark',d:'M-19 -46A50 50 0 0 1 19 -46M46 -19A50 50 0 0 1 46 19M19 46A50 50 0 0 1 -19 46M-46 19A50 50 0 0 1 -46 -19',fill:'none',stroke:p.text,'stroke-width':2.2,'stroke-linecap':'round','vector-effect':'non-scaling-stroke'},g);
      if(n.ready===true)s('path',{class:'ready-mark',d:'M0 -54V-43M43 0H54M0 43V54M-54 0H-43',fill:'none',stroke:p.text,'stroke-width':2.2,'stroke-linecap':'round','vector-effect':'non-scaling-stroke'},g);
      const clip=s('clipPath',{id:'label-'+index},defs);s('rect',{x:-84,y:structural?-13:49,width:168,height:structural?26:34},clip);
      const labels=s('g',{class:'node-labels',transform:`scale(${n.size})`,'data-visible':n.labelBox.visible,'clip-path':`url(#label-${index})`},g);
      // Display text and geometry are kept separate: labelBox is the layout reservation.
      labels.dataset.visible=String(n.labelBox.visible);
      t(labels,short(n.label,12),0,structural?5:62,{fill:p.text,'font-size':13,'font-weight':structural?700:600,'text-anchor':'middle'});
      if(!structural)t(labels,short(n.derived?'派生 / '+ownerName(n):n.kind==='gate'?(GATE_KIND_JA[n.gateKind??'explicit']??n.gateKind??'明示')+' / '+STATES[n.state]:ownerName(n),18),0,78,{fill:p.muted,'font-size':9,'text-anchor':'middle'});
      g.addEventListener('pointerenter',()=>setHover(n.id));g.addEventListener('pointerleave',()=>setHover(null));
      g.addEventListener('click',()=>{if(!dragSuppressed)select(n.id);});
      g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(n.id);}if(ev.key==='Escape')select(null);if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)){ev.preventDefault();const axis=ev.key==='ArrowLeft'||ev.key==='ArrowRight'?'x':'y',sign=ev.key==='ArrowLeft'||ev.key==='ArrowUp'?-1:1;const options=nodes.filter(x=>(x[axis]-n[axis])*sign>0).sort((a,b)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(b.x-n.x,b.y-n.y));if(options[0])focusNode(options[0].id);}});
    }
    const tip=s('g',{id:'hover-tooltip',class:'hover-tooltip',visibility:'hidden','aria-hidden':'true'},svg);s('rect',{x:-78,y:-31,width:156,height:30,rx:7,fill:p.surface,stroke:p.border,'stroke-width':1.2,'vector-effect':'non-scaling-stroke'},tip);t(tip,'',0,-11,{class:'hover-tooltip-text',fill:p.text,'font-size':11,'font-weight':650,'text-anchor':'middle'});
    if(hovered)setHover(hovered);
    if(!nodes.length)t(svg,'map.json に計画を追加すると、ここに表示されます。',0,0,{fill:p.muted,'font-size':18,'text-anchor':'middle'});
    applyZoom();if(focused)focusNode(focused,false);
  }
  function focusNode(id,scroll=true){const e=[...$('board').querySelectorAll('[data-node]')].find(e=>e.getAttribute('data-node')===id);if(e){e.focus({preventScroll:true});if(scroll)centerOnNode(id);}}
  function applyZoom(){
    if(!resolved)return;const pane=$('board-scroll'),width=pane.clientWidth||320,height=pane.clientHeight||440;
    camera.scale=scale;$('board').setAttribute('viewBox',`${camera.x-width/(2*scale)} ${camera.y-height/(2*scale)} ${width/scale} ${height/scale}`);
    $('board').style.width='100%';$('board').style.height='100%';$('zoom-label').textContent=(scale<.1?(scale*100).toFixed(1):Math.round(scale*100))+'%';
    const byId=new Map(geometry.nodes.map(n=>[n.id,n]));
    for(const g of $('board').querySelectorAll('.node')){const n=byId.get(g.dataset.node);for(const mark of g.querySelectorAll('.current-mark,.ready-mark')){const minimum=mark.classList.contains('current-mark')?12/50:10/54;mark.setAttribute('transform',`scale(${Math.max(n.size,minimum/scale)})`);}const label=g.querySelector('.node-labels');label.style.display=n.label.visible&&n.size*scale>=.70?'':'none';}
    updateEdges();
  }
  function setHover(id){
    hovered=id&&map.nodes.some(n=>n.id===id)?id:null;
    for(const e of $('board').querySelectorAll('[data-node]'))e.classList.toggle('hovered',e.getAttribute('data-node')===hovered);
    const tip=$('hover-tooltip');if(tip){const n=hovered?geometry.nodes.find(n=>n.id===hovered):null;if(n){const source=map.nodes.find(q=>q.id===hovered);tip.setAttribute('transform',`translate(${n.x} ${n.y-58*n.size})`);tip.querySelector('.hover-tooltip-text').textContent=short(source?.label||hovered,18);tip.setAttribute('visibility','visible');}else tip.setAttribute('visibility','hidden');}
    updateEdges();
  }
  function updateEdges(){
    const edgeLayer=$('board').querySelector('.edge-layer'),front=[];
    for(const g of $('board').querySelectorAll('.edge')){const selectedNear=!!selected&&(g.dataset.from===selected||g.dataset.to===selected),hoverNear=!!hovered&&(g.dataset.from===hovered||g.dataset.to===hovered),near=selectedNear||hoverNear,parent=g.dataset.kind==='parent',structuralParent=g.dataset.structuralParent==='true',active=g.dataset.active==='true',caption=g.querySelector('.edge-caption');if(structuralParent&&!near){g.style.display='none';if(caption)caption.style.display='none';continue;}g.style.display=scale<.24&&!near&&!parent?'none':'';g.style.opacity=selectedNear?(active?'1':'.52'):hoverNear?(active?'.48':'.28'):selected?'.08':hovered?'.13':parent?'.17':active?'.32':'.14';if(caption)caption.style.display='none';if(near)front.push(g);}
    if(edgeLayer)for(const g of front)edgeLayer.appendChild(g);
  }
  function setCamera(next){camera={...camera,...next};scale=camera.scale;applyZoom();}
  function currentNodes(){return map.nodes.filter(isCurrent);}
  function setCurrentPosition(id=null){const currents=currentNodes(),index=id?currents.findIndex(n=>n.id===id):-1;if(index>=0)currentIndex=index;$('current-position').textContent=currents.length&&currentIndex>=0?`現在地 ${currentIndex+1}/${currents.length}`:`現在地 —/${currents.length}`;}
  function fit(){setCamera(CAM.fit(bounds,$('board-scroll').clientWidth,$('board-scroll').clientHeight));$('focus-description').textContent='全体 · 同心帯＝工程 / 点線＝予定。印は縮小しても残ります。';}
  function initialView(){const next=CAM.initial(map,geometry,$('board-scroll').clientWidth,$('board-scroll').clientHeight);setCamera(next);setCurrentPosition(next.currentId);const curr=map.nodes.find(n=>n.id===next.currentId),ready=map.nodes.find(n=>n.id===next.readyId),focusNote=next.focusFits?'':'（読みやすさを優先し、近い取れる珠は表示範囲外の場合があります）';$('focus-description').textContent=([curr?'現在地：'+curr.label:'',ready?'近い取れる珠：'+ready.label:''].filter(Boolean).join(' ／ ')||'現在地・Readyはありません。全体を表示しています。')+focusNote;}
  function centerOnNode(id){const n=geometry.nodes.find(n=>n.id===id);if(n)setCamera({x:n.x,y:n.y,mode:'focused'});}
  function cycleCurrent(){const currents=currentNodes();if(!currents.length)return;const nextIndex=(currentIndex+1+currents.length)%currents.length,next=currents[nextIndex],focus=CAM.focusCurrent(map,geometry,next.id,$('board-scroll').clientWidth,$('board-scroll').clientHeight);currentIndex=nextIndex;if(focus)setCamera(focus);setCurrentPosition(next.id);$('focus-description').textContent=`現在地 ${currentIndex+1}/${currents.length}：${next.label}`;}
  function select(id){selected=id&&map.nodes.some(n=>n.id===id)?id:null;$('board').querySelectorAll('[data-node]').forEach(e=>{const yes=e.getAttribute('data-node')===id;e.classList.toggle('selected',yes);e.setAttribute('aria-pressed',yes);});renderDetails();renderList();renderDiagnostics();updateEdges();$('detail-panel').classList.toggle('sheet-open',!!id);}
  function chip(parent,text,cls=''){element('span',{class:'chip '+cls,text},parent);}
  function renderDetails(){
    const box=$('details');box.replaceChildren();if(loadBlocked){element('h2',{text:'盤の描画を停止しました'},box);element('p',{text:'上部の問題を元データで修正し、読み直してください。以前の盤を新しい投影として表示しません。'},box);return;}const n=map.nodes.find(n=>n.id===selected);
    $('clear-selection').hidden=!n;$('panel-eyebrow').textContent=n?'SELECTED NODE':'CURRENT POSITIONS';
    if(!n){
      element('h2',{text:'いま、進めていること。'},box);
      element('p',{text:`現在地は ${map.nodes.filter(isCurrent).length} か所。選択やReadyとは独立した、共有の作業地点です。`},box);
      for(const q of map.nodes.filter(isCurrent)){const id=q.id,b=element('button',{class:'current-card'},box);element('strong',{text:'◎ '+q.label},b);element('span',{text:ownerName(q)+' / '+STATES[q.state]},b);element('span',{text:readyText(q)},b);b.addEventListener('click',()=>{select(id);focusNode(id);});}
      const note=element('div',{class:'detail-note'},box);element('h4',{text:'ONE MAP. MANY WORLDS.'},note);element('p',{text:C.isProjection(map)?'これは台帳の読み取り専用の投影です。変更は元の台帳で行い、投影を作り直します。':'WBSや文章から計画を作り、許可された作業結果を別候補から更新。スキンは設定から差し替えられます。'},note);
      element('p',{text:'この画面は表示専用です。状態の更新や人間の承認を、見た目の操作だけで書き換えません。'},box);return;
    }
    element('div',{class:'detail-id',text:n.id+' / '+K[n.kind]},box);element('h2',{text:n.label},box);
    const chips=element('div',{class:'chips'},box);smallState(chips,n.state,n.kind==='gate'?'gate':'work');chip(chips,STATES[n.state]);if(isCurrent(n))chip(chips,'◎ 現在地','current');chip(chips,readyText(n),n.ready?'ready':'');
    if(n.description)element('p',{text:n.description},box);
    for(const [label,value] of [['担当',ownerName(n)],['レーン',n.lane||'未指定'],['座標',`${geometry.mode} / (${geometry.nodes.find(p=>p.id===n.id).x.toFixed(2)}, ${geometry.nodes.find(p=>p.id===n.id).y.toFixed(2)}) · 表示用`]]){const r=element('div',{class:'detail-row'},box);element('span',{text:label},r);element('span',{text:value},r);}
    if(n.derived)chip(chips,'派生');if(n.planned)chip(chips,'予定');
    if(n.reason){element('h4',{text:'中止の理由'},box);element('p',{text:n.reason},box);}
    if(n.source){element('h4',{text:'元の台帳の欄'},box);element('p',{class:'small-note',text:'以下は元データをそのまま表示する欄です。盤はこの内容から状態や関係を判断しません。'},box);const data=element('details',{class:'source-fields'},box);element('summary',{text:'source を表示（注記・元の状態・参照を含む）'},data);element('pre',{text:JSON.stringify(n.source,null,2)},data);}
    if(n.readyReason){element('h4',{text:'READY の根拠'},box);element('p',{text:n.readyReason},box);}
    if(n.acceptance?.length){element('h4',{text:'完了条件'},box);for(const a of n.acceptance)element('p',{text:'□ '+a},box);}
    if(n.evidence?.length){element('h4',{text:'記録された証拠（内容の真偽は別途確認）'},box);for(const e of n.evidence)element('p',{text:e.kind+' / '+e.reference+' — '+e.summary},box);}
    if(n.approval){element('h4',{text:'人間の承認記録'},box);element('p',{text:n.approval.actorId+' / '+n.approval.evidence},box);}
    element('h4',{text:'関係と向き'},box);element('p',{class:'relation-summary',text:relationSummary(n)},box);
    for(const e of map.edges.filter(e=>e.from===n.id||e.to===n.id)){
      const other=map.nodes.find(x=>x.id===(e.from===n.id?e.to:e.from)),direction=e.kind==='parent'?(e.to===n.id?'親':'子'):e.kind==='dependency'?(e.to===n.id?'前提':'後続'):e.kind==='origin'?(e.to===n.id?'発生元':'派生先'):e.kind==='return'?(e.from===n.id?'回収先':'回収元'):'妨げ',b=element('button',{class:'relation-button',text:`${e.from===n.id?'→':'←'} ${direction} / ${other.label}${e.active?'':'（非アクティブ）'}${e.certainty==='proposed'?'（仮説）':''}${e.note?' — '+e.note:''}`},box);b.addEventListener('click',()=>{select(other.id);focusNode(other.id);});
    }
  }
  function relationSummary(n){const refs=(kind,incoming)=>map.edges.filter(e=>e.kind===kind&&(incoming?e.to:e.from)===n.id).map(e=>(map.nodes.find(q=>q.id===(incoming?e.from:e.to))?.label||'未確認')+(e.active?'':'（非アクティブ）')+(e.certainty==='proposed'?'（仮説）':''));return [['親',refs('parent',true)],['前提',refs('dependency',true)],['発生元',refs('origin',true)],['回収先',refs('return',false)],['妨げる先',refs('blocks',false)],['妨げられる元',refs('blocks',true)]].map(([label,values])=>label+': '+(values.join('、')||'なし')).join(' / ');}
  function renderList(){const box=$('node-list'),q=$('search').value.toLowerCase();box.replaceChildren();if(loadBlocked)return;const list=map.nodes.filter(n=>(n.label+' '+n.id+' '+ownerName(n)+' '+(n.lane||'')+' '+STATES[n.state]).toLowerCase().includes(q));for(const n of list){const b=element('button',{class:'list-item','aria-pressed':selected===n.id},box);smallState(b,n.state,n.kind==='gate'?'gate':'work');const d=element('span',{},b);element('strong',{text:n.label},d);element('small',{text:`${K[n.kind]} / ${STATES[n.state]} / ${ownerName(n)}`},d);element('small',{text:(isCurrent(n)?'◎ 現在地 / ':'')+readyText(n)},d);element('small',{class:'list-relations',text:relationSummary(n)},d);b.addEventListener('click',()=>select(n.id));}if(!list.length)element('p',{class:'empty',text:'一致するノードはありません。'},box);}
  function renderThemeGrid(){const box=$('theme-grid');box.replaceChildren();for(const w of [...B.worlds,...(customWorld?[customWorld]:[])]){const button=element('button',{class:'theme-card','aria-pressed':world.id===w.id,'data-world':w.id},box),palette={...B.worlds[0].tokens[mode],...(w.tokens[mode]||{})},dots=element('span',{class:'theme-colors','aria-hidden':'true'},button);for(const k of ['canvas','surface','accent']){const dot=element('i',{},dots);dot.style.backgroundColor=palette[k];}element('strong',{text:w.name},button);if(world.id===w.id)element('span',{class:'chosen','aria-hidden':'true',text:'✓'},button);button.addEventListener('click',()=>{world=w;applyTheme();const replacement=[...box.children].find(e=>e.dataset.world===w.id);replacement?.focus();});}}
  function renderDiagnostics(){
    $('diagnostics').textContent=JSON.stringify({world:world.id,brand:brand?.id||null,mode,slots:resolved.slots,colors:resolved.color,contrastCorrections:resolved.fixes,semanticMutation:false},null,2);
    const result=C.validateMap(map,B.mapSchema);$('data-diagnostics').textContent=JSON.stringify({source,profile:map.profile,revision:map.revision,selected,current:map.currents,validation:result,layout:{mode:geometry.mode,warnings:geometry.warnings},readOnly:true},null,2);
    $('integrity').textContent='READ ONLY · '+map.nodes.length+' NODES · '+map.edges.length+' RELATIONS';
  }
  function renderProblems(){
    const box=$('problems');box.replaceChildren();const items=loadBlocked?blockingProblems:[...map.problems,...geometry.warnings.map(p=>'配置: '+p)];
    box.hidden=!items.length;if(!items.length)return;
    element('h2',{text:`確認事項（${items.length}件）${loadBlocked?' · 描画停止':''}`},box);
    const list=element('ul',{},box);for(const value of items)element('li',{text:value},list);
  }
  function renderLegends(){
    const box=$('state-legend');box.replaceChildren();
    for(const [title,keys,kind] of [['状態',S.WORK_STATES,'work'],['ゲートの結果',S.GATE_STATES,'gate']]){element('h4',{text:title},box);const row=element('div',{class:'state-legend-items'},box);for(const key of keys){const item=element('span',{class:'state-legend-item'},row);smallState(item,key,kind);element('span',{text:STATES[key]+' / '+S.definitions[key].en},item);}}
    const lane=$('lane-legend');lane.replaceChildren();if(loadBlocked)return;for(const label of map.lanes){const item=element('span',{class:'lane-label'},lane),dot=element('i',{'aria-hidden':'true'},item);dot.style.background=laneColor(label);element('span',{text:label||'空のレーン'},item);}
  }
  function renderMeta(){
    $('project-title').textContent=loadBlocked?'読み込みを停止しました':map.meta.title;
    $('project-desc').textContent=map.meta.description||'計画の構造を、好きなスキンで。';$('connection-label').textContent=source;
    $('revision-label').textContent=C.isProjection(map)?'投影 · 読み取り専用':'revision '+map.revision;
    $('map-summary').textContent=loadBlocked?'描画停止':map.nodes.length+' nodes · '+map.nodes.filter(isCurrent).length+' current';
    $('projection-note').hidden=!C.isProjection(map);$('projection-note').textContent='投影は読み取り専用です。snapshot・apply・画面のmap書き出しは使えません。元の台帳で更新し、投影を作り直してください。';
    $('export-map').disabled=loadBlocked||C.isProjection(map);$('export-map').title=C.isProjection(map)?'投影の書き出しは無効です。元の台帳で更新してください。':'';
    $('board-help').textContent=geometry.mode==='auto'?'構造と順番の自動配置 · ドラッグ／ピンチで移動':'手動座標 · 読み取り専用';
    $('current-count').textContent='現在地 '+(loadBlocked?0:currentNodes().length);$('ready-count').textContent='取れる珠 '+(loadBlocked?0:map.nodes.filter(n=>n.ready===true).length);$('go-current').disabled=loadBlocked||!map.nodes.some(isCurrent);if(loadBlocked){currentIndex=-1;$('current-position').textContent='現在地 —/0';}else setCurrentPosition(camera.currentId);
    const keys=$('region-key');keys.replaceChildren();for(const r of loadBlocked?[]:geometry.regions){const b=element('button',{class:'region-key-item'+(r.planned?' planned':''),text:`${geometry.phases.length>1?'F'+(geometry.phases.findIndex(p=>p.id===r.phaseId)+1)+' / ':''}${r.index+1} ${r.label}${r.planned?' · 予定':''}`},keys);b.onclick=()=>{select(r.id);centerOnNode(r.id);};}
    renderProblems();renderLegends();renderDetails();renderList();renderDiagnostics();
  }
  function blockLoad(items){loadBlocked=true;blockingProblems=items;selected=null;hovered=null;$('detail-panel').classList.remove('sheet-open');$('focus-description').textContent='入力の確認が必要です。描画を停止しました。';renderBoard();renderMeta();}
  function acceptMap(text,origin){
    const input=C.parse(text),result=C.validateMap(input,B.mapSchema);
    if(!result.ok){const problems=['この形は読めません。sphere-starter/0.3 の map.json を選んでください。',...result.errors];blockLoad(problems);throw new Error('mapを読み込めません。盤の描画を停止しました。\n'+problems.slice(0,8).join('\n'));}
    const oldIds=JSON.stringify(map.nodes.map(n=>n.id));const nextGeometry=L.layout(input);raw=text;map=C.freeze(input);geometry=nextGeometry;currentIndex=-1;source=origin;loadBlocked=false;blockingProblems=[];
    if(!map.nodes.some(n=>n.id===selected))selected=null;if(!map.nodes.some(n=>n.id===hovered))hovered=null;renderBoard();renderMeta();
    if(!viewInitialized||oldIds!==JSON.stringify(map.nodes.map(n=>n.id))){initialView();viewInitialized=true;}
    const warnings=C.validateMap(map,B.mapSchema).warnings;announce(!map.problems.length&&warnings.length?'確認事項：\n'+warnings.join('\n'):'');
  }
  function setView(next){view=next;$('board-wrap').hidden=next!=='map';$('list-wrap').hidden=next!=='list';for(const key of ['map','list']){$('view-'+key).classList.toggle('active',key===next);$('view-'+key).setAttribute('aria-pressed',key===next);}if(next==='list')$('search').focus();else if(selected)centerOnNode(selected);}
  async function reload(manual=false){
    if(location.protocol==='file:'){if(manual)announce('ローカルファイルを直接開いています。「map.jsonを開く」で読み込むか、付属のserveコマンドを使ってください。');return;}
    if(requestBusy)return;requestBusy=true;const generation=sourceGeneration;
    try{
      const response=await fetch('./map.json',{cache:'no-store'});
      if(!response.ok){if(response.status===422){const data=await response.json();if(generation!==sourceGeneration)return;blockLoad(data.problems||[data.error]);}throw new Error('map.jsonの応答: HTTP '+response.status);}
      const text=await response.text();
      if(generation!==sourceGeneration)return;
      if(loadBlocked||!connected||text!==raw){acceptMap(text,'ローカル / 同一サイトのmapに接続');connected=true;}else if(lastServerError){announce('');}
      lastServerError='';
    }catch(e){if(generation!==sourceGeneration)return;if(lastServerError!==e.message){announce((loadBlocked?'再読込できません。盤の描画を停止しました。':'再読込できません。前回の有効なmapを表示しています。')+'\n'+e.message,true);lastServerError=e.message;}}
    finally{requestBusy=false;}
  }
  function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));const a=element('a',{href:url,download:name},document.body);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function importTheme(text){const candidate=C.parse(text,128*1024),result=C.validateTheme(candidate,B.themeSchema);if(!result.ok)throw new Error('themeを読み込めません。\n'+result.errors.slice(0,8).join('\n'));if(B.worlds.some(w=>w.id===candidate.id)||B.brands.some(b=>b.id===candidate.id))throw new Error('内蔵テーマと同じidです。自作テーマには別のidを指定してください。');C.freeze(candidate);if(candidate.layer==='brand'){customBrand=candidate;brand=candidate;for(const o of [...$('brand').options])if(o.dataset.custom)o.remove();const o=element('option',{value:candidate.id,text:candidate.name},$('brand'));o.dataset.custom='true';$('brand').value=candidate.id;}else{customWorld=candidate;world=candidate;}$('custom-theme-note').textContent='読み込み済み: '+candidate.name+'（このセッションのみ）';applyTheme();announce('テーマを読み込みました。mapの意味構造は変更していません。');}
  async function fileLoad(input,callback,maxSize){const f=input.files?.[0];if(!f)return;try{if(f.size>maxSize)throw new Error('ファイルが大きすぎます。');callback(await f.text());}catch(e){announce(e.message,true);}finally{input.value='';}}
  function bindPanZoom(){
    const pane=$('board-scroll'),points=new Map();let previous=null,moved=0;
    const info=()=>{const p=[...points.values()];return p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}:p.length?{...p[0],d:0}:null;};
    pane.addEventListener('pointerdown',e=>{if(e.button!==0)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});previous=info();moved=0;dragSuppressed=false;if(!e.target.closest('.node'))pane.setPointerCapture(e.pointerId);});
    pane.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});const now=info();if(previous){const dx=now.x-previous.x,dy=now.y-previous.y;moved+=Math.hypot(dx,dy);camera.x-=dx/scale;camera.y-=dy/scale;if(previous.d&&now.d)scale=Math.max(.00001,Math.min(30,scale*now.d/previous.d));camera.mode='pan';dragSuppressed=moved>4;applyZoom();}previous=now;});
    const release=e=>{points.delete(e.pointerId);previous=info();if(pane.hasPointerCapture(e.pointerId))pane.releasePointerCapture(e.pointerId);setTimeout(()=>dragSuppressed=false,0);};
    pane.addEventListener('pointerup',release);pane.addEventListener('pointercancel',release);
    pane.addEventListener('wheel',e=>{e.preventDefault();const r=pane.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,old=scale;scale=Math.max(.00001,Math.min(30,scale*Math.exp(-e.deltaY*.0015)));camera.x+=dx/old-dx/scale;camera.y+=dy/old-dy/scale;camera.mode='zoom';applyZoom();},{passive:false});
  }
  function bind(){
    $('open-map').onclick=()=>$('map-file').click();$('map-file').onchange=()=>fileLoad($('map-file'),text=>{acceptMap(text,'手動で開いたmap · 読み取り専用');sourceGeneration++;connected=false;autoReload=false;$('auto-reload').checked=false;},2*1024*1024);
    $('open-settings').onclick=()=>$('settings').showModal();$('close-settings').onclick=()=>$('settings').close();$('settings').addEventListener('close',()=>$('open-settings').focus());
    $('mode').onchange=()=>{mode=$('mode').value;applyTheme();};$('contrast').onchange=applyTheme;
    $('brand').onchange=()=>{brand=B.brands.find(b=>b.id===$('brand').value)||(customBrand?.id===$('brand').value?customBrand:null);applyTheme();};
    $('viewport').onchange=()=>{const v=$('viewport').value;$('board-wrap').style.width=v==='auto'?'100%':v+'px';};
    $('import-theme').onclick=()=>$('theme-file').click();$('theme-file').onchange=()=>fileLoad($('theme-file'),importTheme,128*1024);
    $('export-theme').onclick=()=>download(world.id+'.json',JSON.stringify(world,null,2)+'\n');$('export-map').onclick=()=>{if(loadBlocked||C.isProjection(map)){announce('投影は読み取り専用です。元の台帳で更新してください。',true);return;}download('map.json',raw);};
    $('reload').onclick=()=>{autoReload=true;$('auto-reload').checked=true;reload(true);};$('auto-reload').onchange=()=>{autoReload=$('auto-reload').checked;if(autoReload)reload(true);else sourceGeneration++;};
    $('load-demo').onclick=()=>{sourceGeneration++;autoReload=false;$('auto-reload').checked=false;connected=false;acceptMap(JSON.stringify(B.sample,null,2)+'\n','内蔵デモ · 未接続');};
    $('view-map').onclick=()=>setView('map');$('view-list').onclick=()=>setView('list');$('search').oninput=renderList;
    $('clear-selection').onclick=()=>{select(null);$('board-scroll').focus();};
    $('zoom-in').onclick=()=>{scale=Math.min(30,scale*1.3);applyZoom();};$('zoom-out').onclick=()=>{scale=Math.max(.00001,scale/1.3);applyZoom();};$('zoom-fit').onclick=fit;$('zoom-read').onclick=initialView;$('go-current').onclick=cycleCurrent;
    bindPanZoom();
    $('board-scroll').addEventListener('click',e=>{if(dragSuppressed||e.target.closest?.('.node'))return;select(null);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected&&!$('settings').open)select(null);});
    new ResizeObserver(()=>{if(camera.mode==='overview')fit();else applyZoom();}).observe($('board-scroll'));
    $('auto-reload').checked=autoReload;
  }
  try{
    let pref;try{pref=JSON.parse(localStorage.getItem('sphere-board-display-v02')||'null');}catch(_){}
    if(pref){world=B.worlds.find(w=>w.id===pref.world)||world;brand=B.brands.find(b=>b.id===pref.brand)||null;mode=pref.mode==='dark'?'dark':'light';$('contrast').value=pref.contrast==='high'?'high':'normal';}
    $('mode').value=mode;$('brand').value=brand?.id||'none';bind();applyTheme();renderMeta();
    initialView();viewInitialized=true;
    reload();setInterval(()=>{if(autoReload)reload();},2500);
    // Test/diagnostic interface returns copies. Theme imports never receive mutable map references.
    Object.defineProperty(window,'__sphere',{value:Object.freeze({snapshot:()=>C.clone(map),state:()=>({selected,hovered,world:world.id,brand:brand?.id||null,mode,scale,source,loadBlocked,camera:C.clone(camera)}),layout:()=>C.clone(geometry),initialView,fit,validate:()=>C.validateMap(map,B.mapSchema),importTheme,acceptMap,resolved:()=>C.clone(resolved)}),writable:false});
  }catch(e){const box=element('div',{class:'boot-error',text:'起動できませんでした。\n'+e.message},document.body);box.setAttribute('role','alert');console.error(e);}
})();
