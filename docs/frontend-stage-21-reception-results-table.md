# Frontend Stage 21 — Reception Results Inbox Table Compacting

## Change request
Remove the Flag column from the Receptionist Results Inbox table so the results page does not require horizontal left/right scrolling.

## Implemented
- Removed the `Flag` table column from `ReceptionResultsInboxPage.jsx`.
- Kept abnormal-result filtering and the Abnormal section intact.
- Compactly reduced the investigations chip column width.
- Compactly reduced the action buttons so Print, Email and WhatsApp controls fit better within the table.
- Added a Stage 21 QA guard to prevent the Flag column from returning.

## QA
Run:

```bash
npm run lint:stage21
npm run build
npm run build:standalone
```
