# Section 9 — Billing / Finance Page

Implemented on top of the PRD-driven React/Tailwind build.

## Included

- Test/Scan Price Catalog
- Invoice register
- Invoice editor for tax, discount, method and insurance reference
- Payment Status Tracker
- Payment Method Log
- Outstanding Balances Report
- Insurance Claim Reference field
- Revenue summary metrics
- Refund/Adjustment Tool with required reason

## Store Actions

- `UPDATE_INVOICE`
- `RECORD_PAYMENT`
- `REFUND_OR_ADJUST_INVOICE`
- `UPDATE_CATALOG_PRICE`

## Test Flow

1. Login as `billing` / `billing123`.
2. Open Invoices.
3. Update invoice tax/discount/insurance reference.
4. Record a payment.
5. Use refund/adjustment with a reason.
6. Open Price Catalog.
7. Edit a test/scan price or expected completion time.
8. Login as Admin and confirm Audit Log entries.
