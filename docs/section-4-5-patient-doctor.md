# Sections 4 and 5 — Patient Records and Doctor Portal

## Section 4: Patient Record Module
Implemented the PRD master patient record as a reusable core module. It now includes patient list/search, add/edit patient modal, duplicate-warning logic, patient profile view, referral linkage, insurance fields, clinical flags, audit logging, and full order history connected by Patient ID.

### Covered PRD fields
- Patient ID
- Full Name
- Date of Birth and calculated age
- Gender
- Phone Number
- Email Address
- Address
- National ID / Passport No.
- Referring Hospital
- Referring Doctor
- Insurance Provider & Policy No.
- Emergency Contact
- Order History
- Allergy / Known Conditions Notes
- Created Date / Last Updated

## Section 5: Doctor Portal
Implemented a hospital-side doctor workspace. It includes doctor profile, editable contact/license details, new order form, active orders, completed orders, on-screen result viewer, print/save-as-PDF report action, notification preferences, patient search, and hospital/account info.

### Covered PRD components
- Doctor Profile
- New Order Form
- My Orders (Active)
- My Orders (Completed)
- Result Viewer
- Download Report (PDF via browser print/save)
- Notification Preferences
- Patient Search
- Hospital/Account Info

## Workflow check
A doctor can create an order using an existing patient or a new patient. The order creates an invoice, enters Submitted status, appears in the reception workflow, and can move through the lifecycle using the Section 2 workflow engine.
