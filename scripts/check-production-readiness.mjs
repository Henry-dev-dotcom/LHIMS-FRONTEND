import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'Dockerfile',
  '.dockerignore',
  'nginx.conf',
  '.env.production.example',
  'docs/frontend-production-readiness.md'
];
const requiredMarkers = [
  ['package.json', '"version": "12.1.0"'],
  ['package.json', 'lint:production'],
  ['Dockerfile', 'FROM node:20-alpine AS build'],
  ['Dockerfile', 'FROM nginx:1.27-alpine AS runtime'],
  ['nginx.conf', 'try_files $uri $uri/ /index.html'],
  ['.env.production.example', 'VITE_API_MODE=live'],
  ['.env.production.example', 'VITE_API_BASE_URL=']
];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const markerFailures = requiredMarkers.filter(([file, marker]) => {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return true;
  return !fs.readFileSync(fullPath, 'utf8').includes(marker);
});

if (missingFiles.length || markerFailures.length) {
  console.error('Frontend production readiness check failed.');
  if (missingFiles.length) console.error('Missing files:', missingFiles);
  if (markerFailures.length) console.error('Missing markers:', markerFailures);
  process.exit(1);
}

const result = {
  stage: 'Frontend Production Readiness',
  status: 'passed',
  checkedAt: new Date().toISOString(),
  checks: {
    dockerfile: true,
    nginxSpaFallback: true,
    productionEnvExample: true,
    productionQaScript: true
  }
};
fs.writeFileSync(path.join(root, 'docs/frontend-production-readiness-qa-results.json'), JSON.stringify(result, null, 2));
console.log('Frontend production readiness static check passed.');
