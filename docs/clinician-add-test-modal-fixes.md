# Clinician Add Test / Scan Modal Fixes

## Scope
This change updates the Doctor / Clinician New Order add-test workflow without changing the global CSS styling file.

## Changes Implemented

1. Added a clear **Done — Save Selected Tests** button to the Add Test / Scan pop-up.
   - Selected tests/scans are retained in the order form.
   - Clicking Done closes the modal and returns the clinician to the New Order page.
   - The existing Cancel/close behavior remains available.

2. Simplified filters beside the search bar.
   - Removed the duplicate **All types** dropdown.
   - Kept the department dropdown because it gives the clearer operational split: Laboratory vs Scan / Radiology.
   - Search still supports test/scan name, catalog ID, department, modality, and common abbreviations.

3. Added a helper instruction inside the modal.
   - Clinicians are told to click items to add/remove them and then press Done.

## CSS Integrity
No changes were made to `src/styles/index.css`.

## QA
The full project QA suite passed after this patch.
