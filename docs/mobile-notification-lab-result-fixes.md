# Mobile, Notification, Sidebar and Accepted-Sample Result Fixes

## Scope
This update fixes three reported frontend usability issues:

1. Notification drawer does not close when clicking outside it.
2. Mobile navigation pane does not close when tapping outside it on small screens.
3. Accepted Samples result-entry popup needs clear reference ranges beside result inputs.
4. Overall phone navigation/layout should be easier for mobile users.

## Implemented fixes

### Notification drawer outside click
- Added outside-click detection to `NotificationDrawer`.
- Added Escape-key close behavior.
- Kept clicks inside the drawer from closing it.
- Adjusted drawer positioning for small screens.

### Mobile sidebar outside click
- Added overlay click-to-close behavior for mobile sidebar.
- Added `stopPropagation` to keep clicks inside the sidebar from closing it unintentionally.

### Accepted Samples result-entry reference ranges
- Added a visible reference-range guide to the result-entry modal.
- Each result parameter now clearly displays:
  - Parameter name
  - Unit
  - Displayed reference range
  - Low / high limits
  - Critical low / critical high limits where configured
  - Live flag preview while typing
- Added fallback warning when a test has no editable reference-range parameters.

### Mobile usability improvements
- Reduced mobile page padding.
- Reduced mobile header height/visual density.
- Made page headers smaller on phones.
- Improved modal sizing/scrolling on phones.
- Added click-outside modal close behavior.
- Limited mobile table cards to the most useful columns to reduce clutter.

## CSS styling status
No direct changes were made to `src/styles/index.css`. The mobile improvements were applied through component-level Tailwind classes.

## QA
`npm run qa` passed after the update.
