# Section 11 — Results Delivery System

## Scope
This section implements the PRD result-release behavior after an order reaches `Final / Released`.

## Delivery paths implemented
- In-platform doctor dashboard notification
- PDF report record generation with a secure demo token
- Email delivery event placeholder with retry state
- SMS delivery event placeholder with privacy-safe wording

## Privacy rule
SMS notifications never include patient names, test names, result values, diagnoses, or clinical detail. SMS events include only a prompt to log in and view a result.

## New route
- `result-delivery` — Admin/Billing delivery monitor

## New engine helpers
- `createResultDeliveryBundle()`
- `retryDeliveryNotification()`
- `markReportDownloaded()`
- `getSafeSmsBody()`

## New store actions
- `PREPARE_RESULT_DELIVERY`
- `RETRY_DELIVERY_NOTIFICATION`
- `MARK_NOTIFICATION_DELIVERED`
- `MARK_DOCTOR_NOTIFICATION_READ`
- `MARK_REPORT_DOWNLOADED`

## QA path
1. Log in as `admin / admin123`.
2. Open **Result Delivery**.
3. Confirm released orders show PDF report and delivery channel status.
4. Click **Re-send** to generate a forced delivery bundle.
5. Retry or mark queued events as delivered.
6. Log in as `doctor / doctor123` and open **Results Viewer**.
7. Download/print the finalized report.
