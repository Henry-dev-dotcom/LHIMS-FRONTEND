import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/pages/reception/ReceptionResultsInboxPage.jsx');
const source = fs.readFileSync(file, 'utf8');

const failures = [];
if (source.includes("key: 'flag'") || source.includes('label: \'Flag\'')) {
  failures.push('Reception Results Inbox table still includes a Flag column.');
}
if (!source.includes("key: 'actions'")) {
  failures.push('Reception Results Inbox actions column is missing.');
}
if (!source.includes('max-w-[240px]')) {
  failures.push('Reception Results Inbox investigations column was not compacted.');
}
if (!source.includes('px-3 py-1.5 text-xs')) {
  failures.push('Reception Results Inbox actions were not compacted.');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Stage 21 reception results table compactness check passed.');
