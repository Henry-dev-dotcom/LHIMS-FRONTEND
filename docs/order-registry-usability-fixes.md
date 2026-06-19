# Order Registry Usability Fixes

## User concern
The clinician/doctor-facing Order Registry section was too congested and poorly arranged.

## Implemented changes

- Rebuilt `OrderRegistryPage.jsx` from a wide, congested table into a sectioned workflow view.
- Added internal Order Registry sections:
  - Registry Overview
  - New / Submitted
  - Active Processing
  - Pending Review
  - Released Results
  - Cancelled
- Added a workflow board for quick stage-based scanning.
- Added section cards with counts, descriptions and icons.
- Added search across order ID, patient, doctor, hospital, test name, catalog ID, urgency and status.
- Added card-based order list instead of one wide table.
- Added a focused detail panel for selected order lifecycle, billing, requested items and timeline.
- Separated generated results and delivery notifications into compact secondary sections.
- Doctor role now sees only the doctor-linked orders in the registry.
- Doctor role is view-only for lifecycle transitions; operational transition buttons remain for allowed internal roles.

## CSS styling status
No CSS styling file was modified. The existing Tailwind/classes/design tokens were reused.

## QA checks
Run with:

```bash
npm run qa
```
