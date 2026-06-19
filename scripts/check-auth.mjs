import fs from 'node:fs';

const rolesFile = fs.readFileSync('./src/data/roles.js', 'utf8');
const routeFile = fs.readFileSync('./src/data/roles.js', 'utf8');

const roleIds = [...rolesFile.matchAll(/id: '([^']+)'/g)].map((match) => match[1]).filter((id) => ['doctor','receptionist','lab','scan','billing','admin'].includes(id));
const missing = ['doctor','receptionist','lab','scan','billing','admin'].filter((role) => !roleIds.includes(role));
if (missing.length) {
  console.error(`Missing PRD roles: ${missing.join(', ')}`);
  process.exit(1);
}

const landingMatches = [...rolesFile.matchAll(/landing: '([^']+)'/g)].map((match) => match[1]);
const navIds = [...routeFile.matchAll(/\{ id: '([^']+)'/g)].map((match) => match[1]);
const invalidLanding = landingMatches.filter((landing) => !navIds.includes(landing));
if (invalidLanding.length) {
  console.error(`Landing pages missing from navigation: ${invalidLanding.join(', ')}`);
  process.exit(1);
}

console.log(`Auth check passed: ${roleIds.length} PRD roles and ${landingMatches.length} landing pages configured.`);
