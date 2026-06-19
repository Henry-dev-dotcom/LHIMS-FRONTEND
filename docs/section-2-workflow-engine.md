# Section 2 — Core Data Model & Workflow Engine

This section implements the PRD v1 core data and lifecycle foundation.

## Data models added

- Patient
- Doctor
- Hospital
- User
- Department
- Catalog item
- Order
- Result
- Invoice
- Transaction
- Sample log
- Scan booking
- Audit log
- Notification

## Clinical order lifecycle

The frontend now supports the PRD lifecycle:

1. Submitted
2. Confirmed
3. In Progress
4. Pending Review
5. Final / Released
6. Cancelled

Billing is tracked in parallel with:

- Payment Pending
- Paid
- Insurance Pending
- Refunded

## Workflow actions

Implemented reducer actions:

- `CREATE_DEMO_ORDER`
- `TRANSITION_ORDER`
- `UPDATE_BILLING_STATUS`

## Workflow side effects

When an order transitions:

- A timeline event is appended to the order.
- An audit log event is created.
- Pending Review creates result records if they do not exist.
- Final / Released approves matching result records.
- Final / Released creates doctor delivery notifications.
- SMS notification text intentionally avoids patient-identifying clinical data.

## Test page

Use **Order Registry** to test Section 2.

Recommended path:

1. Create demo order.
2. Move it from Submitted → Confirmed.
3. Move it to In Progress.
4. Move it to Pending Review.
5. Move it to Final / Released.
6. Check generated results, notifications, and audit log.
