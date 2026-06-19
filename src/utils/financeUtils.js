import { getById } from './formatters';

export function invoiceTotal(invoice = {}) {
  return Number(invoice.amount || 0) + Number(invoice.tax || 0) - Number(invoice.discount || 0);
}

export function invoicePaid(invoice = {}) {
  return (invoice.transactions || []).filter((txn) => txn.status === 'Paid').reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
}

export function invoiceBalance(invoice = {}) {
  return Math.max(0, invoiceTotal(invoice) - invoicePaid(invoice));
}

export function invoiceContext(data, invoice = {}) {
  const order = getById(data.orders || [], invoice.orderId);
  const patient = order ? getById(data.patients || [], order.patientId) : null;
  const doctor = order ? getById(data.doctors || [], order.doctorId) : null;
  const hospital = order ? getById(data.hospitals || [], order.hospitalId) : null;
  return { order, patient, doctor, hospital };
}

export function paymentRows(data = {}) {
  return (data.invoices || []).flatMap((invoice) => (invoice.transactions || [])
    .filter((txn) => txn.status === 'Paid')
    .map((txn) => ({ ...txn, invoiceId: invoice.id, orderId: invoice.orderId, invoice, ...invoiceContext(data, invoice) })));
}

export function buildFloatRows(data = {}) {
  const payments = paymentRows(data).map((txn) => ({
    id: txn.id,
    createdAt: txn.createdAt,
    type: 'In',
    method: txn.method || 'Transfer',
    amount: Number(txn.amount || 0),
    description: `Payment · ${txn.patient?.fullName || txn.orderId || txn.invoiceId}`,
    staff: txn.staff || txn.recordedBy || 'Billing',
    reference: txn.invoiceId,
    shiftId: txn.shiftId || '',
    patientName: txn.patient?.fullName || '',
    hospitalName: txn.hospital?.name || ''
  }));
  const manual = (data.floatAdjustments || []).map((row) => ({ ...row, patientName: '', hospitalName: '', reference: row.reference || row.id }));
  return [...payments, ...manual].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function buildLedgerRows(data = {}) {
  const rows = [];
  paymentRows(data).forEach((txn) => rows.push({
    id: `LED-${txn.id}`,
    createdAt: txn.createdAt,
    type: 'Credit',
    category: 'Billing Payment',
    description: `Invoice payment · ${txn.patient?.fullName || txn.invoiceId}`,
    reference: txn.invoiceId,
    method: txn.method || 'Transfer',
    staff: txn.staff || 'Billing',
    credit: Number(txn.amount || 0),
    debit: 0
  }));
  (data.expenses || []).forEach((expense) => (expense.payments || []).forEach((pay) => rows.push({
    id: `LED-${pay.id}`,
    createdAt: pay.createdAt,
    type: 'Debit',
    category: expense.category || 'Expense',
    description: `Expense payment · ${expense.description}`,
    reference: expense.reference || expense.id,
    method: pay.method || expense.method || 'Cash',
    staff: pay.staff || expense.createdBy || 'Finance',
    credit: 0,
    debit: Number(pay.amount || 0)
  })));
  (data.floatAdjustments || []).forEach((entry) => rows.push({
    id: `LED-${entry.id}`,
    createdAt: entry.createdAt,
    type: entry.type === 'Out' ? 'Debit' : 'Credit',
    category: 'Float Adjustment',
    description: entry.description,
    reference: entry.reference || entry.id,
    method: entry.method || 'Cash',
    staff: entry.staff || 'Finance',
    credit: entry.type === 'Out' ? 0 : Number(entry.amount || 0),
    debit: entry.type === 'Out' ? Number(entry.amount || 0) : 0
  }));
  return rows.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((row, index, sorted) => ({
    ...row,
    balance: sorted.slice(0, index + 1).reduce((sum, item) => sum + Number(item.credit || 0) - Number(item.debit || 0), 0)
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function dateInRange(value, start, end) {
  if (!value) return true;
  const time = new Date(value).getTime();
  if (start && time < new Date(`${start}T00:00:00`).getTime()) return false;
  if (end && time > new Date(`${end}T23:59:59`).getTime()) return false;
  return true;
}

export function uniqueCashiers(data = {}) {
  const names = new Set();
  (data.financeShifts || []).forEach((shift) => { if (shift.startedBy) names.add(shift.startedBy); if (shift.closedBy) names.add(shift.closedBy); });
  paymentRows(data).forEach((txn) => { if (txn.staff) names.add(txn.staff); });
  (data.expenses || []).forEach((expense) => { if (expense.createdBy) names.add(expense.createdBy); (expense.payments || []).forEach((pay) => pay.staff && names.add(pay.staff)); });
  (data.floatAdjustments || []).forEach((row) => row.staff && names.add(row.staff));
  return Array.from(names).sort();
}

export function denominationTotal(denominations = {}) {
  const values = { n200: 200, n100: 100, n50: 50, n20: 20, n10: 10, n5: 5, c2: 2, c1: 1 };
  return Object.entries(values).reduce((sum, [key, value]) => sum + Number(denominations[key] || 0) * value, 0);
}
