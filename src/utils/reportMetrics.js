import { getById } from './formatters';
import { getOrderItems } from './orderViews';

function toTime(value) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function hoursBetween(start, end) {
  const a = toTime(start);
  const b = toTime(end);
  if (!a || !b) return 0;
  return Math.max(0, Math.round(((b - a) / 36e5) * 10) / 10);
}

export function dayKey(value) {
  const time = toTime(value);
  if (!time) return 'Unknown date';
  return new Date(time).toISOString().slice(0, 10);
}

export function monthKey(value) {
  const time = toTime(value);
  if (!time) return 'Unknown month';
  return new Date(time).toISOString().slice(0, 7);
}

function inDateRange(value, startDate, endDate) {
  const time = toTime(value);
  if (!time) return false;
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`).getTime();
    if (time < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59`).getTime();
    if (time > end) return false;
  }
  return true;
}

function containsDepartment(order, department) {
  if (!department) return true;
  return (order.routedDepartments || []).includes(department);
}

function orderMatchesFilters(order, filters = {}) {
  return (
    inDateRange(order.createdAt || order.updatedAt, filters.startDate, filters.endDate) &&
    (!filters.hospitalId || order.hospitalId === filters.hospitalId) &&
    (!filters.doctorId || order.doctorId === filters.doctorId) &&
    (!filters.status || order.status === filters.status) &&
    containsDepartment(order, filters.department)
  );
}

