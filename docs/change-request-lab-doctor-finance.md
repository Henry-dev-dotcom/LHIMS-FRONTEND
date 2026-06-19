# Change Request Pack — Doctor Ordering, Lab Acceptance, Finance Shift, Role Privacy

This package implements the testing concerns gathered after the final QA review.

## Implemented changes

### Navigation pane readability
- Improved sidebar contrast through the polished app shell and readable nav labels.
- Added search-ready navigation and clearer active states from the UI polish pass.

### Doctor / clinician order workflow
- New Order now searches existing patients in the system by patient name, Patient ID, phone, email, national ID, or policy number.
- Doctors can create a new patient when no match is found.
- Add Test / Scan opens a searchable catalog modal.
- Catalog search supports name, catalog ID, department, modality, and type.
- Doctors can add multiple lab tests and scans to one patient order.
- Doctor order submission creates one combined order and routes line items by department.

### Price visibility control
- Doctors, lab staff, and scan staff do not see lab/test/scan prices.
- Reception, Billing/Finance, and Admin can view prices.
- Price Catalog is view-only for Reception and editable for Billing/Admin.
- Financial report sections are hidden from lab/scan roles.

### Patient trends
- Added reusable PatientTrendsPanel.
- Added trends to Doctor Portal for patients referred by the doctor.
- Added trends to Lab Queue for lab-visible patients.
- Trends use finalized structured result parameters and highlight abnormal flags.

### Finance shift start/close
- Added Shift Start / Close page for Billing/Admin.
- Shift start captures opening float and notes.
- Payments are linked to the active finance shift.
- Shift close calculates cash/card/transfer/insurance totals, expected cash, actual cash, and variance.
- Shift actions are audit logged.

### Lab/scan separation
- Lab Queue shows only lab-routed orders and only lab line items.
- Scan Queue shows only imaging-routed orders and only imaging line items.
- Mixed orders are separated by department view.

### Lab queue and acceptance flow
- Lab Queue is patient-focused with search by patient name, Patient ID, order ID, doctor, hospital, or test name.
- Each row has Review / Accept action.
- Lab Accept page lets lab staff review patient/order/test details and accept the sample.
- Accepted samples are stored with Sample ID, accepted timestamp, accepted by, sample type, and lab item IDs.

### Accepted Samples page
- Added Accepted Samples navigation for Lab/Admin.
- Lab staff can search accepted samples by patient, sample ID, order ID, or doctor.
- Opening a sample shows all lab tests for the patient/order.

### Per-test result entry
- Each lab test has its own Enter Results button.
- Result modal includes parameter value fields, unit, reference range, analyzer/equipment, report comments, and internal technician notes.
- Flags are calculated automatically from reference ranges.
- Partial test completion is supported.

### Result forwarding
- Result entry updates the Results section.
- Doctor and Reception receive result notifications.
- Doctor can view/download PDF-ready reports.
- Reception/Admin/Billing can print reports, email patient notice, or send privacy-safe WhatsApp notice.
- WhatsApp opens a `wa.me` link with a safe message and no clinical detail.

## QA

The following command passed after implementation:

```bash
npm run qa
```

Checks passed:
- Route registry coverage
- Auth / role dashboard coverage
- UI polish markers
- PRD coverage
- Workflow integrity
- Dependency audit
- Production build
- Standalone offline build

