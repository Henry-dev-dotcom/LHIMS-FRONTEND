# Frontend Stage 19 — Reception Workflow Navigation

## Purpose
The receptionist workspace was split into focused workflow pages so the front desk does not need to work from one crowded screen.

## Added
- Shared `ReceptionWorkflowNav` navigation bar above every reception workflow page.
- New `ReceptionWalkInsPage` for walk-in registration and duplicate review.
- Updated `PatientCheckInPage` so it focuses only on arrival check-in and identity/order verification.
- Reception dashboard now also shows the workflow navigation bar.

## Reception tabs
- Overview
- Orders
- Check-In
- Walk-Ins
- Appointments
- Daily Visits
- Results

## Updated files
- `src/pages/reception/ReceptionWorkflowNav.jsx`
- `src/pages/reception/ReceptionWalkInsPage.jsx`
- `src/pages/reception/PatientCheckInPage.jsx`
- `src/pages/reception/IncomingOrdersPage.jsx`
- `src/pages/reception/AppointmentsPage.jsx`
- `src/pages/reception/ReceptionDailyVisitsPage.jsx`
- `src/pages/reception/ReceptionResultsInboxPage.jsx`
- `src/pages/dashboards/RoleDashboard.jsx`
- `src/routes/AppRouter.jsx`
- `src/routes/routeRegistry.js`
- `src/data/roles.js`
- `scripts/check-stage19-reception-workflow-navigation.mjs`

## QA
Run:

```bash
npm run lint:stage19
npm run build
npm run build:standalone
```
