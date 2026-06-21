from playwright.sync_api import sync_playwright
import json, os, re, pathlib, time

BASE_URL = os.environ.get('QA_BASE_URL', 'http://127.0.0.1:4176/')
OUT_DIR = pathlib.Path('qa-artifacts/final-responsive')
STORAGE_KEY = 'diagnosis-center-change-pack-v1-state'
ADMIN_AUTH = {
    'role': 'admin', 'userName': 'System Admin', 'userId': 'AUTH-ADMIN', 'landing': 'admin-dashboard',
    'linkedDoctorId': '', 'hospitalId': '', 'username': 'admin', 'loginAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
}
roles_text = pathlib.Path('src/data/roles.js').read_text()
items = re.findall(r"\{\s*id:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'", roles_text)
# de-dupe keeping first; regex may match only nav items from NAV_ITEMS and possibly roles access? okay check.
seen=[]; nav=[]
for id_, label in items:
    if id_ not in seen and id_ not in ['doctor','receptionist','lab','scan','billing','admin']:
        seen.append(id_); nav.append((id_,label))

pages = [{'id':'login','label':'Login','public':True,'url':BASE_URL}]
pages += [{'id':id_, 'label':label, 'pageId':id_, 'url':BASE_URL} for id_,label in nav]
pages += [
    {'id':'public-report-verification','label':'Public report verification','publicHash':'#/verify-report/SEC-ORD001-DEMO','url':BASE_URL + '#/verify-report/SEC-ORD001-DEMO'},
    {'id':'public-patient-results','label':'Public patient result portal','publicHash':'#/patient/results/PAT-001','url':BASE_URL + '#/patient/results/PAT-001'},
]
viewports = [
    {'name':'phone','width':390,'height':844,'is_mobile':True},
    {'name':'desktop','width':1440,'height':900,'is_mobile':False},
]

def sanitize(name):
    return re.sub(r'[^a-z0-9_-]+','-',name, flags=re.I).strip('-').lower()

def seed_state_script(storage_key, auth, page_id=None, public=False):
    payload = None if public else {'auth': auth, 'currentPage': page_id or 'admin-dashboard', 'ui': {'sidebarOpen': False, 'toast': None}}
    return f"""
      window.localStorage.clear();
      if ({'true' if payload is not None else 'false'}) {{
        window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(json.dumps(payload))});
      }}
    """

def collect_metrics(page):
    return page.evaluate("""() => {
      const clientWidth = document.documentElement.clientWidth;
      const docScrollWidth = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0);
      const main = document.getElementById('main-content');
      const mainScrollWidth = main ? main.scrollWidth : 0;
      const mainClientWidth = main ? main.clientWidth : 0;
      const visibleText = (document.body?.innerText || '').slice(0, 240);
      const offenders = [];
      for (const el of Array.from(document.body.querySelectorAll('*'))) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const isFixedOffCanvas = style.position === 'fixed' && (rect.left >= clientWidth || rect.right <= 0);
        if (isFixedOffCanvas) continue;
        if (rect.right > clientWidth + 3 || rect.left < -3 || rect.width > clientWidth + 3) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            className: String(el.className || '').slice(0, 160),
            text: String(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
            rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }
          });
        }
        if (offenders.length >= 8) break;
      }
      const text = document.body?.innerText || '';
      const errorBoundaryVisible = /Something went wrong|Reset demo data and retry/i.test(text);
      const loginVisible = /Sign in|Quick role login/i.test(text);
      return {
        title: document.title,
        clientWidth,
        docScrollWidth,
        mainClientWidth,
        mainScrollWidth,
        bodyOverflow: docScrollWidth > clientWidth + 3,
        mainOverflow: main ? mainScrollWidth > mainClientWidth + 3 : false,
        errorBoundaryVisible,
        loginVisible,
        visibleText,
        offenders
      };
    }""")

OUT_DIR.mkdir(parents=True, exist_ok=True)
for p in OUT_DIR.glob('*'):
    if p.is_file(): p.unlink()

