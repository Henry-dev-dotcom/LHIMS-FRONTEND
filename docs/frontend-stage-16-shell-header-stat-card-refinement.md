# Frontend Stage 16 — Shell Header and Stat Card Refinement

## Summary

This stage removes the visible shell workspace banner from the top of every authenticated page and makes the page-level `PageHeader` the primary title area across all department pages.

## Changes

- Removed the visible workspace identity text from the sticky application header.
- Kept the header controls for notifications, Home, and Reset.
- Tightened the sticky header height and spacing.
- Reduced global `PageHeader` vertical padding slightly so department pages start cleaner.
- Reduced `MetricCard` default and compact sizing.
- Reduced repeated custom stat-summary cards used in doctor, admin, patient, and dashboard pages.
- Added Stage 16 QA checks to guard against visible pre-backend/development labels returning to the UI.

## User-facing result

The old top text banner area is no longer shown on department pages. The first visible title section is now the department page header such as Doctor Portal, Laboratory Unit, Reception Desk, Billing, Scan / Imaging, or Administration.
