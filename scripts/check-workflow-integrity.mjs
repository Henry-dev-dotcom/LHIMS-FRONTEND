import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const store = read('src/store/AppStore.jsx');
const workflow = read('src/workflow/workflowEngine.js');
const statuses = read('src/workflow/statuses.js');
const routes = read('src/routes/AppRouter.jsx');
const roles = read('src/data/roles.js');
const seed = read('src/data/seedData.js');

const checks = [
  ['workflow has createOrder', workflow, 'createOrder'],
  ['workflow has transitionOrder', workflow, 'transitionOrder'],
  ['workflow has delivery bundle', workflow, 'createResultDeliveryBundle'],
  ['workflow has retry delivery', workflow, 'retryDeliveryNotification'],
  ['statuses include submitted', statuses, 'Submitted'],
  ['statuses include confirmed', statuses, 'Confirmed'],
  ['statuses include in progress', statuses, 'In Progress'],
  ['statuses include pending review', statuses, 'Pending Review'],
  ['statuses include final released', statuses, 'Final / Released'],
  ['statuses include cancelled', statuses, 'Cancelled'],
  ['store creates patients', store, 'CREATE_PATIENT'],
  ['store updates patients', store, 'UPDATE_PATIENT'],
  ['store submits doctor orders', store, 'CREATE_DOCTOR_ORDER'],
  ['store confirms reception orders', store, 'CONFIRM_RECEPTION_ORDER'],
  ['store checks in patients', store, 'CHECK_IN_PATIENT'],
  ['store records lab samples', store, 'ADD_SAMPLE_LOG'],
  ['store submits lab results', store, 'ENTER_LAB_RESULT'],
  ['store approves lab results', store, 'APPROVE_DEPARTMENT_RESULT'],
  ['store books scan equipment', store, 'ADD_SCAN_BOOKING'],
  ['store submits scan report', store, 'SAVE_SCAN_REPORT'],
  ['store approves scan report', store, 'APPROVE_DEPARTMENT_RESULT'],
  ['store records payments', store, 'RECORD_PAYMENT'],
  ['store updates catalog', store, 'ADMIN_UPDATE_CATALOG_ITEM'],
  ['store logs restricted access', store, 'LOG_RESTRICTED_ACCESS'],
  ['routes patient records page', routes, 'PatientRecordsPage'],
  ['routes doctor portal page', routes, 'DoctorPortalPage'],
  ['routes lab queue page', routes, 'LabQueuePage'],
  ['routes scan queue page', routes, 'ScanQueuePage'],
  ['routes invoices page', routes, 'InvoicesPage'],
  ['routes reports page', routes, 'ReportsPage'],
  ['routes security page', routes, 'SecurityReliabilityPage'],
  ['six roles configured', roles, 'ROLE_DASHBOARD_REQUIREMENTS'],
  ['seed includes results', seed, 'results'],
  ['seed includes invoices', seed, 'invoices'],
  ['seed includes audit logs', seed, 'auditLogs']
];

const missing = checks.filter(([_, text, needle]) => !text.includes(needle)).map(([label, _, needle]) => `${label} missing ${needle}`);
if (missing.length) {
  console.error('Workflow integrity check failed:\n' + missing.join('\n'));
  process.exit(1);
}
console.log(`Workflow integrity check passed: ${checks.length} workflow and route markers verified.`);
