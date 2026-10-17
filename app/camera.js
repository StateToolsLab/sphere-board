/* Camera and focus policy. Geometry is input; camera never writes layout or map. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SphereCamera=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const LABEL_THRESHOLD=.70;
  const current=(map,n)=>n.kind==='gate'&&n.state==='pending'||map.currents.includes(n.id);
  function fit(bounds,width,height,padding=22){return {x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2,scale:Math.max(.00001,Math.min((width-2*padding)/Math.max(1,bounds.width),(height-2*padding)/Math.max(1,bounds.height),1.5)),mode:'overview'};}
  function pointBounds(points){const xs=points.map(n=>n.x),ys=points.map(n=>n.y);return {x:Math.min(...xs)-80,y:Math.min(...ys)-80,width:Math.max(...xs)-Math.min(...xs)+160,height:Math.max(...ys)-Math.min(...ys)+160};}
  function readableScale(points,threshold=LABEL_THRESHOLD){return points.reduce((need,n)=>Math.max(need,threshold/Math.max(.00001,n.size??1)),.00001);}
  function focusPoint(point,width,height,minimumScale=LABEL_THRESHOLD/Math.max(.00001,point.size??1),mode='focused'){
    const single=fit(pointBounds([point]),width,height,22);
    return {x:point.x,y:point.y,scale:Math.max(single.scale,minimumScale),mode};
  }
  function nearestPair(currents,ready,width,height){
    const pairs=[];
    for(const a of currents)for(const b of ready){const points=[a,b],camera=fit(pointBounds(points),width,height,22),floor=readableScale(points);pairs.push({a,b,distance:Math.hypot(a.x-b.x,a.y-b.y),camera,floor,fits:camera.scale>=floor});}
    const feasible=pairs.filter(p=>p.fits).sort((a,b)=>a.distance-b.distance);
    return feasible[0]??pairs.sort((a,b)=>a.distance-b.distance)[0]??null;
  }
  function initial(map,layout,width,height){
    const byId=new Map(layout.nodes.map(n=>[n.id,n])),currents=map.nodes.filter(n=>current(map,n)).map(n=>byId.get(n.id)).filter(Boolean),ready=map.nodes.filter(n=>n.ready===true).map(n=>byId.get(n.id)).filter(Boolean);
    const all=[...new Set([...currents,...ready])];
    if(!all.length)return {...fit(layout.bounds,width,height),mode:'initial',focus:[],currentId:null,readyId:null,readableFloor:0,focusFits:true};
    const allCamera=fit(pointBounds(all),width,height,22),allFloor=readableScale(all);
    if(allCamera.scale>=allFloor){const first=currents[0]??ready[0];return {...allCamera,mode:'initial',focus:all.map(n=>n.id),currentId:currents[0]?.id??null,readyId:ready[0]?.id??null,readableFloor:allFloor,focusFits:true,x:allCamera.x,y:allCamera.y,scale:Math.max(allCamera.scale,allFloor)};}
    const pair=nearestPair(currents,ready,width,height),first=pair?.a??currents[0]??ready[0],next=pair?.b??ready[0]??null,selected=[...new Set([first,...(next?[next]:[])])],floor=readableScale(selected),paired=fit(pointBounds(selected),width,height,22),focusFits=paired.scale>=floor;
    const camera=focusFits?{...paired,scale:Math.max(paired.scale,floor)}:focusPoint(first,width,height,floor,'initial');
    return {...camera,mode:'initial',focus:selected.map(n=>n.id),currentId:currents.includes(first)?first.id:null,readyId:next?.id??(ready.includes(first)?first.id:null),readableFloor:floor,focusFits};
  }
  function focusCurrent(map,layout,id,width,height){
    const point=layout.nodes.find(n=>n.id===id),node=map.nodes.find(n=>n.id===id);
    if(!point||!node||!current(map,node))return null;
    const floor=readableScale([point]),camera=focusPoint(point,width,height,floor,'current');
    return {...camera,focus:[id],currentId:id,readyId:null,readableFloor:floor,focusFits:true};
  }
  function visible(point,camera,width,height,padding=0){return Math.abs(point.x-camera.x)*camera.scale<=width/2-padding&&Math.abs(point.y-camera.y)*camera.scale<=height/2-padding;}
  return Object.freeze({fit,initial,focusCurrent,visible,current,pointBounds,readableScale,LABEL_THRESHOLD});
});
