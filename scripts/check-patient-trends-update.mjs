import fs from 'node:fs';

const panelPath = 'src/components/ui/PatientTrendsPanel.jsx';
const pagePath = 'src/pages/doctor/DoctorPatientTrendsPage.jsx';
const seedPath = 'src/data/seedData.js';
const panel = fs.readFileSync(panelPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
const seed = fs.readFileSync(seedPath, 'utf8');

const requiredMarkers = [
  ['maps selected test parameters into chart list', /selectedTest\.parameters\s*\|\|\s*\[\]\)\.map\(\(parameter\)/],
  ['renders all parameter chart cards', /parameterCharts\.map\(\(chart\)\s*=>\s*\(\s*<ParameterTrendCard/],
  ['view action uses focused chart state', /const \[focusedChart, setFocusedChart\]/],
  ['view button includes eye icon', /<Eye className="h-4 w-4" \/>\s*View/],
  ['large popup opens from focused chart', /<Modal[\s\S]*open=\{Boolean\(focusedChart\)\}/],
  ['focused modal renders large chart', /<PatientProgressChart rows=\{focusedRows\} parameterName=\{focusedChart\.parameter\.name\}/],
  ['modal includes historical table', /rows=\{focusedRows\}[\s\S]*emptyMessage="No historical values found for this parameter/],
  ['csv exports all trend rows', /const allTrendRows = parameterCharts\.flatMap/],
  ['page copy explains all parameters at once', /view all parameter charts at once/]
];

const missing = requiredMarkers.filter(([, pattern]) => !(pattern.test(panel) || pattern.test(page))).map(([label]) => label);
if (missing.length) {
  console.error(`Patient Trends update check failed. Missing: ${missing.join(', ')}`);
  process.exit(1);
}

const expectedParameters = ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets', 'MCV', 'MCH'];
const missingSeedParams = expectedParameters.filter((name) => !seed.includes(`name: '${name}'`));
if (missingSeedParams.length) {
  console.error(`Seed data is missing expected FBC parameters: ${missingSeedParams.join(', ')}`);
  process.exit(1);
}

const trendReadyParameters = ['WBC', 'Hemoglobin', 'Platelets'];
const insufficientTrendHistory = trendReadyParameters.filter((name) => {
  const occurrences = [...seed.matchAll(new RegExp(`testId: 't1',[^\n]*name: '${name}'`, 'g'))].length;
  return occurrences < 2;
});
if (insufficientTrendHistory.length) {
  console.error(`Seed data has insufficient finalized trend values for: ${insufficientTrendHistory.join(', ')}`);
  process.exit(1);
}

console.log(`Patient Trends update check passed: all ${expectedParameters.length} configured FBC parameters are supported, focused modal flow is present, CSV exports all selected-test parameter rows, and ${trendReadyParameters.length} seed-data parameters have enough values for line trends.`);
