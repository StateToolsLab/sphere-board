"""v0.5 finish acceptance: Core Plain contrast surfaces, hover/selection, keyboard, labels, captures."""
from pathlib import Path
import json, os, shutil
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
LANG=os.environ.get('SPHERE_LANG','en')
assert LANG in ['en','ja']
HTML=(R/('ja/index.html' if LANG=='ja' else 'index.html')).read_text()
EXAMPLES=R/'examples'/('ja' if LANG=='ja' else '')
OUT=R/'preview'/'v0.6.0'/LANG;OUT.mkdir(parents=True,exist_ok=True)
# Historical v0.5.0 screenshots are never overwritten.
VER=R/'verification';VER.mkdir(exist_ok=True)
fixtures={name:json.loads((EXAMPLES/f'{name}.json').read_text()) for name in ['essay','exhibition']}
checks=[];errors=[];shots=[]
def ok(name,cond=True):
 assert cond,name;checks.append({'name':name,'passed':True})
def page_for(browser,width,fixture):
 q=browser.new_page(viewport={'width':width,'height':1000},device_scale_factor=1,has_touch=width==375)
 q.on('pageerror',lambda e:errors.append(str(e)))
 q.evaluate('m=>{window.__fixture=JSON.stringify(m);window.fetch=async()=>new Response(window.__fixture,{status:200,headers:{"Content-Type":"application/json"}})}',fixture)
 q.set_content(HTML,wait_until='load')
 q.wait_for_function('()=>window.__sphere')
 q.evaluate('(m)=>__sphere.acceptMap(JSON.stringify(m),"Fictional capture")',fixture)
 q.wait_for_function('n=>__sphere.snapshot().nodes.length===n',arg=len(fixture['nodes']))
 return q
def set_mode(q,mode):
 q.locator('#open-settings').click();q.locator('#mode').select_option(mode);q.locator('#brand').select_option('none');q.locator('#close-settings').click()
def target_ids(q):
 return q.evaluate('''()=>{const m=__sphere.snapshot(),structural=new Set(['project','phase','group']),current=__sphere.state().camera.currentId;const preferred=m.nodes.find(n=>n.id===current&&!structural.has(n.kind)&&m.edges.some(e=>e.from===n.id||e.to===n.id));const a=preferred||m.nodes.find(n=>!structural.has(n.kind)&&m.edges.some(e=>e.from===n.id||e.to===n.id));const edge=m.edges.find(e=>e.from===a.id||e.to===a.id);return [a.id,edge.from===a.id?edge.to:edge.from];}''')
def center(q,node_id):
 return q.evaluate('''id=>{const e=[...document.querySelectorAll('.node')].find(e=>e.dataset.node===id),m=e.getScreenCTM();return {x:m.e,y:m.f};}''',node_id)
def capture(q,name):
 path=OUT/name;q.screenshot(path=str(path),full_page=True);shots.append(str(path.relative_to(R)));return path
