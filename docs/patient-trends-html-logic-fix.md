# Patient Trends — SUNKWA HTML Logic Fix

## User issue
The Doctor/Clinician Patient Trends section existed, but it did not follow the original SUNKWA HTML trend logic closely enough.

## Reference logic ported from SUNKWA HTML
The original flow is:

1. Search patient by name or patient ID.
2. Select one patient.
3. Show only completed lab tests for that patient.
4. Select a completed lab test.
5. Show that test's editable reference-range parameters.
6. Select one parameter.
7. Generate a line chart from repeated completed results for that exact patient + test + parameter.

## Implementation changes
Updated `src/components/ui/PatientTrendsPanel.jsx`.

### Fixed behavior
- Removed automatic first-patient selection.
- Requires typing at least 2 characters before showing patient matches, like the HTML file.
- Uses a strict patient → test → parameter → chart navigation flow.
- Pulls completed tests from finalized orders and finalized results.
- Uses catalog/reference-range parameters for the parameter selection step.
- Builds the chart only from repeated values for the same test and parameter.
- Displays low/high reference guide lines where available.
- Shows a historical values table for the selected parameter.

## CSS status
No CSS file was changed for this fix.

## QA
`npm run qa` passed after the update.
