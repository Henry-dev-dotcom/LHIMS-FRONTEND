# Finance Logic + DICOM Compatibility Update

## DICOM compatibility status

The frontend is now DICOM-ready at the upload/metadata level:

- Imaging staff can attach `.dcm` / `.dicom` files in the Accepted Scans report workflow.
- The scan report modal preserves file name, size, MIME type and an `isDicom` marker for DICOM files.
- Image/PDF attachments are still supported.

Production-grade DICOM support still requires backend/PACS work:

- DICOMweb / WADO-RS / STOW-RS service
- DICOM parser/viewer library integration
- secure file storage
- study/series/instance metadata indexing
- viewer controls for window/level, measurements, slice navigation and annotations

## Finance features implemented

The finance section now mirrors the original SUNKWA HTML finance logic more closely.

### Invoices

- Centralized invoice register.
- Paid, Pending, Partial, Insurance Pending and Refunded statuses.
- Payment cannot be recorded unless the cashier has an active shift.
- Payments are linked to the active shift, method, cashier/staff and invoice.
- Supported methods: Cash, Mobile Money, Card, Transfer, Insurance.

### Float Tracker

- New Finance navigation item: `Float Tracker`.
- Shows active shift state.
- Shows method totals for Cash, Mobile Money, Card, Transfer, Insurance.
- Shows transaction log for every payment and manual float adjustment.
- Supports manual Money In / Money Out adjustments only when a shift is active.

### Expenses

- New Finance navigation item: `Expenses`.
- Create expenses for purchase cost, salary/staff, courier fees, subscription, rent/utilities, equipment and other.
- Track total amount, paid amount, balance, vendor/payee, reference and notes.
- Statuses: Paid, Partial, Unpaid, Written Off.
- Supports recording later payments and writing off balances with reason.

### Account Ledger

- New Finance navigation item: `Account Ledger`.
- Combines credits from billing payments and debits from expense payments / float out.
- Shows total credit, total debit and current balance.
- Searchable ledger table with references and running balance.

### Billing Analytics

- New Finance navigation item: `Billing Analytics`.
- Shows patient visits, collections, net outstanding, paid invoices, write-offs and net revenue.
- Payment method split.
- Accounts receivable ageing.
- Hospital revenue summary.

## QA result

`npm run qa` passed after implementation.

- Route registry covers all 40 navigation items.
- Auth check passed.
- UI check passed.
- PRD coverage passed.
- Workflow integrity passed.
- npm audit found 0 vulnerabilities.
- Production build passed.
- Standalone offline preview generated.
