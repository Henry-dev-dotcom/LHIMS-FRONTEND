import fs from 'node:fs';

const daily = fs.readFileSync('src/pages/reception/ReceptionDailyVisitsPage.jsx', 'utf8');
const tabs = fs.readFileSync('src/pages/reception/ReceptionPageTabs.jsx', 'utf8');
const router = fs.readFileSync('src/routes/AppRouter.jsx', 'utf8');

const checks = [
  {
    pass: !daily.includes("id: 'filters'") && !daily.includes('Visit filters'),
    message: 'Daily Visit Log filter panel must not be a navigation tab or separate section.'
  },
  {
    pass: daily.includes('actions={(') && daily.includes('Filter daily visits') && daily.includes('Filter by visit date') && daily.includes('Filter by visit status'),
    message: 'Daily Visit Log filters must sit in the page navigation container action area.'
  },
  {
    pass: tabs.includes('actions = null') && tabs.includes('scrollRef') && tabs.includes('scrollLeft = 0'),
    message: 'Reception page tabs must support right-side actions and reset horizontal scroll between pages.'
  },
  {
    pass: router.includes('window.scrollTo({ top: 0, left: 0') && router.includes('}, [pageId]);'),
    message: 'App router must reset viewport scroll on each page navigation.'
  }
];

const failed = checks.filter((check) => !check.pass);
if (failed.length) {
  console.error('Stage 22 reception filter/scroll QA failed:');
  for (const item of failed) console.error(`- ${item.message}`);
  process.exit(1);
}

console.log('Stage 22 reception filter placement and scroll reset QA passed.');
