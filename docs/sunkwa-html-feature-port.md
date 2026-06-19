# SUNKWA HTML Feature Port

Source reference: `SUNKWA_v4_clinician (1).html`.

## Implementation rule
The CSS styling was not changed in this pass. The work focused on porting functional logic from the original SUNKWA HTML into the React frontend.

## Implemented updates

### 1. Original SUNKWA catalog logic
- Replaced the small demo catalog with the SUNKWA HTML catalog IDs `t1` through `t22`.
- Added laboratory tests including FBC, urinalysis, LFT, RFT, lipid profile, glucose, malaria, Widal, hepatitis B, HIV, semen analysis, HCG, and thyroid function.
- Added scan/radiology items including CT, X-Ray, ultrasound, obstetric ultrasound, and echocardiography.
- Preserved prices for finance/reception/admin use while keeping prices hidden from doctors, lab staff, and scan staff.

### 2. Reference range logic
- Ported core SUNKWA reference ranges into catalog parameters.
- Result entry now supports SUNKWA-style multi-parameter tests and auto-flags numeric values against low/high ranges.
- Qualitative tests with no numeric low/high range no longer incorrectly flag against `0`.

### 3. Doctor / clinician add-test behavior
- The doctor order form now uses SUNKWA-style search behavior:
  - search by test/scan name
  - search by ID number such as `t1`
  - search by abbreviation such as `FBC`, `LFT`, `RFT`, `TFT`
  - filter Laboratory vs Scan/Radiology
- Doctors can add multiple lab tests and scans to one patient order.
- Doctors still cannot see prices.

### 4. Patient trends logic
- Rebuilt the shared Patient Trends panel to behave closer to the original HTML flow:
  1. search/select patient
  2. choose test
  3. choose parameter
  4. view trend chart/table
- Added support for historical values with test names, parameters, units, reference ranges, and abnormal flags.

### 5. Demo data realignment
- Existing seeded orders now use original SUNKWA catalog IDs instead of the earlier simplified `CAT-*` IDs.
- Seed invoices and result records were updated to match the original SUNKWA catalog pricing and parameter names.

## QA
Executed:

```bash
npm run lint:routes
npm run lint:auth
npm run lint:ui
npm run lint:prd
npm run lint:workflow
npm audit --audit-level=moderate
npm run build
npm run build:standalone
```

Result: all checks passed, production build passed, and standalone offline preview was generated.
