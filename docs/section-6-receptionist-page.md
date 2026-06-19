# Section 6 — Receptionist Page

Implemented on top of the PRD-driven React/Tailwind build.

## Included

- Incoming Orders Queue
- Patient Check-In
- Order Confirmation Panel
- Appointment Scheduler
- Walk-in Registration Form
- Order Cancellation/Reschedule actions with required reasons
- Daily Visit Log
- Duplicate Patient Resolution flags

## Store Actions

- `CONFIRM_RECEPTION_ORDER`
- `CHECK_IN_PATIENT`
- `CREATE_WALK_IN_PATIENT`
- `CREATE_APPOINTMENT`
- `UPDATE_APPOINTMENT_STATUS`
- `FLAG_DUPLICATE_PATIENT`

## Test Flow

1. Login as `reception` / `reception123`.
2. Open Incoming Orders.
3. Confirm a Submitted order.
4. Open Patient Check-In and check in a patient.
5. Register a walk-in.
6. Open Appointments and schedule/cancel/reschedule a visit.
7. Login as Admin and confirm the Audit Log shows the actions.
