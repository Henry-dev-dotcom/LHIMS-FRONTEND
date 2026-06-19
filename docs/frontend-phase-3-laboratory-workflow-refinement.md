# Phase 3 — Laboratory Workflow Refinement

## Scope
This phase refines the laboratory workflow before backend integration.

## Implemented updates

### Lab Queue
- Added batch sample acceptance.
- Added selectable lab-request rows.
- Added sample-state filtering: Not Accepted, Accepted, Rejected, Recollection Requested.
- Preserved lab-only request filtering so scan-only orders do not appear in the lab workspace.

### Accepted Samples
- Added result-state filter: Pending, Draft, Pending Review, Completed.
- Added sample label / barcode print placeholder.
- Added reference range preview for each test before opening result entry.
- Added draft result saving.
- Added submit-for-review action.
- Result entry popup shows parameter, unit, reference range, low/high, critical low/high and live flags.

### Review & Sign-off
- Added new Laboratory navigation page: Review & Sign-off.
- Senior reviewer can view all parameters, flags and amendment history.
- Reviewer can print a review copy.
- Reviewer can sign off and release the laboratory result.

### Rejected / Retest Samples
- Added new Laboratory navigation page: Rejected / Retest.
- Tracks rejected samples and recollection requests.
- Supports recollection/retest note updates.

### Store / data workflow
- Added batch sample acceptance action.
- Added draft result entry support.
- Changed per-test result entry so completed lab work goes to Pending Review instead of auto-final release.
- Added amendment history when a test result is edited after previous values existed.
- Added sample label print audit action.
- Added recollection request action.

## QA result
The full QA suite passed:
- Route registry check
- Auth check
- UI polish check
- PRD coverage check
- Workflow integrity check
- npm audit
- Production build
- Standalone offline preview generation
