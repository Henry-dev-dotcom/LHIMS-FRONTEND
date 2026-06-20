import fs from 'node:fs';

const header = fs.readFileSync('src/layouts/Header.jsx', 'utf8');
const sidebar = fs.readFileSync('src/layouts/Sidebar.jsx', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = [
  {
    pass: header.includes('userMenuOpen') && header.includes('userMenuRef') && header.includes('aria-label="Open user menu"'),
    message: 'Header must include a top-right user menu trigger.'
  },
  {
    pass: header.includes('Signed in as') && header.includes('dispatch({ type: \'LOGOUT\' })') && header.includes('<LogOut className="h-4 w-4" /> Sign Out'),
    message: 'Header user menu must show user details and sign-out action.'
  },
  {
    pass: header.includes('document.addEventListener(\'mousedown\'') && header.includes('Escape') && header.includes('setUserMenuOpen(false)'),
    message: 'User menu must close when clicking outside or pressing Escape.'
  },
  {
    pass: !sidebar.includes('Signed in as') && !sidebar.includes('Sign Out') && !sidebar.includes('LOGOUT'),
    message: 'Sidebar must no longer contain the signed-in card or sign-out button.'
  },
  {
    pass: /^12\.(1[3-9]|[2-9][0-9])\.0$/.test(pkg.version),
    message: 'Frontend version must remain at Stage 23 or newer.'
  }
];

const failed = checks.filter((check) => !check.pass);
if (failed.length) {
  console.error('Stage 23 header user menu QA failed:');
  for (const item of failed) console.error(`- ${item.message}`);
  process.exit(1);
}

console.log('Stage 23 top-right header user menu QA passed.');
