# Lab Result Flagging + Scan Workflow Fixes

## Source request
These fixes were implemented after reviewing the lab page and scan queue behavior against the original SUNKWA HTML logic and the current React frontend.

## Fix 1 — Lab reference ranges and flagging
- Added real-time flag preview in the per-test lab result entry modal.
- Each parameter now shows:
  - parameter name
  - unit
  - displayed reference range
  - low/high limits
  - optional critical low/high limits
  - live flag: Pending / Normal / Low / High / Critical / No Range
- Saved result parameters now retain low/high/critical range metadata.

## Fix 2 — Admin editable ranges for every lab test
- Rebuilt the Admin Settings catalog modal so ranges are edited with structured fields instead of hidden text syntax.
- Admin can edit each lab parameter row:
  - parameter name
  - unit
  - low
  - high
  - critical low
  - critical high
  - displayed reference range
- Scan items do not show range editing because scans do not require lab parameter ranges.

## Fix 3 — Stop automatic movement after sample acceptance
- Accepting a lab sample no longer redirects the user to Accepted Samples automatically.
- Lab staff can keep accepting multiple samples from the acceptance workspace.
- Accepted Samples remains available in the navigation when the lab person is ready to move there.

## Fix 4 — Scan queue split into workflow sections
The scan workflow was broken into lab-style sections:

- Scan Queue: patient-focused requested scan list.
- Accept Scan: review patient/doctor/clinical notes and accept the scan.
- Accepted Scans: search accepted scan patients and enter imaging reports.
- Equipment Booking: still available as a separate room/machine booking view.

This reduces congestion on the Scan Queue page while keeping imaging work aligned with the lab workflow.

## QA
Passed:
- Route registry check
- Auth/role check
- UI polish check
- PRD coverage check
- Workflow integrity check
- npm audit
- Production build
- Standalone offline build

## Styling note
No CSS styling file was changed. `src/styles/index.css` hash remained identical to the previous reviewed package.
