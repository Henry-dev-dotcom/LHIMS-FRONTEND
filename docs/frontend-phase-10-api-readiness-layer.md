# Frontend Phase 10 — API Readiness Layer

## Purpose

Phase 10 prepares the React frontend for backend integration while keeping the current local demo mode working.

The frontend now has a clear integration boundary:

- `src/api/apiClient.js`
- `src/api/config.js`
- `src/api/endpointMap.js`
- `src/api/modelMappers.js`
- `src/api/mockBackend.js`
- `src/services/*Service.js`
- `src/hooks/useApiReadiness.js`
- `src/pages/system/ApiReadinessPage.jsx`

## What was added

### API client

The API client supports two modes:

- `mock`: keeps current frontend demo behavior active.
- `live`: prepares calls to `VITE_API_BASE_URL`.

### Service files

Service boundaries were created for:

- Auth
- Patients
- Doctors
- Orders
- Reception
- Laboratory
- Scan / Imaging
- Billing
- Finance
- Admin
- Results
- Reports
- Notifications
- Files

These services are where future backend calls should be connected. Pages should gradually call services rather than directly depending on local state.

### Model mappers

Mappers normalize frontend data into backend-ready payloads for:

- Patients
- Orders
- Results
- Invoices
- Catalog items

### Endpoint map

`endpointMap.js` documents the backend route contracts the frontend expects. This maps directly to the backend plan.

### API Readiness page

Admin now has a new System navigation item:

`API Readiness`

It shows:

- API mode
- Base URL
- Service count
- Endpoint contract count
- Model mapper status
- Backend handoff checklist

## Backend handoff notes

When the backend is ready:

1. Add `.env` using `.env.example`.
2. Set `VITE_API_BASE_URL` to the backend base URL.
3. Switch API Readiness page from Mock API Mode to Live API Mode.
4. Replace page-level dispatch calls gradually with service calls where appropriate.
5. Keep frontend validation, loading, empty, and error states in each page.

## QA

Added script:

```bash
npm run lint:api
```

The full QA now includes API readiness validation:

```bash
npm run qa
```
