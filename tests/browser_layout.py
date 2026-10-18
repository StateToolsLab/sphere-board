"""v0.3.1 readability + v0.3 layout acceptance matrix. Generated HTML in Chromium; explicit fixture fetch.
No browser URL/file transport is claimed. All maps and screenshots are fictional.
Uses only the development dependencies already listed by v0.2.
"""
from pathlib import Path
import argparse, json, os, shutil, time
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
LANG=os.environ.get('SPHERE_LANG','en')
assert LANG in ['en','ja']
HTML=(R/('ja/index.html' if LANG=='ja' else 'index.html')).read_text()
EXAMPLES=R/'examples'/('ja' if LANG=='ja' else '')
OUT=R/'preview'/'v0.6.0'/LANG;OUT.mkdir(parents=True,exist_ok=True)
FIXTURES={'essay':str((EXAMPLES/'essay.json').relative_to(R)),'exhibition':str((EXAMPLES/'exhibition.json').relative_to(R)),**{f'scale-{n}':f'tests/fixtures/scale-{n}.json' for n in [10,60,150,300]}}
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--fixture',action='append',choices=sorted(FIXTURES));args=parser.parse_args()
if args.fixture:FIXTURES={k:v for k,v in FIXTURES.items() if k in args.fixture}
checks=[];errors=[];network=[];screens=[];layouts={};metrics=[]
(OUT/'layout').mkdir(parents=True,exist_ok=True)
def ok(name,value=True):
 assert value,name
 checks.append({'name':name,'passed':True})
def screenshot(q,name):
 file=str((OUT/'layout'/f'{name}.png').relative_to(R));q.screenshot(path=str(R/file),full_page=True);screens.append(file)
def marker_info(q,kind):
 return q.evaluate('''kind=>{const board=document.getElementById('board-scroll').getBoundingClientRect();return [...document.querySelectorAll('.'+kind)].map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,inside:r.left>=board.left-1&&r.top>=board.top-1&&r.right<=board.right+1&&r.bottom<=board.bottom+1,stroke:getComputedStyle(e).stroke,display:getComputedStyle(e).display};});}''',kind)
