import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const files = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? files(full) : [full];
});
const sourceText = files('src')
  .filter((file) => /\.(jsx|js|css)$/.test(file))
  .map(read)
  .join('\n');
const docsText = files('docs').filter((file) => /\.md$/.test(file)).map(read).join('\n');
const all = `${sourceText}\n${docsText}`.toLowerCase();

const coverage = [
  ['Section 1 foundation', ['react', 'tailwind', 'sidebar', 'toast']],
  ['Section 2 workflow engine', ['submitted', 'confirmed', 'in progress', 'pending review', 'final / released', 'cancelled']],
  ['Section 3 role dashboards', ['doctor', 'receptionist', 'lab staff', 'scan / imaging staff', 'billing / finance staff', 'admin']],
  ['Section 4 patient records', ['patient id', 'date of birth', 'national id', 'insurance provider', 'order history', 'allergy']],
  ['Section 5 doctor portal', ['doctor profile', 'new order', 'notification preferences', 'hospital/account info', 'result viewer']],
  ['Section 6 reception', ['incoming orders', 'patient check-in', 'appointment scheduler', 'walk-in', 'duplicate patient']],
  ['Section 7 laboratory', ['sample collection', 'test panel', 'analyzer', 'retest', 'reject']],
  ['Section 8 imaging', ['scan order', 'equipment', 'image upload', 'radiologist', 'prior scans']],
  ['Section 9 billing', ['invoice', 'payment status', 'insurance claim', 'refund', 'outstanding']],
  ['Section 10 admin', ['user management', 'hospital / partner', 'catalog', 'department management', 'audit log']],
  ['Section 11 results delivery', ['pdf report', 'email notification', 'sms notification', 'privacy-safe', 'delivery log']],
  ['Section 12 reporting', ['turnaround', 'order volume', 'revenue', 'abnormal', 'productivity']],
  ['Section 13 security', ['role-based access', 'audit coverage', 'phi', 'retry', 'integrity']],
  ['Section 14 polish', ['clinical-panel', 'workflowtimeline', 'notificationdrawer', 'mobile table', 'skip-to-content']]
];

const missing = [];
for (const [section, needles] of coverage) {
  const sectionMissing = needles.filter((needle) => !all.includes(needle.toLowerCase()));
  if (sectionMissing.length) missing.push(`${section}: ${sectionMissing.join(', ')}`);
}
if (missing.length) {
  console.error('PRD coverage check failed:\n' + missing.join('\n'));
  process.exit(1);
}
console.log(`PRD coverage check passed: ${coverage.length} section coverage groups verified.`);
