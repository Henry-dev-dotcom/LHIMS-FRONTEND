# Frontend Phase 5 — Finance Workflow Refinement

## Scope
This phase refined the finance workflow before backend integration.

## Implemented

### Invoices
- Central invoice register with payment category filters.
- Paid, Partly Paid, Yet To Pay, Insurance Pending, and Refunded visibility.
- Cashier filter and date range filters.
- Payment blocked unless the finance user has an active shift.
- Receipt preview and print action.
- Supervisor approval prompt for refunds/adjustments.
- Recent transaction register by invoice/cashier/method/shift.

### Shift Start / Close
- Shift type added.
- Cashier can start shift with opening float.
- Cash denomination inputs added for closing cash count.
- Expected cash, counted cash, and variance are calculated.
- Payment method breakdown shown for active shift.
- Shift history can be filtered by cashier and date range.

### Float Tracker
- Float shows all payments and manual adjustments.
- Method totals for Cash, Mobile Money, Card, Transfer, and Insurance.
- Search, method, cashier, and date filters.
- Manual Money In / Money Out adjustment remains blocked until a shift is open.

### Expenses
- Date and staff filters added.
- Payment method prompt added for expense payments.
- Supervisor approval required before write-off.
- Paid, Partial, Unpaid, and Written Off statuses preserved.

### Account Ledger
- Ledger uses central finance utility builders.
- Combines billing credits, expense debits, and float adjustments.
- Adds staff and date filters.
- Running balance is retained.

### Billing Analytics
- Period, date, cashier, and hospital filters added.
- Patient visits, collections, outstanding, paid invoices, write-offs, and net revenue preserved.
- Cashier collection summary added.
- Receivable ageing now includes partial invoices.

## QA
Full QA was run successfully:

```bash
npm run qa
```

Result: Passed.
