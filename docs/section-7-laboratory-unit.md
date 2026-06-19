# Section 7 — Laboratory Unit

Implemented from the PRD laboratory requirements.

## Included

- Lab order queue filtered by status, urgency and search text.
- Sample collection log with sample ID, time, collector and sample type.
- Test panel checklist grouped by ordered lab tests.
- Structured result entry per catalog parameter.
- Automatic result flagging against reference ranges.
- Equipment/analyzer reference.
- Internal QA notes that are not doctor-facing.
- Review/sign-off action.
- Retest/reject sample action with required reason.
- Audit events for sample collection, sample rejection, result entry and sign-off.

## Pages

- `lab-queue`
- `sample-log`

## Test path

1. Login as `lab` / `lab123`.
2. Open Lab Queue.
3. Open a confirmed/pending lab order.
4. Log a sample.
5. Enter all parameter values.
6. Submit result for review.
7. Use Senior sign-off.
8. Check Audit Log as Admin.
