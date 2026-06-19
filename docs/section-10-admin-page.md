# Section 10 — Admin Page

Implemented on top of Section 9.

## PRD coverage

- User Management: create, edit, deactivate accounts and assign roles.
- Hospital/Partner Management: add/edit hospitals and affiliated doctors.
- Test/Scan Catalog Management: add/edit catalog items, prices, expected hours and lab reference ranges.
- Department Management: add/edit departments and imaging equipment.
- System-Wide Reporting Dashboard: TAT, order volume, revenue, outstanding balances, abnormal result rate and staff productivity foundation.
- Audit Log: searchable/filterable/exportable audit trail.
- Notification Settings: email/SMS provider placeholders, templates and delivery log.
- Data Export: JSON export from reports and audit log.

## Test path

1. Login as admin / admin123.
2. Open User Management and create/edit/deactivate a user.
3. Open Hospitals / Partners and add a hospital or affiliated doctor.
4. Open Settings and add/edit catalog items, departments and equipment.
5. Open Notification Settings and save provider/templates.
6. Open Reports and export JSON.
7. Open Audit Log and confirm admin actions are recorded.

## Build checks

- npm run lint:routes
- npm run lint:auth
- npm run build
