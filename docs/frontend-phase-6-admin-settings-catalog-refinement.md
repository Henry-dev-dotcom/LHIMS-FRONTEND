# Phase 6 — Admin Settings & Catalog Refinement

## Completed scope

This phase refined the Admin configuration area before backend work begins.

## Implemented improvements

### Admin Settings workbench
- Added tabbed Admin Settings navigation:
  - Catalog
  - Reference Ranges
  - Departments
  - Equipment
  - Config Export
- Added catalog search by ID, name, abbreviation, department, modality, and alias text.
- Added Lab / Scan catalog filter.
- Added backend-readiness configuration export.

### Catalog editor
- Admin can create and edit lab/scan items.
- Catalog items now include:
  - Catalog ID display
  - Name
  - Type
  - Department
  - Modality
  - Search aliases
  - Price
  - Expected completion hours
  - Sample type

### Reference range editor
- Added a focused Reference Range workbench.
- Admin can edit lab parameters:
  - Parameter name
  - Unit
  - Low
  - High
  - Critical Low
  - Critical High
  - Displayed reference range
  - Gender foundation
  - Age min / max foundation
  - Method / analyzer note
- The range data is used by Lab Accepted Samples result entry and automatic flagging.

### Department and equipment management
- Department editor now supports controlled department types.
- Equipment editor now supports:
  - Modality
  - Status
  - Serial number
  - Service due date
  - Notes
- Imaging equipment remains connected to scan workflow and booking pages.

### Export and backend readiness
- Added JSON export for:
  - Catalog
  - Reference ranges
  - Departments
  - Equipment
  - Hospitals
  - Doctors
  - User-role mappings
- Added configuration readiness checklist.
- Export review action creates an audit event.

## QA

The full QA suite passed:

```bash
npm run qa
```

Result: passed.

## Notes

This is still frontend/local demo configuration. Backend implementation will later persist these settings in PostgreSQL and expose them through Admin APIs.
