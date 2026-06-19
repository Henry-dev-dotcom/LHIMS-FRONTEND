# Section 8 — Scan / Imaging Unit

Implemented from the PRD scan/imaging requirements.

## Included

- Scan order queue filtered by modality, urgency, status and search text.
- Equipment and room booking.
- Image/DICOM upload control storing browser-demo file metadata.
- Radiologist findings and impression fields.
- Comparison to prior scans for the same patient/modality.
- Review/sign-off action.
- Internal technician notes not visible to doctors.
- Equipment list and booking records page.
- Audit events for equipment booking, report entry and sign-off.

## Pages

- `scan-queue`
- `equipment-booking`

## Test path

1. Login as `scan` / `scan123`.
2. Open Scan Queue.
3. Open a confirmed/pending imaging order.
4. Book equipment/room.
5. Attach one or more image/DICOM files.
6. Enter findings and impression.
7. Submit report for review.
8. Use Radiologist sign-off.
9. Check Audit Log as Admin.
