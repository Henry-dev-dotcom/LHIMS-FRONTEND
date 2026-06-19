import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rolesSource = fs.readFileSync(path.join(root, 'src/data/roles.js'), 'utf8');
const registrySource = fs.readFileSync(path.join(root, 'src/routes/routeRegistry.js'), 'utf8');
const navBlock = rolesSource.split('export const NAV_ITEMS = ')[1] || '';
const navIds = [...navBlock.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
const quotedKeys = [...registrySource.matchAll(/['\"]([^'\"]+)['\"]:\s*\{/g)].map((m) => m[1]);
const bareKeys = [...registrySource.matchAll(/\n\s{2}([a-zA-Z][a-zA-Z0-9_-]*):\s*\{/g)].map((m) => m[1]);
const pageIds = new Set([...quotedKeys, ...bareKeys]);
const dashboardIds = new Set(['overview','doctor-dashboard','reception-dashboard','lab-dashboard','scan-dashboard','billing-dashboard','admin-dashboard']);
const missing = navIds.filter((id) => !dashboardIds.has(id) && !pageIds.has(id));
if (missing.length) {
  console.error('Missing route metadata:', missing.join(', '));
  process.exit(1);
}
console.log(`Route registry covers all ${navIds.length} navigation items.`);
