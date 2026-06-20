# Frontend Stage 24 — Price Catalog Popup + Fixed Header Layer

## Updates

- The global page header shell is constrained so it does not cover the fixed left navigation during horizontal movement.
- The sidebar has a higher stacking layer than the header.
- Horizontal overflow is contained inside page/table regions instead of shifting the whole app shell.
- The Price Catalog selected-item side panel has been removed.
- Price Catalog row actions now open a popup modal for View / View-Edit details.
- The popup shows item code, type, price, expected hours, department/modality, and lab parameters/reference ranges.
- Billing/Admin can edit price and expected hours inside the popup; Reception remains view-only.

## QA

Run:

```bash
npm run lint:stage24
npm run qa
npm run build
npm run build:standalone
```
