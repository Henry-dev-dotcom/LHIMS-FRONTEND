# Frontend Stage 25 — Static Header Card

## Request
The top page heading/header card should not stick or slide to the top while the user scrolls. It must remain in normal page flow while keeping the white container styling from Stage 18/24.

## Implementation
- Changed the shared `Header` layout from `sticky top-0` to `relative` positioning.
- Kept the header inside the main content area so it does not overlap the fixed left sidebar.
- Preserved the top-right notification, Home, Reset, and user menu controls.
- Patched compiled browser assets so the offline/standalone preview reflects the same behavior.

## Scope
Frontend-only layout correction. Backend unchanged.
