# Frontend Stage 26 — Header Dropdown Layering Fix

## Purpose

Fixes the header dropdown issue where notification and user menu dropdowns could appear underneath the main page content.

## Changes

- Header layer raised above page content.
- Header/card overflow changed to visible so dropdowns are not clipped.
- User menu now renders through a React portal attached to `document.body`.
- Notification drawer now renders through a React portal attached to `document.body`.
- Dropdowns use fixed viewport positioning based on the trigger button position.
- Main page content is explicitly placed on a lower z-index layer.
- Modal overlay remains above header dropdowns.

## QA

Run:

```bash
npm run qa
```

Additional dedicated check:

```bash
npm run lint:stage26
```
