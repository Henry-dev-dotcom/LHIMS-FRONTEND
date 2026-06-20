import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];

const tabPath = 'src/pages/reception/ReceptionPageTabs.jsx';
const walkinsPath = 'src/pages/reception/ReceptionWalkInsPage.jsx';

if (!exists(tabPath)) failures.push('ReceptionPageTabs component is missing.');
if (!exists(walkinsPath)) failures.push('ReceptionWalkInsPage is missing.');

const router = read('src/routes/AppRouter.jsx');
if (!router.includes('ReceptionWalkInsPage') || !router.includes("pageId === 'reception-walkins'")) {
  failures.push('Reception walk-ins route is not wired in AppRouter.');
}

const roles = read('src/data/roles.js');
if (!roles.includes("id: 'reception-walkins'") || !roles.includes("label: 'Walk-Ins'")) {
  failures.push('Reception walk-ins navigation item is missing from role navigation.');
}

const registry = read('src/routes/routeRegistry.js');
if (!registry.includes("'reception-walkins'") || !registry.includes('Dedicated walk-in intake page')) {
  failures.push('Reception walk-ins page metadata is missing.');
}

const receptionPages = [
  'src/pages/reception/IncomingOrdersPage.jsx',
  'src/pages/reception/PatientCheckInPage.jsx',
  'src/pages/reception/ReceptionWalkInsPage.jsx',
  'src/pages/reception/AppointmentsPage.jsx',
  'src/pages/reception/ReceptionDailyVisitsPage.jsx',
  'src/pages/reception/ReceptionResultsInboxPage.jsx'
];

receptionPages.forEach((file) => {
  const content = read(file);
  if (!content.includes('ReceptionPageTabs')) failures.push(`${file} does not render page-level reception section tabs.`);
  if (content.includes('ReceptionWorkflowNav')) failures.push(`${file} still renders the wrong cross-page reception workflow navigation.`);
});

const checkIn = read('src/pages/reception/PatientCheckInPage.jsx');
if (checkIn.includes('Walk-in registration form') || checkIn.includes('CREATE_WALK_IN_PATIENT')) {
  failures.push('Patient Check-In page still contains the walk-in registration workflow instead of being segmented.');
}

const walkins = read(walkinsPath);
if (!walkins.includes('CREATE_WALK_IN_PATIENT') || !walkins.includes('Duplicate resolution queue')) {
  failures.push('Walk-Ins page does not contain registration and duplicate review workflows.');
}

if (failures.length > 0) {
  console.error('Stage 19 reception workflow navigation check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Stage 19 reception workflow navigation check passed.');
