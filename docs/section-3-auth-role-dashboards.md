# Section 3 — Authentication & Role Dashboards

## Scope
Section 3 implements the PRD role foundation for the six supported users:

- Doctor
- Receptionist
- Lab Staff
- Scan / Imaging Staff
- Billing / Finance Staff
- Admin

The PRD requires each role to have a distinct dashboard / landing page and role-specific access. This section activates that foundation.

## Implemented

### Demo Authentication
- Manual credential form
- Quick role login cards
- LocalStorage session persistence
- Logout action
- Reset demo data action

### Demo Credentials
| Role | Username | Password |
|---|---|---|
| Doctor | doctor | doctor123 |
| Receptionist | reception | reception123 |
| Lab Staff | lab | lab123 |
| Scan / Imaging Staff | scan | scan123 |
| Billing / Finance Staff | billing | billing123 |
| Admin | admin | admin123 |

### Role Dashboards
Each role has a unique landing page:

| Role | Landing Route |
|---|---|
| Doctor | doctor-dashboard |
| Receptionist | reception-dashboard |
| Lab Staff | lab-dashboard |
| Scan / Imaging Staff | scan-dashboard |
| Billing / Finance Staff | billing-dashboard |
| Admin | admin-dashboard |

### Permission System
- Navigation is filtered by role.
- Route access is checked by `canAccessPage()`.
- Blocked routes render `AccessRestrictedPage`.
- Allowed roles for blocked pages are shown to aid QA.

### Dashboard Metrics
Role dashboards now show live metrics based on the Section 2 data model:

- Doctor: active orders, completed results, referred patients, alerts
- Reception: submitted orders, confirmed orders, patient records, urgent queue
- Lab: lab-routed orders, in-progress items, pending review, released results
- Scan: scan-routed orders, in-progress items, pending reports, released reports
- Billing: invoices, outstanding value, collected value, insurance pending
- Admin: users, hospitals, orders, audit events

## Acceptance Review
- Six PRD roles exist.
- Each role has demo credentials.
- Each role has a landing route.
- Each role sees only relevant sidebar items.
- Protected routes block unauthorized access.
- Auth and route checks pass through `npm run lint:auth` and `npm run lint:routes`.
- Production build passes.

## Not Yet Implemented
This section does not yet implement full business tools for each role. Those are scheduled for later sections:

- Section 4: Patient Record Module
- Section 5: Doctor Portal
- Section 6: Receptionist Page
- Section 7: Laboratory Unit Page
- Section 8: Scan / Imaging Unit Page
- Section 9: Billing / Finance Page
- Section 10: Admin Page
