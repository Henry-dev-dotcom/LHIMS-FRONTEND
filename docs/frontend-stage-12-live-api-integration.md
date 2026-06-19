# Frontend Stage 12 — Live API Integration Ready

## Purpose

This frontend package is prepared to connect to the completed backend business-logic package in live API mode.

## Environment

```txt
VITE_API_MODE=live
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT_MS=15000
VITE_MOCK_API_DELAY_MS=120
VITE_API_TOKEN_STORAGE_KEY=diagnosis-center-live-api-tokens
```

## What changed

- API mode can now be controlled from `VITE_API_MODE` or the UI switch.
- Live API token storage was added.
- Live requests automatically send `Authorization: Bearer <accessToken>`.
- Standard backend envelopes are unwrapped for service consumers.
- Service files now cover the completed backend business endpoints.
- Reception service boundary was added.
- Endpoint map now covers system, auth, patients, doctor, orders, reception, lab, scan, billing, finance, admin, results, reports, notifications, files, and DICOM-ready endpoints.

## Backend required

Use the backend package:

```txt
diagnosis-center-backend-business-stage10-frontend-live-api-final-qa
```

Run backend seed first so demo logins work.
