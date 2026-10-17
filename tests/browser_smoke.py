"""Render and interact with the generated HTML in Chromium without URL navigation.
Uses injected HTML + mocked fetch of our own fixture, not a hosted end-to-end test.
The real read-only HTTP server is exercised separately in cli.test.cjs.
"""
from pathlib import Path
import copy, json, os, shutil, time
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];(R/'preview').mkdir(exist_ok=True);(R/'verification').mkdir(exist_ok=True)
HTML=(R/'index.html').read_text();sample=json.loads((R/'examples/sample-map.json').read_text())
worlds=[json.loads(p.read_text()) for p in sorted((R/'themes/world').glob('*.json'))]
checks=[];errors=[]
def ok(name,condition=True):
 assert condition,name
 checks.append({'name':name,'passed':True})
def wait(page, predicate, timeout=6000):
 deadline=time.monotonic()+timeout/1000
 while time.monotonic()<deadline:
  if page.evaluate(predicate):return
  page.wait_for_timeout(60)
 raise AssertionError("Timed out: "+predicate)
def init_page(browser,width):
 page=browser.new_page(viewport={'width':width,'height':960},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate('''sample=>{window.__fixtureText=JSON.stringify(sample);window.fetch=async()=>new Response(window.__fixtureText,{status:200,headers:{'Content-Type':'application/json'}});}''',sample)
 page.set_content(HTML,wait_until='load');wait(page, 'window.__sphere && document.querySelectorAll("[data-node]").length===12')
 return page
with sync_playwright() as p:
 exe=os.environ.get('SPHERE_BROWSER') or shutil.which('chromium')
 args={'headless':True,'args':['--no-sandbox']}
 if exe:args['executable_path']=exe
 browser=p.chromium.launch(**args)
 page=init_page(browser,1440)
 ok('Initial board has 12 nodes and settings are closed',not page.locator('#settings').is_visible())
 ok('Initial semantic snapshot equals fixture',page.evaluate('__sphere.snapshot()')==sample)
 page.screenshot(path=str(R/'preview/plain-desktop.png'),full_page=True)
 page.locator('[data-node="renderer"]').focus();page.keyboard.press('Enter')
 ok('Keyboard selects node independently of 3 currents',page.evaluate('__sphere.state().selected')=='renderer' and len(page.evaluate('__sphere.snapshot().currents'))==3)
 fixed_gate=page.locator('[data-node="quality"] .shell').get_attribute('d')
 page.locator('#open-settings').click()
 ok('Theme Lab initially folded',not page.locator('details.lab').first.get_attribute('open'))
 for w in worlds:
  for mode in ['light','dark']:
   for brand in ['none','example-studio']:
    page.locator('[data-world="'+w['id']+'"]').click();page.locator('#mode').select_option(mode);page.locator('#brand').select_option(brand)
    ok(f'Unchanged semantics {w["id"]}/{mode}/{brand}',page.evaluate('__sphere.snapshot()')==sample and page.evaluate('__sphere.state().selected')=='renderer' and page.locator('[data-node="quality"] .shell').get_attribute('d')==fixed_gate)
 page.locator('[data-world="plain"]').click();page.locator('#mode').select_option('dark');page.locator('#brand').select_option('none')
 page.locator('#close-settings').click();page.screenshot(path=str(R/'preview/plain-dark-desktop.png'),full_page=True)
 page.locator('#open-settings').click();page.screenshot(path=str(R/'preview/settings-theme-lab.png'),full_page=True)
 page.keyboard.press('Escape')
 ok('Escape closes dialog and focus returns',not page.locator('#settings').is_visible() and page.evaluate('document.activeElement.id')=='open-settings')
 # User theme upload goes through the actual file-input path.
 custom=json.loads((R/'templates/theme.world.json').read_text())
 page.locator('#theme-file').set_input_files({'name':'my-theme.json','mimeType':'application/json','buffer':json.dumps(custom).encode()})
 wait(page, 'document.querySelector("#theme-file").value===""')
 ok('User theme upload preserves map',page.evaluate('__sphere.state().world')==custom['id'] and page.evaluate('__sphere.snapshot()')==sample)
 bad=copy.deepcopy(custom);bad['slots']={'gate.shell':{'shape':'circle'}}
 prev=page.evaluate('__sphere.state().world')
 page.locator('#theme-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':json.dumps(bad).encode()})
 wait(page, 'document.querySelector("#theme-file").value===""')
 ok('Semantic slot injection rejected and old theme retained',page.evaluate('__sphere.state().world')==prev and page.locator('#notice').get_attribute('class').find('error')>=0)
 # Runtime reload is simulated, while the HTTP server has its own network tests.
 nextmap=copy.deepcopy(sample);nextmap.update(revision=1,updatedAt='2026-10-05T01:00:00.000Z',updatedBy='builder',lastChange='Synthetic browser test')
 nextmap['nodes'][3]['description']='Changed by simulated worker.'
 page.evaluate('text=>window.__fixtureText=text',json.dumps(nextmap));wait(page, '__sphere.snapshot().revision===1',timeout=6000)
 ok('Polling reads a valid updated revision and keeps selection',page.evaluate('__sphere.state().selected')=='renderer')
 page.evaluate('window.__fixtureText="{invalid json"');wait(page, 'document.querySelector("#notice").classList.contains("error") && document.querySelector("#notice").textContent.includes("再読込")',timeout=6000)
 ok('Invalid reload keeps last valid map',page.evaluate('__sphere.snapshot().revision')==1)
 page.evaluate('text=>window.__fixtureText=text',json.dumps(nextmap));wait(page, 'document.querySelector("#notice").hidden',timeout=6000)
 ok('Recovery clears stale error')
 # Text injection is data only. Hand-loaded maps intentionally stop polling.
 hostile=copy.deepcopy(sample);hostile['nodes'][0]['label']='<img src=x onerror="window.bad=1">'
 page.locator('#map-file').set_input_files({'name':'literal-label.json','mimeType':'application/json','buffer':json.dumps(hostile).encode()})
 wait(page, 'document.querySelector("#map-file").value===""')
 ok('HTML-like labels render as text, not elements',not page.evaluate('Boolean(window.bad)') and page.locator('img').count()==0 and page.evaluate('__sphere.snapshot().nodes[0].label')==hostile['nodes'][0]['label'])
 unsupported={'schema':'control'+'-map/0.2','project_key':'fictional'}
 page.locator('#map-file').set_input_files({'name':'unsupported.json','mimeType':'application/json','buffer':json.dumps(unsupported).encode()})
 wait(page, 'document.querySelector("#map-file").value===""')
 ok('Unsupported input stops drawing with a clear Starter-only message',page.evaluate('__sphere.state().loadBlocked') and 'この形は読めません' in page.locator('#problems').inner_text())
 page.locator('#map-file').set_input_files({'name':'sample.json','mimeType':'application/json','buffer':json.dumps(sample).encode()})
 wait(page, 'document.querySelector("#map-file").value===""')
 ok('Valid Starter map recovers from blocked drawing',not page.evaluate('__sphere.state().loadBlocked') and page.locator('[data-node]').count()==12)
 page.close()
 for width in [320,375,768,1280]:
  q=init_page(browser,width)
  ok(f'{width}px body does not horizontally overflow',q.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  q.locator('#view-list').click();q.locator('#search').fill('workflow')
  ok(f'{width}px searchable list works',q.locator('.list-item').count()==1)
  q.locator('.list-item').click()
  ok(f'{width}px details available',q.locator('#details h2').inner_text()=='AI更新ルール')
  q.locator('#view-map').click()
  q.locator('#open-settings').click();q.locator('#mode').select_option('dark');q.locator('[data-world="plain"]').click()
  ok(f'{width}px settings fit',q.locator('#settings').bounding_box()['width']<=width)
  if width==375:q.screenshot(path=str(R/'preview/mobile-settings-375.png'),full_page=True)
  q.locator('#close-settings').click()
  if width==375:q.screenshot(path=str(R/'preview/mobile-375.png'),full_page=True)
  q.emulate_media(reduced_motion='reduce',forced_colors='active')
  ok(f'{width}px reduced-motion/forced-colors retains all nodes',q.locator('[data-node]').count()==12)
  q.close()
 ok('No uncaught browser JavaScript errors',not errors)

 browser.close()
report={'method':'Chromium set_content of generated HTML; local fixture fetch mocked. No browser URL/file navigation tested. Real HTTP tested in Node suite.','browser':exe or 'Playwright Chromium','passed':len(checks),'failed':0,'errors':errors,'checks':checks}
(R/'verification/browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Browser smoke:',len(checks),'passed, 0 failed')
