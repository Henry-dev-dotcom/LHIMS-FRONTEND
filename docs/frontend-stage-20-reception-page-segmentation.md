# Frontend Stage 20 — Reception Page Segmentation Correction

## Goal
Correct the reception workflow layout based on the clarified requirement.

The left sidebar already navigates between reception pages. The new navigation must therefore operate inside each reception page only, separating congested page content into focused sections.

## Implemented
- Removed the cross-page `ReceptionWorkflowNav` from reception content pages.
- Added `ReceptionPageTabs` for page-specific section navigation.
- Segmented the following pages:
  - Incoming Orders
  - Patient Check-In
  - Walk-Ins
  - Appointments
  - Daily Visit Log
  - Reception Results Inbox
- Removed the extra reception workflow nav from the receptionist dashboard.
- Added Stage 20 static QA guard.

## Outcome
Receptionists continue using the left sidebar to switch between major reception pages, while each page now has a compact horizontal navigation bar for that page's own internal sections.
