"""Additional v0.6.0 checks using real file URLs and the read-only HTTP server."""
from pathlib import Path
import json, os, socket, subprocess
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
checks=[];errors=[]
def ok(name,value=True):
 assert value,name
 checks.append({'name':name,'passed':True})
def no_japanese(q):
 return q.evaluate('''()=>!/[\\u3040-\\u30ff\\u3400-\\u9fff\\uf900-\\ufaff]/u.test(document.body.innerText + [...document.querySelectorAll('[aria-label],[title]')].map(e=>(e.getAttribute('aria-label')||'')+(e.getAttribute('title')||'')).join(''))''')
with socket.socket() as s:
 s.bind(('127.0.0.1',0));port=s.getsockname()[1]
server=subprocess.Popen(['node','tools/sphere.mjs','serve','--map','examples/essay.json','--port',str(port)],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
try:
 assert 'Sphere Board:' in server.stdout.readline()
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=['--no-sandbox'],**({'executable_path':os.environ['SPHERE_BROWSER']} if os.environ.get('SPHERE_BROWSER') else {}))
  for lang,html in [('en','index.html'),('ja','ja/index.html')]:
   q=browser.new_page(viewport={'width':1440,'height':1000});q.on('pageerror',lambda e:errors.append(str(e)))
   q.goto((R/html).as_uri());q.wait_for_function('()=>window.__sphere')
   expected=json.loads((R/('examples/ja/essay.json' if lang=='ja' else 'examples/essay.json')).read_text())
   ok(lang+': real file URL opens with correct bundled sample',q.evaluate('__sphere.snapshot()')==expected)
   if lang=='en':
    ok('English built-in UI and ARIA contain no Japanese',no_japanese(q))
    for node in expected['nodes']:
     q.locator('[data-node='+json.dumps(node['id'])+']').dispatch_event('click');ok('English details and ARIA: '+node['id'],no_japanese(q))
    q.keyboard.press('Escape');q.locator('#view-list').click();q.locator('#search').fill('nonexistent-node-0x123');ok('English empty search',no_japanese(q) and q.locator('.empty').inner_text()=='No matching nodes.')
    q.locator('#view-map').click();q.locator('#open-settings').click();q.locator('#brand').select_option('example-studio');ok('English theme settings',no_japanese(q));q.keyboard.press('Escape')
    q.locator('#map-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{broken'})
    q.wait_for_function('()=>document.querySelector("#map-file").value===""')
    ok('English JSON error',no_japanese(q) and 'error' in q.locator('#notice').get_attribute('class'))
    q.locator('#map-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"profile":"other/9"}'})
    q.wait_for_function('()=>document.querySelector("#map-file").value===""')
    ok('English unsupported-map errors',no_japanese(q) and q.evaluate('__sphere.state().loadBlocked'))
    empty=json.loads((R/'templates/project/.sphere/map.json').read_text());empty['nodes']=[];empty['currents']=[];empty['edges']=[];empty['meta']={'title':'Fictional empty plan'}
    q.locator('#map-file').set_input_files({'name':'empty.json','mimeType':'application/json','buffer':json.dumps(empty).encode()})
    q.wait_for_function('()=>document.querySelector("#map-file").value===""')
    ok('English empty board',no_japanese(q) and q.locator('[data-node]').count()==0 and 'Add a plan' in q.locator('#board').text_content())
    q.locator('#map-file').set_input_files(str(R/'examples/ja/essay.json'))
    q.wait_for_function('()=>document.querySelector("#map-file").value===""')
    ok('English viewer accepts Japanese data verbatim',q.evaluate('__sphere.snapshot()')==json.loads((R/'examples/ja/essay.json').read_text()) and q.locator('#go-current').inner_text()=='Go to current')
   q.close()
   q=browser.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
   q.goto(f'http://127.0.0.1:{port}/'+('ja/' if lang=='ja' else ''));q.wait_for_function('()=>window.__sphere && __sphere.state().source.includes("'+('接続' if lang=='ja' else 'Connected')+'")')
   ok(lang+': real HTTP viewer reads selected map',q.evaluate('__sphere.snapshot()')==json.loads((R/'examples/essay.json').read_text()))
   ok(lang+': selected map has not been rewritten',json.loads((R/'examples/essay.json').read_text())==q.evaluate('__sphere.snapshot()'))
   q.close()
  ok('No uncaught JavaScript errors',not errors);browser.close()
finally:
 server.terminate();server.wait(timeout=5)
(R/'verification/browser-bilingual.json').write_text(json.dumps({'method':'Real Chromium file URL and loopback HTTP navigation; read-only Node server; actual file input paths.','passed':len(checks),'failed':0,'errors':errors,'checks':checks},ensure_ascii=False,indent=2)+'\n')
print(f'Bilingual browser checks: {len(checks)} passed, 0 failed')
