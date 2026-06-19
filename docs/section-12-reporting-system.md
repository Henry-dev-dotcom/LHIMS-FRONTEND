# Section 12 — Reporting System

This section implements the PRD reporting requirements for the Diagnosis Center Platform.

## Scope implemented

- Turnaround time per finalized order, separated by routed department.
- Order volume by hospital, doctor, department, day, and lifecycle status.
- Revenue and outstanding balance reporting by invoice, hospital, doctor, patient, and month.
- Insurance-pending and refunded totals.
- Abnormal result rate tracking by department.
- Abnormal result register with abnormal/high/low/critical parameter details.
- Staff productivity foundation using audit activity, approvals/sign-offs, and result-processing actions.
- Report filters: date range, hospital, doctor, department, and order status.
- Export current report as CSV.
- Export full reporting dataset as JSON.

## Pages changed

- `src/pages/admin/ReportsPage.jsx`
- `src/utils/reportMetrics.js`

## Acceptance checks

- Admin, Billing, Lab, and Scan roles can access Reports.
- Reports calculate against the same order, result, invoice, audit, doctor, hospital, patient, and catalog state used by the rest of the app.
- Production build passes.
- Route and auth checks pass.

## Notes

The staff productivity table is a v1 operational foundation only. It is based on audit events, not final HR performance rules.
