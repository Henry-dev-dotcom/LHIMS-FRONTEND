# Section 13 — Security, Audit & Reliability Layer

This section adds the frontend control surface for the PRD non-functional requirements.

## Included controls

- Role-based access-control matrix for all route/page permissions.
- Protected-route access-denied event logging.
- Audit coverage summary across platform modules.
- SMS privacy scanner to detect patient names, test names, or clinical terms in SMS alerts.
- Reliability and data-integrity monitor for order→patient, order→invoice, final order→report, final order→delivery, and pending review→result relationships.
- Delivery retry monitor for queued/failed/retried email/SMS events.
- Security and reliability dataset JSON export.
- Security events and backup export records stored in app state.

## Backend-required notes

The frontend represents the control surface. Production still requires server-side encryption, immutable audit storage, secure authentication/session handling, database backups, and provider-level retry workers.
