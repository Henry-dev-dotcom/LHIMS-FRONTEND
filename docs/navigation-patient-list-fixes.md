# Navigation + Doctor New Order Compact List Fixes

## Changes

1. The desktop navigation pane is now fixed to the left side of the viewport, so it does not scroll away or disappear when the user scrolls through long pages.
2. The main content area now has a desktop left margin matching the fixed navigation width.
3. The clinician/doctor New Order "Matching existing patients" area now renders as a compact scrollable list instead of large cards.
4. Patient rows now show compact identity details, contact info, and a Select/Selected state.
5. No global CSS styling file was changed; updates were made through React layout classes only.

## Acceptance checks

- Sidebar remains visible while scrolling on desktop.
- Mobile navigation still opens as an overlay.
- Matching existing patients takes much less vertical/horizontal space.
- Existing patient selection still works.
