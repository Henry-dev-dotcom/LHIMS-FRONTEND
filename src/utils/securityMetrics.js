import { NAV_ITEMS, ROLES } from '../data/roles';
import { formatDateTime } from './formatters';

const CLINICAL_TERMS = [
  'haemoglobin', 'wbc', 'platelets', 'glucose', 'bilirubin', 'alt', 'ast',
  'fracture', 'mass', 'lesion', 'critical', 'high', 'low', 'abnormal', 'positive', 'negative'
];

export function buildAccessMatrix() {
  return NAV_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    section: item.section,
    allowedRoles: item.roles,
    blockedRoles: ROLES.map((role) => role.id).filter((roleId) => !item.roles.includes(roleId))
  }));
}

export function scanSmsPrivacy(data) {
  const patients = data.patients || [];
  const catalog = data.catalog || [];
  const smsNotifications = (data.notifications || []).filter((item) => item.channel === 'SMS');
  return smsNotifications.map((notification) => {
    const body = String(notification.body || '').toLowerCase();
    const patientMatches = patients.filter((patient) => {
      const parts = String(patient.fullName || '').toLowerCase().split(/\s+/).filter(Boolean);
      return parts.length && parts.some((part) => part.length > 3 && body.includes(part));
    }).map((patient) => patient.fullName);
    const itemMatches = catalog.filter((item) => body.includes(String(item.name || '').toLowerCase())).map((item) => item.name);
    const clinicalMatches = CLINICAL_TERMS.filter((term) => body.includes(term));
    const findings = [...new Set([...patientMatches, ...itemMatches, ...clinicalMatches])];
    return {
      ...notification,
      privacyStatus: findings.length ? 'Needs Review' : 'Safe',
      findings,
      checkedAt: new Date().toISOString()
    };
  });
}

export function getAuditCoverage(data) {
  const logs = data.auditLogs || [];
  const modules = [
    'Doctor Portal',
    'Reception',
    'Laboratory',
    'Imaging',
    'Billing / Finance',
    'Admin / User Management',
    'Admin / Hospital Partners',
    'Admin / Catalog Management',
    'Admin / Department Management',
    'Admin / Notification Settings',
    'Results Delivery',
    'Reporting',
    'Security / Access Control'
  ];
  return modules.map((module) => {
    const count = logs.filter((log) => log.module === module || String(log.module || '').startsWith(module)).length;
    return {
      id: module,
      module,
      events: count,
      status: count > 0 ? 'Covered' : 'No Events Yet',
      lastEvent: logs.find((log) => log.module === module || String(log.module || '').startsWith(module))?.timestamp || ''
    };
  });
}

export function getReliabilityChecks(data) {
  const orders = data.orders || [];
  const invoices = data.invoices || [];
  const results = data.results || [];
  const reports = data.resultReports || [];
  const notifications = data.notifications || [];
  const checks = [];

  const ordersWithoutPatients = orders.filter((order) => !(data.patients || []).some((patient) => patient.id === order.patientId));
  checks.push({ id: 'integrity-patient-link', name: 'Order → Patient linkage', status: ordersWithoutPatients.length ? 'Attention' : 'Healthy', count: ordersWithoutPatients.length, detail: 'Every order should link to a valid Patient ID.' });

  const confirmedWithoutInvoices = orders.filter((order) => ['Confirmed', 'In Progress', 'Pending Review', 'Final / Released'].includes(order.status) && !invoices.some((invoice) => invoice.orderId === order.id));
  checks.push({ id: 'integrity-invoices', name: 'Confirmed orders → Invoices', status: confirmedWithoutInvoices.length ? 'Attention' : 'Healthy', count: confirmedWithoutInvoices.length, detail: 'Confirmed or processed orders should have invoice records.' });

  const finalWithoutReport = orders.filter((order) => order.status === 'Final / Released' && !reports.some((report) => report.orderId === order.id));
  checks.push({ id: 'integrity-final-report', name: 'Final orders → PDF report records', status: finalWithoutReport.length ? 'Attention' : 'Healthy', count: finalWithoutReport.length, detail: 'Released orders should have a generated PDF-ready report record.' });

  const finalWithoutDelivery = orders.filter((order) => order.status === 'Final / Released' && !notifications.some((notification) => notification.entityId === order.id && notification.deliveryType === 'Result Release'));
  checks.push({ id: 'integrity-delivery', name: 'Final orders → Delivery events', status: finalWithoutDelivery.length ? 'Attention' : 'Healthy', count: finalWithoutDelivery.length, detail: 'Released orders should trigger in-platform, email, and/or SMS delivery events.' });

  const failedNotifications = notifications.filter((notification) => ['Failed', 'Error'].includes(notification.status) || Number(notification.retryCount || 0) > Number(notification.maxRetries || 3));
  checks.push({ id: 'reliability-notifications', name: 'Notification failures', status: failedNotifications.length ? 'Attention' : 'Healthy', count: failedNotifications.length, detail: 'Failed email/SMS deliveries should be retried and visible to Admin.' });

  const pendingReviewWithoutResults = orders.filter((order) => order.status === 'Pending Review' && !results.some((result) => result.orderId === order.id));
  checks.push({ id: 'integrity-review-results', name: 'Pending review orders → Result records', status: pendingReviewWithoutResults.length ? 'Attention' : 'Healthy', count: pendingReviewWithoutResults.length, detail: 'Orders in review should have at least one result/report record.' });

  return checks;
}

export function getSecuritySummary(data) {
  const privacy = scanSmsPrivacy(data);
  const auditCoverage = getAuditCoverage(data);
  const reliability = getReliabilityChecks(data);
  const deniedEvents = (data.securityEvents || []).filter((event) => event.type === 'Access Denied');
  return {
    privacySafe: privacy.filter((item) => item.privacyStatus === 'Safe').length,
    privacyReview: privacy.filter((item) => item.privacyStatus !== 'Safe').length,
    auditCoveredModules: auditCoverage.filter((item) => item.status === 'Covered').length,
    auditTotalModules: auditCoverage.length,
    reliabilityHealthy: reliability.filter((item) => item.status === 'Healthy').length,
    reliabilityAttention: reliability.filter((item) => item.status !== 'Healthy').length,
    deniedAccessCount: deniedEvents.length
  };
}

export function exportSecurityDataset(data) {
  return {
    generatedAt: new Date().toISOString(),
    summary: getSecuritySummary(data),
    accessMatrix: buildAccessMatrix(),
    smsPrivacyScan: scanSmsPrivacy(data),
    auditCoverage: getAuditCoverage(data),
    reliabilityChecks: getReliabilityChecks(data),
    securityEvents: data.securityEvents || [],
    notificationFailures: (data.notifications || []).filter((item) => ['Failed', 'Error'].includes(item.status) || Number(item.retryCount || 0) > 0),
    auditTail: (data.auditLogs || []).slice(0, 100).map((event) => ({ ...event, timestampLabel: formatDateTime(event.timestamp) }))
  };
}