results=[]
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
    for vp in viewports:
        context = browser.new_context(
            viewport={'width':vp['width'], 'height':vp['height']},
            is_mobile=vp['is_mobile'],
            device_scale_factor=2 if vp['is_mobile'] else 1,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' if vp['is_mobile'] else None
        )
        context.route('**/api/**', lambda route: route.fulfill(status=503, content_type='application/json', body=json.dumps({'ok':False,'qa':'offline-api-simulated'})))
        console_errors=[]
        def setup_page(pg):
            pg.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
            pg.on('pageerror', lambda err: console_errors.append(str(err)))
        context.on('page', setup_page)
        for app_page in pages:
            page = context.new_page(); setup_page(page)
            err_before=len(console_errors)
            page.add_init_script(seed_state_script(STORAGE_KEY, ADMIN_AUTH, app_page.get('pageId'), app_page.get('public') or app_page.get('publicHash')))
            status='passed'; notes=[]; metrics=None; screenshot_path=None
            try:
                page.goto(app_page['url'], wait_until='networkidle', timeout=20000)
                page.wait_for_timeout(350)
                screenshot_path = str(OUT_DIR / f"{vp['name']}-{sanitize(app_page['id'])}.png")
                page.screenshot(path=screenshot_path, full_page=True)
                metrics = collect_metrics(page)
                new_errors=[e for e in console_errors[err_before:] if not re.search(r'Failed to load resource|404', e, re.I)]
                if metrics['bodyOverflow']:
                    notes.append(f"document horizontal overflow: {metrics['docScrollWidth']}px > {metrics['clientWidth']}px")
                if metrics['mainOverflow']:
                    notes.append(f"main horizontal overflow: {metrics['mainScrollWidth']}px > {metrics['mainClientWidth']}px")
                if metrics['errorBoundaryVisible']:
                    notes.append('error boundary visible')
                if not app_page.get('public') and app_page['id'] != 'login' and metrics['loginVisible']:
                    notes.append('unexpected login screen after auth seed')
                if new_errors:
                    notes.append('console/page errors: ' + ' | '.join(new_errors[:3]))
                if notes:
                    status='review'
            except Exception as e:
                status='failed'; notes.append(str(e))
            finally:
                results.append({'viewport':vp['name'], 'page':app_page['id'], 'label':app_page['label'], 'status':status, 'notes':notes, 'metrics':metrics, 'screenshot':screenshot_path})
                page.close()
        # interactions
        page = context.new_page(); setup_page(page)
        interaction={'viewport':vp['name'], 'page':'interaction-checks', 'label':'Header / sidebar / notification / user menu', 'status':'passed', 'notes':[]}
        page.add_init_script(seed_state_script(STORAGE_KEY, ADMIN_AUTH, 'admin-dashboard', False))
        try:
            page.goto(BASE_URL, wait_until='networkidle', timeout=20000); page.wait_for_timeout(300)
            if vp['name']=='phone':
                loc=page.locator('button[aria-label*="Open navigation"], button:has-text("☰")').first
                try:
                    if loc.count():
                        loc.click(); page.wait_for_timeout(150)
                        drawer_visible = page.locator('[role="dialog"][aria-label*="navigation" i], aside').first.is_visible()
                        if not drawer_visible: interaction['notes'].append('mobile drawer did not become visible')
                        page.screenshot(path=str(OUT_DIR/f"{vp['name']}-interaction-sidebar-open.png"), full_page=True)
                        page.keyboard.press('Escape')
                    else: interaction['notes'].append('mobile navigation button not found')
                except Exception as e: interaction['notes'].append('mobile drawer check error: '+str(e))
            try:
                nb=page.locator('button[aria-label*="notification" i]').first
                if nb.count():
                    nb.click(); page.wait_for_timeout(150); page.screenshot(path=str(OUT_DIR/f"{vp['name']}-interaction-notifications.png"), full_page=True); page.keyboard.press('Escape')
                else: interaction['notes'].append('notification button not found')
            except Exception as e: interaction['notes'].append('notification check error: '+str(e))
            try:
                ub=page.locator('button[aria-label*="user" i], button:has-text("System Admin"), button:has-text("Admin")').first
                if ub.count():
                    ub.click(); page.wait_for_timeout(150); page.screenshot(path=str(OUT_DIR/f"{vp['name']}-interaction-user-menu.png"), full_page=True)
                else: interaction['notes'].append('user menu button not found')
            except Exception as e: interaction['notes'].append('user menu check error: '+str(e))
            metrics=collect_metrics(page)
            if metrics['bodyOverflow']: interaction['notes'].append(f"interaction overflow: {metrics['docScrollWidth']}px > {metrics['clientWidth']}px")
            if interaction['notes']: interaction['status']='review'
        except Exception as e:
            interaction['status']='failed'; interaction['notes'].append(str(e))
        finally:
            results.append(interaction); page.close()
        context.close()
    browser.close()
summary={
    'generatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'baseURL': BASE_URL,
    'pageCount': len(pages),
    'viewportCount': len(viewports),
    'totals': {
        'passed': sum(1 for r in results if r['status']=='passed'),
        'review': sum(1 for r in results if r['status']=='review'),
        'failed': sum(1 for r in results if r['status']=='failed'),
        'total': len(results)
    },
    'results': results
}
(OUT_DIR/'final-responsive-qa-results.json').write_text(json.dumps(summary, indent=2))
print(json.dumps(summary['totals'], indent=2))
for r in results:
    if r['status']!='passed':
        print(f"{r['viewport']} {r['page']}: {'; '.join(r['notes'])}")
