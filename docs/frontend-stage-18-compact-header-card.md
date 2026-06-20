# Frontend Stage 18 — Compact Header Card Refinement

## Change requested
The global page header/title area should remain inside a white rounded container like the previous design, but the container height should be reduced.

## Implementation
- Restored the global page header content into a white rounded card inside the sticky top app bar.
- Kept the page title, eyebrow, page description, page actions, notification, Home, and Reset controls in the same compact header container.
- Reduced header height using tighter padding, smaller icon sizing, and a single-line description clamp.
- Applied globally because all pages use `src/layouts/Header.jsx` and `src/components/ui/PageHeader.jsx`.

## QA
- Added `npm run lint:stage18`.
- Updated the package version to `12.8.0`.