with sync_playwright() as p:
 exe=os.environ.get('SPHERE_BROWSER') or shutil.which('chromium')
 browser=p.chromium.launch(headless=True,args=['--no-sandbox'],**({'executable_path':exe} if exe else {}))
 for name,file in FIXTURES.items():
  fixture=json.loads((R/file).read_text());layouts[name]={}
  for width in [1440,375]:
   q=browser.new_page(viewport={'width':width,'height':1000},device_scale_factor=1,has_touch=width==375)
   q.on('pageerror',lambda e:errors.append(str(e)));q.on('request',lambda req:network.append(req.url))
   q.evaluate('m=>{window.__fixture=JSON.stringify(m);window.fetch=async()=>new Response(window.__fixture,{status:200,headers:{"Content-Type":"application/json"}})}',fixture)
   started=time.monotonic();q.set_content(HTML,wait_until='load');q.wait_for_function('n=>window.__sphere&&__sphere.snapshot().nodes.length===n',arg=len(fixture['nodes']))
   q.wait_for_timeout(60)
   tag=f'{name} / {width}px';initial=q.evaluate('__sphere.state()');layout=q.evaluate('__sphere.layout()');layouts[name][width]=layout
   metrics.append({'fixture':name,'viewportWidth':width,'bootMs':round((time.monotonic()-started)*1000,2),'initialScale':initial['scale']})
   ok(tag+' validated input and exact snapshot',q.evaluate('__sphere.validate().ok') and q.evaluate('__sphere.snapshot()')==fixture)
   ok(tag+' no horizontal page overflow',q.evaluate('document.documentElement.scrollWidth<=innerWidth'))
   ok(tag+' unfocused skip link is clipped',q.locator('.skip').evaluate('(e)=>getComputedStyle(e).clipPath')=='inset(50%)')
   ok(tag+' actor seats have no bead or visible-label collisions',q.evaluate('SphereLayout.seatCollisions(__sphere.layout()).length===0'))
   currents=marker_info(q,'current-mark');ready=marker_info(q,'ready-mark')
   current_id=initial['camera'].get('currentId');ready_id=initial['camera'].get('readyId')
   def focus_label(node_id):
    return q.evaluate('''id=>{const g=[...document.querySelectorAll('.node')].find(e=>e.dataset.node===id);if(!g)return null;const pane=document.getElementById('board-scroll').getBoundingClientRect(),r=g.getBoundingClientRect(),label=g.querySelector('.node-labels');return {size:Number(g.dataset.size),labelDisplay:getComputedStyle(label).display,inside:r.left>=pane.left-1&&r.top>=pane.top-1&&r.right<=pane.right+1&&r.bottom<=pane.bottom+1};}''',node_id) if node_id else None
   current_focus=focus_label(current_id);ready_focus=focus_label(ready_id)
   ok(tag+' initial focused current is on screen with readable label',current_focus is not None and current_focus['inside'] and current_focus['labelDisplay']!='none' and current_focus['size']*initial['scale']>=.70-1e-9)
   if ready_id:ok(tag+' initial nearby ready label is enabled at readable scale',ready_focus is not None and ready_focus['labelDisplay']!='none' and ready_focus['size']*initial['scale']>=.70-1e-9)
   ok(tag+' initial camera records the same readable floor it enforces',initial['scale']>=initial['camera'].get('readableFloor',0)-1e-9)
   expected=sum((n['kind']=='gate' and n['state']=='pending') or n['id'] in fixture['currents'] for n in fixture['nodes'])
   ok(tag+' count, cycle position and button visible',q.locator('#current-count').is_visible() and q.locator('#current-position').is_visible() and f'/{expected}' in q.locator('#current-position').inner_text() and q.locator('#go-current').is_visible() and not q.locator('#go-current').is_disabled())
   ok(tag+' labels are clipped to reserved boxes',q.locator('.node-labels[clip-path]').count()==len(fixture['nodes']))
   structural=q.locator('.edge[data-kind="parent"][data-structural-parent="true"]');nonstructural=q.locator('.edge[data-kind="parent"][data-structural-parent="false"]')
   ok(tag+' structural heading parent edges are hidden by default',structural.count()==0 or q.evaluate('''()=>[...document.querySelectorAll('.edge[data-kind="parent"][data-structural-parent="true"]')].every(e=>getComputedStyle(e).display==='none')'''))
   if nonstructural.count():ok(tag+' non-structural parent edges remain drawn',q.evaluate('''()=>[...document.querySelectorAll('.edge[data-kind="parent"][data-structural-parent="false"]')].some(e=>getComputedStyle(e).display!=='none')'''))
   if structural.count():
    shown=q.evaluate('''()=>{const e=document.querySelector('.edge[data-kind="parent"][data-structural-parent="true"]'),id=e.dataset.to,g=[...document.querySelectorAll('.node')].find(n=>n.dataset.node===id);g.dispatchEvent(new MouseEvent('click',{bubbles:true}));return getComputedStyle(e).display!=='none';}''')
    ok(tag+' selecting a structural parent edge endpoint reveals that edge',shown)
    q.locator('#clear-selection').click()
   ok(tag+' legend explains structural membership by region',('工程・フェーズへの所属は領域で表す' if LANG=='ja' else 'Stage and phase membership is shown by regions') in q.locator('.legend').inner_text())
   viewport='desktop' if width==1440 else '375'
   screenshot(q,f'{name}-{viewport}-initial')
   q.locator('#zoom-fit').click();q.wait_for_timeout(30)
   overview=q.evaluate('__sphere.state()');currents=marker_info(q,'current-mark');ready=marker_info(q,'ready-mark')
   ok(tag+' overview retains current/ready screen-sized marks',all(m['inside'] and m['width']>=18 for m in currents+ready))
   ok(tag+' overview retains all group regions',q.locator('.auto-region').count()==sum(n['kind']=='group' for n in fixture['nodes']))
   ok(tag+' planned boundary is dashed',q.evaluate('[...document.querySelectorAll(".auto-region[data-planned=true]")].every(e=>e.getAttribute("stroke-dasharray")==="5 5")'))
   ok(tag+' overview hides labels and reduces non-parent edges',q.evaluate('[...document.querySelectorAll(".node-labels")].filter(e=>getComputedStyle(e).display!=="none").length<__sphere.snapshot().nodes.length'))
   screenshot(q,f'{name}-{viewport}-overview')
   start_id=initial['camera'].get('currentId');cycled=[];cycle_ok=True
   for _ in range(expected):
    q.locator('#go-current').click();state=q.evaluate('__sphere.state()');cid=state['camera'].get('currentId');cycled.append(cid);info=focus_label(cid);cycle_ok=cycle_ok and info is not None and info['inside'] and info['labelDisplay']!='none' and info['size']*state['scale']>=.70-1e-9 and f'/{expected}' in q.locator('#current-position').inner_text()
   ok(tag+' current button moves to readable currents and wraps to the first focus',cycle_ok and (cycled[-1]==start_id if expected else True) and len(set(cycled))==expected and q.evaluate('__sphere.snapshot()')==fixture)
   ok(tag+' camera-only operations leave geometry exact',q.evaluate('__sphere.layout()')==layout)
   if name=='essay':
    # Select an actual rendered bead with a real mouse click at its SVG center.
    q.locator('#zoom-read').click();target=q.evaluate('__sphere.state().camera.currentId')
    point=q.evaluate('id=>{const e=[...document.querySelectorAll(".node")].find(e=>e.dataset.node===id),m=e.getScreenCTM();return {x:m.e,y:m.f}}',target)
    q.mouse.click(point['x'],point['y']);ok(tag+' pointer selects bead',q.evaluate('__sphere.state().selected')==target)
    ok(tag+' details expose all textual relationships',all(word in q.locator('.relation-summary').inner_text() for word in (['親','前提','発生元','回収先','妨げ'] if LANG=='ja' else ['Parent','Prerequisite','Origin','Return destination','Block'])))
    if width==375:
     panel=q.locator('#detail-panel').bounding_box();ok(tag+' mobile details are bottom sheet',q.locator('#detail-panel').evaluate('(e)=>getComputedStyle(e).position')=='fixed' and abs(panel['y']+panel['height']-1000)<2 and panel['width']<=375)
     screenshot(q,'essay-375-bottom-sheet')
    q.locator('#clear-selection').click();ok(tag+' closing detail does not change camera',q.evaluate('__sphere.state().selected') is None)
    q.locator('#view-list').click();q.locator('#search').fill(('具体例' if LANG=='ja' else 'concrete example'));ok(tag+' list reads relation text',q.locator('.list-item').count()==1 and ('発生元' if LANG=='ja' else 'Origin') in q.locator('.list-relations').inner_text());q.locator('#search').fill('');q.locator('#view-map').click()
    before=q.evaluate('__sphere.layout()');cam=q.evaluate('__sphere.state().camera')
    q.locator('#open-settings').click();q.locator('[data-world="plain"]').click();q.locator('#mode').select_option('dark');q.locator('#brand').select_option('example-studio');q.locator('#close-settings').click()
    ok(tag+' theme keeps geometry, seats and camera unchanged',q.evaluate('__sphere.layout()')==before and q.evaluate('__sphere.state().camera')==cam)
    q.locator('#open-settings').click();q.locator('[data-world="plain"]').click();q.locator('#mode').select_option('light');q.locator('#brand').select_option('none');q.locator('#close-settings').click()
    pane=q.locator('#board-scroll').bounding_box();x=pane['x']+pane['width']/2;y=pane['y']+pane['height']/2
    before=q.evaluate('__sphere.state().camera');q.mouse.move(x,y);q.mouse.down();q.mouse.move(x+38,y+26,steps=6);q.mouse.up();after=q.evaluate('__sphere.state().camera');ok(tag+' drag pans camera only',before!=after and q.evaluate('__sphere.layout()')==layout)
    if width==375:
     session=q.context.new_cdp_session(q);before=q.evaluate('__sphere.state().scale')
     session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x-30,'y':y},{'x':x+30,'y':y}]})
     session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x-55,'y':y},{'x':x+55,'y':y}]})
     session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
     ok(tag+' two touch points pinch zoom camera',q.evaluate('__sphere.state().scale')>before and q.evaluate('__sphere.layout()')==layout)
   q.close()
  ok(name+' desktop and 375px share EXACT complete geometry',layouts[name][1440]==layouts[name][375])
 ok('No uncaught JavaScript errors',not errors)
 ok('No external network requests in screenshot fixture mode',not network)
 browser.close()
report={'method':'Chromium generated index.html via set_content; explicit same-map fetch fixtures; no real browser URL/file transport.', 'language':LANG,'browser':Path(exe).name if exe else 'Playwright Chromium','passed':len(checks),'failed':0,'errors':errors,'networkRequests':network,'screenshots':screens,'metrics':metrics,'checks':checks}
(R/'verification'/(f'browser-layout-{LANG}'+(('-'+next(iter(FIXTURES))) if len(FIXTURES)==1 else '')+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Browser layout: {len(checks)} passed; {len(screens)} screenshots; 0 failed')
