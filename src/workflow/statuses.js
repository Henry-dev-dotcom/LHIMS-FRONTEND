export const ORDER_STATUSES = [
  'Submitted',
  'Confirmed',
  'In Progress',
  'Pending Review',
  'Final / Released',
  'Cancelled'
];

export const BILLING_STATUSES = [
  'Payment Pending',
  'Paid',
  'Insurance Pending',
  'Refunded'
];

export const ORDER_TRANSITIONS = {
  Submitted: ['Confirmed', 'Cancelled'],
  Confirmed: ['In Progress', 'Cancelled'],
  'In Progress': ['Pending Review', 'Cancelled'],
  'Pending Review': ['Final / Released', 'In Progress', 'Cancelled'],
  'Final / Released': [],
  Cancelled: []
};

export const STATUS_MEANING = {
  Submitted: 'Order placed by a registered doctor and awaiting reception review.',
  Confirmed: 'Reception verified patient details and routed the order to the right unit.',
  'Payment Pending': 'Invoice exists but payment is pending or not yet reconciled.',
  Paid: 'Payment has been recorded for the order invoice.',
  'Insurance Pending': 'Invoice is awaiting manual insurance reference/claim confirmation.',
  'In Progress': 'Lab or imaging staff has started processing the routed order.',
  'Pending Review': 'Result has been entered/uploaded and is awaiting senior approval/sign-off.',
  'Final / Released': 'Result has been approved, released to the referring doctor, and delivery events were created.',
  Cancelled: 'Order was cancelled by doctor, reception, or admin with a required reason.'
};

export function getNextStatuses(status) {
  return ORDER_TRANSITIONS[status] || [];
}