with sync_playwright() as p:
 exe=os.environ.get('SPHERE_BROWSER') or shutil.which('chromium')
 browser=p.chromium.launch(headless=True,args=['--no-sandbox'],**({'executable_path':exe} if exe else {}))
 # One focused acceptance page for interaction semantics.
 q=page_for(browser,1440,fixtures['exhibition']);set_mode(q,'light')
 ok('read-only note is visible near board',('この盤は見るだけです' if LANG=='ja' else 'This board is read-only') in q.locator('#readonly-note').inner_text())
 q.locator('#open-settings').click();ok('only Core Plain is bundled as World',q.locator('#theme-grid .theme-card').count()==1 and 'Core Plain' in q.locator('#theme-grid').inner_text());ok('fictional brand sample is present','Example Studio' in q.locator('#brand').inner_text());q.locator('#close-settings').click()
 ids=target_ids(q);a,b=ids
 q.locator(f'[data-node="{a}"]').dispatch_event('pointerenter');q.wait_for_timeout(20)
 ok('hover records target and shows short tooltip',q.evaluate('__sphere.state().hovered')==a and q.locator('#hover-tooltip').get_attribute('visibility')=='visible' and (q.locator('#hover-tooltip').text_content() or '').strip()!='')
 ok('hover reveals related lines softly',q.evaluate('''id=>{const rel=[...document.querySelectorAll('.edge')].filter(e=>e.dataset.from===id||e.dataset.to===id),other=[...document.querySelectorAll('.edge')].find(e=>e.dataset.from!==id&&e.dataset.to!==id);return rel.some(e=>parseFloat(getComputedStyle(e).opacity)>=.28)&&(!other||parseFloat(getComputedStyle(other).opacity)<=.17)}''',a))
 q.locator(f'[data-node="{a}"]').dispatch_event('pointerleave');q.wait_for_timeout(20);ok('hover leaves cleanly',q.evaluate('__sphere.state().hovered') is None and q.locator('#hover-tooltip').get_attribute('visibility')=='hidden')
 # Focus and selection remain visually distinct.
 q.locator(f'[data-node="{a}"]').focus();ok('focused bead always shows focus mark',q.locator(f'[data-node="{a}"] .focus-mark').evaluate('(e)=>getComputedStyle(e).display')!='none')
 q.keyboard.press('Enter');ok('Enter selects focused bead and opens details',q.evaluate('__sphere.state().selected')==a and q.locator('#details h2').count()==1 and q.locator('#detail-panel').evaluate('(e)=>e.classList.contains("sheet-open")'))
 ok('focus and selection marks are distinct and both visible',q.locator(f'[data-node="{a}"] .focus-mark').evaluate('(e)=>getComputedStyle(e).display')!='none' and q.locator(f'[data-node="{a}"] .selection-mark').evaluate('(e)=>getComputedStyle(e).display')!='none' and q.locator(f'[data-node="{a}"] .focus-mark').get_attribute('stroke-dasharray')!=q.locator(f'[data-node="{a}"] .selection-mark').get_attribute('stroke-dasharray'))
 ok('relation words stay off the board when selected',q.evaluate('''()=>[...document.querySelectorAll('.edge-caption')].every(e=>getComputedStyle(e).display==='none')''') and ('関係と向き' if LANG=='ja' else 'Relations and direction') in q.locator('#details').inner_text())
 # Direct switch: click another bead without clearing first.
 q.locator(f'[data-node="{b}"]').dispatch_event('click');ok('clicking another bead switches selection directly',q.evaluate('__sphere.state().selected')==b)
 q.locator('#board').dispatch_event('click');ok('clicking empty board clears selection',q.evaluate('__sphere.state().selected') is None)
 # Keyboard-only arrow -> Enter -> Esc.
 q.locator(f'[data-node="{a}"]').focus();before=q.evaluate('document.activeElement.getAttribute("data-node")');q.keyboard.press('ArrowRight');after=q.evaluate('document.activeElement.getAttribute("data-node")')
 if after==before:
  q.keyboard.press('ArrowDown');after=q.evaluate('document.activeElement.getAttribute("data-node")')
 ok('arrow keys move focus to a nearby bead',after is not None and after!=before)
 q.keyboard.press('Enter');ok('keyboard selection opens details',q.evaluate('__sphere.state().selected')==after and q.locator('#details h2').count()==1)
 q.keyboard.press('Escape');ok('Escape returns to unselected state',q.evaluate('__sphere.state().selected') is None)
 # Japanese gate kind labels.
 ok('gate kind explicit matches viewer language',('明示' if LANG=='ja' else 'Explicit') in q.locator('[data-node="P1 01-90-00"] .node-labels').text_content())
 ok('gate kind recheck matches viewer language',('再判定' if LANG=='ja' else 'Recheck') in q.locator('[data-node="P1 01-91-00"] .node-labels').text_content())
 ok('gate kind event matches viewer language',('イベント' if LANG=='ja' else 'Event') in q.locator('[data-node="P1 02-91-00"] .node-labels').text_content())
 q.close()
 # Shape-list captures in both modes.
 for mode in ['light','dark']:
  q=page_for(browser,1000,fixtures['exhibition']);set_mode(q,mode);q.locator('.state-legend').evaluate('(e)=>e.open=true');
  ok(f'{mode} shape legend contains 15 + 6 entries',q.locator('#state-legend .state-legend-item').count()==21)
  path=OUT/f'state-shapes-{mode}.png';q.locator('.state-legend').screenshot(path=str(path));shots.append(str(path.relative_to(R)));q.close()
 # Requested 2 fixtures x 2 widths x 2 modes x hover/selected captures.
 for fixture_name,fixture in fixtures.items():
  for width,label in [(1440,'desktop'),(375,'375')]:
   for mode in ['light','dark']:
    q=page_for(browser,width,fixture);set_mode(q,mode);a,b=target_ids(q);q.locator(f'[data-node="{a}"]').dispatch_event('pointerenter');q.wait_for_timeout(30)
    ok(f'{fixture_name}/{label}/{mode} hover active',q.evaluate('__sphere.state().hovered')==a and q.locator('#hover-tooltip').get_attribute('visibility')=='visible')
    capture(q,f'{fixture_name}-{label}-{mode}-hover.png')
    q.locator(f'[data-node="{a}"]').dispatch_event('click');q.wait_for_timeout(20);ok(f'{fixture_name}/{label}/{mode} selection active',q.evaluate('__sphere.state().selected')==a)
    capture(q,f'{fixture_name}-{label}-{mode}-selected.png');q.close()
 # README source captures from the final built public viewer.
 for mode in ['light','dark']:
  q=page_for(browser,1440,fixtures['essay']);set_mode(q,mode);q.locator('#zoom-fit').click();q.wait_for_timeout(30);capture(q,f'readme-{mode}.png');q.close()
 ok('No uncaught JavaScript errors',not errors)
 browser.close()
report={'method':'Chromium set_content of final built index.html with explicit local fixture fetch; screenshots are real browser captures.','language':LANG,'browser':Path(exe).name if exe else 'Playwright Chromium','passed':len(checks),'failed':0,'errors':errors,'screenshots':shots,'checks':checks}
(VER/f'browser-finish-{LANG}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Browser finish: {len(checks)} passed, {len(shots)} screenshots, 0 failed')
