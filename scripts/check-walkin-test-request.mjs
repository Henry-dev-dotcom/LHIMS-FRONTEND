import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const walkins = read('src/pages/reception/ReceptionWalkInsPage.jsx');
const checkin = read('src/pages/reception/PatientCheckInPage.jsx');
const store = read('src/store/AppStore.jsx');
const workflow = read('src/workflow/workflowEngine.js');
const routes = read('src/routes/routeRegistry.js');

[
  ['walk-in request tab', walkins, 'Request Tests'],
  ['walk-in request submit action', walkins, 'CREATE_RECEPTION_WALK_IN_ORDER'],
  ['walk-in request handoff action', walkins, 'START_WALK_IN_TEST_REQUEST'],
  ['walk-in catalog selection', walkins, 'Select requested lab tests or scans'],
  ['walk-in invoice summary', walkins, 'Estimated invoice total'],
  ['walk-in created requests table', walkins, 'Walk-in test requests'],
  ['check-in request handoff button', checkin, 'Check In & Request Tests'],
  ['store creates reception walk-in order', store, 'CREATE_RECEPTION_WALK_IN_ORDER'],
  ['store tracks active walk-in patient', store, 'activeWalkInPatientId'],
  ['store tracks active walk-in visit', store, 'activeWalkInVisitId'],
  ['workflow marks walk-in requests', workflow, 'walkInRequest'],
  ['workflow supports request source', workflow, 'requestSource'],
  ['route registry documents request tests', routes, 'Direct walk-in order creation']
].forEach(([label, text, marker]) => {
  if (!text.includes(marker)) failures.push(`${label} missing marker: ${marker}`);
});

if (failures.length) {
  console.error('Walk-in test request QA failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Walk-in test request QA passed.');
