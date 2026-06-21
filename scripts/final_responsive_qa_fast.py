from playwright.sync_api import sync_playwright
import json, os, re, pathlib, time
BASE_URL=os.environ.get('QA_BASE_URL','http://127.0.0.1:8008/')
OUT_DIR=pathlib.Path('qa-artifacts/final-responsive-fast')
STORAGE_KEY='diagnosis-center-change-pack-v1-state'
ADMIN_AUTH={'role':'admin','userName':'System Admin','userId':'AUTH-ADMIN','landing':'admin-dashboard','linkedDoctorId':'','hospitalId':'','username':'admin','loginAt':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
roles_text=pathlib.Path('src/data/roles.js').read_text()
items=re.findall(r"\{\s*id:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'", roles_text)
seen=[]; nav=[]
for id_,label in items:
    if id_ not in seen and id_ not in ['doctor','receptionist','lab','scan','billing','admin']:
        seen.append(id_); nav.append((id_,label))
pages=[{'id':'login','label':'Login','public':True,'url':BASE_URL}] + [{'id':i,'label':l,'pageId':i,'url':BASE_URL} for i,l in nav] + [
 {'id':'public-report-verification','label':'Public report verification','publicHash':True,'url':BASE_URL+'#/verify-report/SEC-ORD001-DEMO'},
 {'id':'public-patient-results','label':'Public patient result portal','publicHash':True,'url':BASE_URL+'#/patient/results/PAT-001'}]
viewports=[{'name':'phone','width':390,'height':844,'is_mobile':True},{'name':'desktop','width':1440,'height':900,'is_mobile':False}]
def sanitize(s): return re.sub(r'[^a-z0-9_-]+','-',s,flags=re.I).strip('-').lower()
def state_script(page_id=None, public=False):
    if public: return "window.localStorage.clear();"
    payload={'auth':ADMIN_AUTH,'currentPage':page_id or 'admin-dashboard','ui':{'sidebarOpen':False,'toast':None}}
    return f"window.localStorage.clear(); window.localStorage.setItem({json.dumps(STORAGE_KEY)}, {json.dumps(json.dumps(payload))});"
def metrics(page):
    return page.evaluate("""() => {
      const cw=document.documentElement.clientWidth;
      const sw=Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth||0);
      const main=document.getElementById('main-content');
      const mw=main?main.scrollWidth:0, mc=main?main.clientWidth:0;
      const text=document.body?.innerText||'';
      const offenders=[];
      for (const el of Array.from(document.body.querySelectorAll('*'))) {
        const st=getComputedStyle(el); if (st.display==='none'||st.visibility==='hidden'||st.opacity==='0') continue;
        const r=el.getBoundingClientRect(); if(!r.width||!r.height) continue;
        if(st.position==='fixed' && (r.left>=cw || r.right<=0)) continue;
        if(r.right>cw+3 || r.left<-3 || r.width>cw+3) {offenders.push({tag:el.tagName.toLowerCase(), cls:String(el.className||'').slice(0,100), text:String(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80), rect:{l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width)}})}
        if(offenders.length>=5) break;
      }
      return {clientWidth:cw, docScrollWidth:sw, mainClientWidth:mc, mainScrollWidth:mw, bodyOverflow:sw>cw+3, mainOverflow:main?mw>mc+3:false, errorBoundaryVisible:/Something went wrong|Reset demo data/i.test(text), loginVisible:/Sign in|Quick role login/i.test(text), text:text.slice(0,200), offenders};
    }""")
OUT_DIR.mkdir(parents=True, exist_ok=True)
for f in OUT_DIR.glob('*'): f.unlink()
results=[]
with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
  for vp in viewports:
    context=browser.new_context(viewport={'width':vp['width'],'height':vp['height']}, is_mobile=vp['is_mobile'], device_scale_factor=2 if vp['is_mobile'] else 1, service_workers='block', user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' if vp['is_mobile'] else None)
    context.route('**/api/**', lambda route: route.fulfill(status=503, content_type='application/json', body='{"ok":false}'))
    for app_page in pages:
      page=context.new_page(); console=[]
      page.on('console', lambda msg: console.append(msg.text) if msg.type == 'error' else None)
      page.on('pageerror', lambda e: console.append(str(e)))
      page.add_init_script(state_script(app_page.get('pageId'), app_page.get('public') or app_page.get('publicHash')))
      notes=[]; status='passed'; m=None; shot=None
      try:
        page.goto(app_page['url'], wait_until='domcontentloaded', timeout=10000)
        page.wait_for_timeout(250)
        shot=str(OUT_DIR/f"{vp['name']}-{sanitize(app_page['id'])}.png")
        page.screenshot(path=shot, full_page=False)
        m=metrics(page)
        errs=[e for e in console if not re.search(r'Failed to load resource|404|503', e, re.I)]
        if m['bodyOverflow']: notes.append(f"document horizontal overflow: {m['docScrollWidth']}px > {m['clientWidth']}px; offenders={m['offenders'][:2]}")
        if m['mainOverflow']: notes.append(f"main horizontal overflow: {m['mainScrollWidth']}px > {m['mainClientWidth']}px")
        if m['errorBoundaryVisible']: notes.append('error boundary visible')
        if app_page['id']!='login' and not app_page.get('public') and m['loginVisible']: notes.append('unexpected login screen')
        if errs: notes.append('console errors: '+' | '.join(errs[:2]))
        if notes: status='review'
      except Exception as e:
        status='failed'; notes.append(str(e))
      results.append({'viewport':vp['name'],'page':app_page['id'],'label':app_page['label'],'status':status,'notes':notes,'metrics':m,'screenshot':shot})
      page.close()
    # interactions
    page=context.new_page(); page.add_init_script(state_script('admin-dashboard', False)); notes=[]; status='passed'
    try:
      page.goto(BASE_URL, wait_until='domcontentloaded', timeout=10000); page.wait_for_timeout(250)
      if vp['name']=='phone':
        btn=page.locator('button[aria-label*="Open navigation"], button:has-text("☰")').first
        if btn.count(): btn.click(); page.wait_for_timeout(150); page.screenshot(path=str(OUT_DIR/f"{vp['name']}-interaction-sidebar.png")); page.keyboard.press('Escape')
        else: notes.append('mobile nav button not found')
      nb=page.locator('button[aria-label*="notification" i]').first
      if nb.count(): nb.click(); page.wait_for_timeout(150); page.screenshot(path=str(OUT_DIR/f"{vp['name']}-interaction-notifications.png")); page.keyboard.press('Escape')
      else: notes.append('notification button not found')
      ub=page.locator('button[aria-label*="user" i], button:has-text("System Admin"), button:has-text("Admin")').first
      if ub.count(): ub.click(); page.wait_for_timeout(150); page.screenshot(path=str(OUT_DIR/f"{vp['name']}-interaction-user-menu.png"))
      else: notes.append('user menu button not found')
      m=metrics(page)
      if m['bodyOverflow']: notes.append(f"interaction overflow: {m['docScrollWidth']}px > {m['clientWidth']}px")
      if notes: status='review'
    except Exception as e: status='failed'; notes.append(str(e))
    results.append({'viewport':vp['name'],'page':'interaction-checks','label':'Header / sidebar / notification / user menu','status':status,'notes':notes})
    page.close(); context.close()
  browser.close()
summary={'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),'baseURL':BASE_URL,'pageCount':len(pages),'viewportCount':len(viewports),'totals':{'passed':sum(r['status']=='passed' for r in results),'review':sum(r['status']=='review' for r in results),'failed':sum(r['status']=='failed' for r in results),'total':len(results)},'results':results}
(OUT_DIR/'final-responsive-qa-results.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary['totals'],indent=2))
for r in results:
  if r['status']!='passed': print(f"{r['viewport']} {r['page']}: {'; '.join(r['notes'])}")
