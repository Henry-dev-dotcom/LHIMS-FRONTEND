from playwright.sync_api import sync_playwright
import json, os, re, pathlib, time
BASE_URL=os.environ.get('QA_BASE_URL','http://127.0.0.1:8008/')
OUT_DIR=pathlib.Path('qa-artifacts/final-responsive-metrics')
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
def state_script(page_id=None, public=False):
    if public: return "window.localStorage.clear();"
    payload={'auth':ADMIN_AUTH,'currentPage':page_id or 'admin-dashboard','ui':{'sidebarOpen':False,'toast':None}}
    return f"window.localStorage.clear(); window.localStorage.setItem({json.dumps(STORAGE_KEY)}, {json.dumps(json.dumps(payload))});"
def collect(page):
    return page.evaluate("""() => {
      const cw=document.documentElement.clientWidth;
      const ch=document.documentElement.clientHeight;
      const sw=Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth||0);
      const sh=Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight||0);
      const main=document.getElementById('main-content');
      const header=document.querySelector('header');
      const bottomNav=document.querySelector('[data-testid="mobile-bottom-nav"], nav[aria-label*="mobile" i], .mobile-bottom-nav');
      const text=document.body?.innerText||'';
      const offenders=[];
      for (const el of Array.from(document.body.querySelectorAll('*'))) {
        const st=getComputedStyle(el); if (st.display==='none'||st.visibility==='hidden'||st.opacity==='0') continue;
        const r=el.getBoundingClientRect(); if(!r.width||!r.height) continue;
        if(st.position==='fixed' && (r.left>=cw || r.right<=0)) continue;
        if(r.right>cw+3 || r.left<-3 || r.width>cw+3) {offenders.push({tag:el.tagName.toLowerCase(), cls:String(el.className||'').slice(0,100), text:String(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,80), rect:{l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width)}})}
        if(offenders.length>=6) break;
      }
      const interactive = Array.from(document.querySelectorAll('button,a,input,select,textarea,[role="button"]')).filter(el => {
        const st=getComputedStyle(el); const r=el.getBoundingClientRect();
        return st.display!=='none' && st.visibility!=='hidden' && r.width>0 && r.height>0 && r.bottom>=0 && r.top<=ch && r.right>=0 && r.left<=cw;
      });
      const tinyTargets = interactive.filter(el => {const r=el.getBoundingClientRect(); return r.width<32 || r.height<32;}).slice(0,8).map(el => {const r=el.getBoundingClientRect(); return {tag:el.tagName.toLowerCase(), text:String(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,60), w:Math.round(r.width), h:Math.round(r.height)}});
      return {cw,ch,sw,sh,bodyOverflow:sw>cw+3, mainOverflow:main?main.scrollWidth>main.clientWidth+3:false, mainScrollWidth:main?main.scrollWidth:0, mainClientWidth:main?main.clientWidth:0, headerHeight:header?Math.round(header.getBoundingClientRect().height):0, bottomNavVisible:bottomNav?getComputedStyle(bottomNav).display!=='none':false, errorBoundaryVisible:/Something went wrong|Reset demo data/i.test(text), loginVisible:/Sign in|Quick role login/i.test(text), text:text.slice(0,180), offenders, tinyTargets};
    }""")
OUT_DIR.mkdir(parents=True, exist_ok=True)
results=[]
with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
  for vp in viewports:
    ctx=pw.chromium # placeholder
    context=browser.new_context(viewport={'width':vp['width'],'height':vp['height']}, is_mobile=vp['is_mobile'], device_scale_factor=1, service_workers='block', user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' if vp['is_mobile'] else None)
    context.route('**/api/**', lambda route: route.fulfill(status=503, content_type='application/json', body='{"ok":false}'))
    for app_page in pages:
      page=context.new_page(); console=[]
      page.on('console', lambda msg: console.append(msg.text) if msg.type == 'error' else None)
      page.on('pageerror', lambda e: console.append(str(e)))
      page.add_init_script(state_script(app_page.get('pageId'), app_page.get('public') or app_page.get('publicHash')))
      status='passed'; notes=[]; m=None
      try:
        page.goto(app_page['url'], wait_until='commit', timeout=5000)
        page.wait_for_load_state('domcontentloaded', timeout=5000)
        page.wait_for_timeout(120)
        m=collect(page)
        errs=[e for e in console if not re.search(r'Failed to load resource|404|503', e, re.I)]
        if m['bodyOverflow']: notes.append(f"document overflow {m['sw']} > {m['cw']} offenders={m['offenders'][:2]}")
        if m['mainOverflow']: notes.append(f"main overflow {m['mainScrollWidth']} > {m['mainClientWidth']}")
        if m['errorBoundaryVisible']: notes.append('error boundary visible')
        if app_page['id']!='login' and not app_page.get('public') and m['loginVisible']: notes.append('unexpected login screen')
        if vp['name']=='phone' and m['headerHeight']>170: notes.append(f"mobile header too tall: {m['headerHeight']}px")
        # Tiny targets are informational unless there are many on phone; some icon spans are okay.
        if vp['name']=='phone' and len(m['tinyTargets'])>6: notes.append(f"many small visible tap targets: {m['tinyTargets'][:3]}")
        if errs: notes.append('console errors: '+' | '.join(errs[:2]))
        if notes: status='review'
      except Exception as e:
        status='failed'; notes.append(str(e))
      results.append({'viewport':vp['name'],'page':app_page['id'],'label':app_page['label'],'status':status,'notes':notes,'metrics':m})
      page.close()
    # interaction checks
    page=context.new_page(); page.add_init_script(state_script('admin-dashboard', False)); notes=[]; status='passed'
    try:
      page.goto(BASE_URL, wait_until='commit', timeout=5000); page.wait_for_load_state('domcontentloaded'); page.wait_for_timeout(150)
      if vp['name']=='phone':
        btn=page.locator('button[aria-label*="Open navigation"], button:has-text("☰")').first
        if btn.count():
          btn.click(); page.wait_for_timeout(150)
          if not page.locator('[role="dialog"][aria-label*="navigation" i], aside').first.is_visible(): notes.append('mobile drawer did not open')
          page.keyboard.press('Escape'); page.wait_for_timeout(100)
        else: notes.append('mobile nav button not found')
      nb=page.locator('button[aria-label*="notification" i]').first
      if nb.count(): nb.click(); page.wait_for_timeout(100); page.keyboard.press('Escape')
      else: notes.append('notification button not found')
      ub=page.locator('button[aria-label*="user" i], button:has-text("System Admin"), button:has-text("Admin")').first
      if ub.count(): ub.click(); page.wait_for_timeout(100)
      else: notes.append('user menu button not found')
      m=collect(page)
      if m['bodyOverflow']: notes.append(f"interaction overflow {m['sw']} > {m['cw']}")
      if notes: status='review'
    except Exception as e:
      status='failed'; notes.append(str(e))
    results.append({'viewport':vp['name'],'page':'interaction-checks','label':'Header/sidebar/notification/user-menu','status':status,'notes':notes})
    page.close(); context.close()
  browser.close()
summary={'generatedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),'baseURL':BASE_URL,'pageCount':len(pages),'viewportCount':len(viewports),'totals':{'passed':sum(r['status']=='passed' for r in results),'review':sum(r['status']=='review' for r in results),'failed':sum(r['status']=='failed' for r in results),'total':len(results)},'results':results}
(OUT_DIR/'final-responsive-metrics-results.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary['totals'],indent=2))
for r in results:
  if r['status']!='passed': print(f"{r['viewport']} {r['page']}: {'; '.join(r['notes'])}")