export function aggregateBy(list, keyFn, extra = {}) {
  return Object.values(list.reduce((acc, item) => {
    const key = keyFn(item) || 'Unknown';
    if (!acc[key]) acc[key] = { id: key, label: key, count: 0, ...extra };
    acc[key].count += 1;
    return acc;
  }, {})).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function sumBy(list, valueFn) {
  return list.reduce((sum, item) => sum + Number(valueFn(item) || 0), 0);
}

export function buildReportingDataset(data, filters = {}) {
  const hospitals = data.hospitals || [];
  const doctors = data.doctors || [];
  const patients = data.patients || [];
  const catalog = data.catalog || [];
  const orders = (data.orders || []).filter((order) => orderMatchesFilters(order, filters));
  const orderIds = new Set(orders.map((order) => order.id));
  const invoices = (data.invoices || []).filter((invoice) => orderIds.has(invoice.orderId));
  const results = (data.results || []).filter((result) => orderIds.has(result.orderId));
  const auditLogs = (data.auditLogs || []).filter((log) => inDateRange(log.timestamp, filters.startDate, filters.endDate));
  const deliveryNotifications = (data.notifications || [])
    .filter((note) => ['Result Release', 'Patient Result Notice'].includes(note.deliveryType))
    .filter((note) => inDateRange(note.createdAt, filters.startDate, filters.endDate));

  const enrichedOrders = orders.map((order) => {
    const items = getOrderItems(order, catalog);
    return {
      ...order,
      patient: getById(patients, order.patientId),
      doctor: getById(doctors, order.doctorId),
      hospital: getById(hospitals, order.hospitalId),
      items,
      invoice: invoices.find((invoice) => invoice.orderId === order.id),
      results: results.filter((result) => result.orderId === order.id)
    };
  });

  const finalizedOrders = enrichedOrders.filter((order) => order.status === 'Final / Released');
  const tatRows = finalizedOrders.map((order) => {
    const departmentRows = (order.routedDepartments || ['Unknown']).map((department) => {
      const result = order.results.find((item) => item.department === department);
      const departmentItems = order.items.filter((item) => item.department === department).map((item) => item.name).join(', ') || '—';
      return {
        id: `${order.id}-${department}`,
        orderId: order.id,
        patient: order.patient?.fullName || '—',
        hospital: order.hospital?.name || '—',
        doctor: order.doctor?.name || '—',
        department,
        tests: departmentItems,
        submittedAt: order.createdAt,
        releasedAt: result?.approvedAt || order.updatedAt,
        tatHours: hoursBetween(order.createdAt, result?.approvedAt || order.updatedAt),
        urgency: order.urgency || 'Routine'
      };
    });
    return departmentRows;
  }).flat();

  const orderVolumeByHospital = aggregateBy(enrichedOrders, (order) => order.hospital?.name);
  const orderVolumeByDoctor = aggregateBy(enrichedOrders, (order) => order.doctor?.name);
  const orderVolumeByDepartment = aggregateBy(
    enrichedOrders.flatMap((order) => (order.routedDepartments || []).map((department) => ({ ...order, department }))),
    (item) => item.department
  );
  const orderVolumeByDay = aggregateBy(enrichedOrders, (order) => dayKey(order.createdAt));
  const orderVolumeByStatus = aggregateBy(enrichedOrders, (order) => order.status);

  const invoiceRows = invoices.map((invoice) => {
    const order = enrichedOrders.find((item) => item.id === invoice.orderId) || getById(data.orders || [], invoice.orderId) || {};
    const amount = Number(invoice.amount || 0) + Number(invoice.tax || 0) - Number(invoice.discount || 0);
    return {
      ...invoice,
      amount,
      orderId: invoice.orderId,
      hospital: getById(hospitals, order.hospitalId)?.name || '—',
      doctor: getById(doctors, order.doctorId)?.name || '—',
      patient: getById(patients, order.patientId)?.fullName || '—',
      createdDay: dayKey(invoice.createdAt),
      createdMonth: monthKey(invoice.createdAt)
    };
  });

  const revenueByMonth = Object.values(invoiceRows.reduce((acc, row) => {
    const key = row.createdMonth;
    if (!acc[key]) acc[key] = { id: key, label: key, collected: 0, outstanding: 0, insurancePending: 0, refunded: 0, invoices: 0 };
    acc[key].invoices += 1;
    if (row.status === 'Paid') acc[key].collected += row.amount;
    else if (row.status === 'Insurance Pending') acc[key].insurancePending += row.amount;
    else if (row.status === 'Refunded') acc[key].refunded += row.amount;
    else acc[key].outstanding += row.amount;
    return acc;
  }, {})).sort((a, b) => b.label.localeCompare(a.label));

  const abnormalRows = results.map((result) => {
    const order = enrichedOrders.find((item) => item.id === result.orderId) || getById(data.orders || [], result.orderId) || {};
    const abnormalParameters = (result.parameters || []).filter((parameter) => ['High', 'Low', 'Critical', 'Abnormal'].includes(parameter.flag));
    const hasAbnormal = Boolean(result.abnormal || abnormalParameters.length);
    return {
      ...result,
      patient: getById(patients, order.patientId)?.fullName || '—',
      doctor: getById(doctors, order.doctorId)?.name || '—',
      hospital: getById(hospitals, order.hospitalId)?.name || '—',
      abnormalParameters: abnormalParameters.map((parameter) => `${parameter.name}: ${parameter.value} ${parameter.unit || ''} (${parameter.flag})`).join('; '),
      hasAbnormal
    };
  });

  const abnormalByDepartment = Object.values(abnormalRows.reduce((acc, row) => {
    const key = row.department || 'Unknown';
    if (!acc[key]) acc[key] = { id: key, label: key, total: 0, abnormal: 0, rate: 0 };
    acc[key].total += 1;
    if (row.hasAbnormal) acc[key].abnormal += 1;
    acc[key].rate = Math.round((acc[key].abnormal / acc[key].total) * 100);
    return acc;
  }, {}));

  const deliveryRows = deliveryNotifications.map((note) => ({
    id: note.id,
    orderId: note.entityId || '—',
    channel: note.channel || 'In-platform',
    audience: note.audience || 'doctor',
    status: note.status || 'Queued',
    target: note.target || note.audience || '—',
    retryCount: note.retryCount || 0,
    privacyChecked: note.privacyChecked ? 'Yes' : note.channel === 'SMS' ? 'No' : 'N/A',
    createdAt: note.createdAt,
    deliveredAt: note.deliveredAt || '',
    title: note.title || ''
  })).sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));

  const deliverySummary = Object.values(deliveryRows.reduce((acc, row) => {
    const key = row.channel || 'Unknown';
    if (!acc[key]) acc[key] = { id: key, label: key, total: 0, delivered: 0, queued: 0, failed: 0, successRate: 0 };
    acc[key].total += 1;
    if (row.status === 'Delivered' || row.status === 'Read' || row.status === 'Printed') acc[key].delivered += 1;
    else if (row.status === 'Failed') acc[key].failed += 1;
    else acc[key].queued += 1;
    acc[key].successRate = acc[key].total ? Math.round((acc[key].delivered / acc[key].total) * 100) : 0;
    return acc;
  }, {})).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

  const staffProductivity = Object.values(auditLogs.reduce((acc, log) => {
    const actor = log.actor || 'Unknown';
    if (!acc[actor]) acc[actor] = { id: actor, staff: actor, role: log.role || '—', actions: 0, modules: new Set(), approvals: 0, resultActions: 0 };
    acc[actor].actions += 1;
    acc[actor].modules.add(log.module || 'Unknown');
    if (/sign-off|approved|released/i.test(`${log.action} ${log.details}`)) acc[actor].approvals += 1;
    if (/result|sample|scan|laboratory|imaging/i.test(`${log.module} ${log.action}`)) acc[actor].resultActions += 1;
    return acc;
  }, {})).map((row) => ({ ...row, modules: Array.from(row.modules).join(', ') })).sort((a, b) => b.actions - a.actions);

  const paid = sumBy(invoiceRows.filter((invoice) => invoice.status === 'Paid'), (invoice) => invoice.amount);
  const outstanding = sumBy(invoiceRows.filter((invoice) => !['Paid', 'Refunded'].includes(invoice.status)), (invoice) => invoice.amount);
  const insurancePending = sumBy(invoiceRows.filter((invoice) => invoice.status === 'Insurance Pending'), (invoice) => invoice.amount);
  const refunded = sumBy(invoiceRows.filter((invoice) => invoice.status === 'Refunded'), (invoice) => invoice.amount);
  const avgTat = tatRows.length ? Math.round((sumBy(tatRows, (row) => row.tatHours) / tatRows.length) * 10) / 10 : 0;
  const abnormalCount = abnormalRows.filter((row) => row.hasAbnormal).length;
  const abnormalRate = abnormalRows.length ? Math.round((abnormalCount / abnormalRows.length) * 100) : 0;
  const deliveredCount = deliveryRows.filter((row) => ['Delivered', 'Read', 'Printed'].includes(row.status)).length;
  const deliverySuccessRate = deliveryRows.length ? Math.round((deliveredCount / deliveryRows.length) * 100) : 0;

  return {
    filters,
    generatedAt: new Date().toISOString(),
    metrics: {
      orders: enrichedOrders.length,
      finalizedOrders: finalizedOrders.length,
      avgTat,
      paid,
      outstanding,
      insurancePending,
      refunded,
      abnormalCount,
      abnormalRate,
      auditEvents: auditLogs.length,
      deliveryEvents: deliveryRows.length,
      deliverySuccessRate
    },
    orders: enrichedOrders,
    invoices: invoiceRows,
    results: abnormalRows,
    tatRows,
    orderVolumeByHospital,
    orderVolumeByDoctor,
    orderVolumeByDepartment,
    orderVolumeByDay,
    orderVolumeByStatus,
    revenueByMonth,
    abnormalByDepartment,
    staffProductivity,
    deliveryRows,
    deliverySummary
  };
}

export function exportJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(filename, rows = []) {
  const safeRows = rows.map((row) => {
    const normalized = {};
    Object.entries(row).forEach(([key, value]) => {
      if (value && typeof value === 'object') return;
      normalized[key] = value ?? '';
    });
    return normalized;
  });
  const headers = Object.keys(safeRows[0] || { empty: '' });
  const csv = [
    headers.join(','),
    ...safeRows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
