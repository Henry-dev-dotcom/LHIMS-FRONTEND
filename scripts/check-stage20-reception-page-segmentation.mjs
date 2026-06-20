import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const tab = read('src/pages/reception/ReceptionPageTabs.jsx');
['Use these tabs to focus this page', 'overflow-x-auto', 'sections'].forEach((marker) => {
  if (!tab.includes(marker)) failures.push(`ReceptionPageTabs is missing marker: ${marker}`);
});

const pages = {
  'src/pages/reception/IncomingOrdersPage.jsx': ['Incoming orders sections', 'New Orders', 'Confirm Panel', 'sectionStatus'],
  'src/pages/reception/PatientCheckInPage.jsx': ['Check-in sections', 'Search & Check-In', 'Today’s Visits', 'Duplicates'],
  'src/pages/reception/ReceptionWalkInsPage.jsx': ['Walk-in sections', 'Register', 'Walk-in List', 'Duplicates'],
  'src/pages/reception/AppointmentsPage.jsx': ['Appointment sections', 'Create', 'Calendar List', 'Room Board'],
  'src/pages/reception/ReceptionDailyVisitsPage.jsx': ['Daily visit sections', 'Visit Register', 'Exceptions'],
  'src/pages/reception/ReceptionResultsInboxPage.jsx': ['Results inbox sections', 'Released Results', 'Notices', 'Abnormal']
};

Object.entries(pages).forEach(([file, markers]) => {
  const content = read(file);
  markers.forEach((marker) => {
    if (!content.includes(marker)) failures.push(`${file} is missing section marker: ${marker}`);
  });
  if (content.includes('<ReceptionWorkflowNav')) failures.push(`${file} still contains the old full reception navigation component.`);
});

const dashboard = read('src/pages/dashboards/RoleDashboard.jsx');
if (dashboard.includes('ReceptionWorkflowNav')) failures.push('Reception dashboard still injects the wrong cross-page reception nav.');

if (failures.length > 0) {
  console.error('Stage 20 reception page segmentation check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Stage 20 reception page segmentation check passed.');
