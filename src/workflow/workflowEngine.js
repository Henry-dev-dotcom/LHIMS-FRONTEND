import { BILLING_STATUSES, getNextStatuses, ORDER_STATUSES } from './statuses';

export function nowIso() {
  return new Date().toISOString();
}

export function idWithPrefix(prefix, existing = []) {
  const current = existing
    .map((item) => String(item.id || '').replace(prefix, '').replace(/[^0-9]/g, ''))
    .map((value) => Number(value || 0))
    .filter(Number.isFinite);
  const next = (current.length ? Math.max(...current) : 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export function getCatalogItems(order, catalog) {
  return (order.itemIds || []).map((id) => catalog.find((item) => item.id === id)).filter(Boolean);
}

export function getOrderDepartments(order, catalog) {
  const items = getCatalogItems(order, catalog);
  return [...new Set(items.map((item) => item.department))];
}

export function computeExpectedCompletion(createdAt, itemIds, catalog, urgency = 'Routine') {
  const itemHours = itemIds.map((id) => catalog.find((item) => item.id === id)?.expectedHours || 4);
  const maxHours = itemHours.length ? Math.max(...itemHours) : 4;
  const urgencyFactor = urgency === 'Urgent' ? 0.6 : 1;
  const date = new Date(createdAt || nowIso());
  date.setHours(date.getHours() + Math.ceil(maxHours * urgencyFactor));
  return date.toISOString();
}

export function canTransitionOrder(order, nextStatus) {
  return getNextStatuses(order.status).includes(nextStatus);
}


export function getSafeSmsBody(orderId) {
  return `A diagnosis center result is ready for order ${orderId}. Please log in to view the finalized report.`;
}

export function getSecureReportToken(orderId, createdAt = nowIso()) {
  return btoa(`${orderId}:${createdAt}`).replace(/=+$/g, '').slice(0, 18);
}

export function createResultDeliveryBundle(data, orderId, { actor = 'System', role = 'system', source = 'Results Delivery', force = false } = {}) {
  const order = (data.orders || []).find((item) => item.id === orderId);
  if (!order) return { data, error: 'Order not found.' };
  const doctor = (data.doctors || []).find((item) => item.id === order.doctorId);
  const hospital = (data.hospitals || []).find((item) => item.id === order.hospitalId);
  const timestamp = nowIso();
  const existingReports = data.resultReports || [];
  const reportExists = existingReports.some((report) => report.orderId === orderId && report.status !== 'Voided');
  const report = reportExists && !force ? null : {
    id: idWithPrefix('RPT-', existingReports),
    orderId,
    doctorId: order.doctorId,
    hospitalId: order.hospitalId,
    status: 'Ready',
    secureToken: getSecureReportToken(orderId, timestamp),
    generatedAt: timestamp,
    generatedBy: actor,
    downloadedAt: '',
    downloadedBy: ''
  };

  const preferences = doctor?.notificationPreferences || { email: true, sms: true };
  const notifications = data.notifications || [];
  const alreadyHas = (channel) => notifications.some((note) => note.entityId === orderId && note.channel === channel && note.deliveryType === 'Result Release' && note.status !== 'Failed');
  const makeNotification = (channel, status, title, body, target = '') => ({
    id: idWithPrefix('NOT-', [...notifications, ...newNotifications]),
    title,
    body,
    audience: 'doctor',
    channel,
    status,
    deliveryType: 'Result Release',
    read: false,
    retryCount: 0,
    maxRetries: Number(data.notificationSettings?.retryAttempts ?? 3),
    target,
    createdAt: timestamp,
    lastAttemptAt: timestamp,
    deliveredAt: status === 'Delivered' ? timestamp : '',
    entityId: orderId,
    privacyChecked: channel === 'SMS' ? true : undefined
  });

  const newNotifications = [];
  if (force || !alreadyHas('In-platform')) {
    newNotifications.push(makeNotification(
      'In-platform',
      'Delivered',
      'Result released',
      `${orderId} has been finalized. Log in to view the report.`,
      doctor?.name || 'Clinician dashboard'
    ));
  }
  if (preferences.email && (force || !alreadyHas('Email'))) {
    newNotifications.push(makeNotification(
      'Email',
      'Queued',
      'Email result notification queued',
      (data.notificationSettings?.emailTemplate || 'Result {{orderId}} is ready. Log in to view the finalized report.').replaceAll('{{orderId}}', orderId),
      doctor?.email || ''
    ));
  }
  if (preferences.sms && (force || !alreadyHas('SMS'))) {
    newNotifications.push(makeNotification(
      'SMS',
      'Queued',
      'SMS result alert queued',
      getSafeSmsBody(orderId),
      doctor?.phone || ''
    ));
  }

  const nextReports = report ? [report, ...existingReports] : existingReports;
  const auditDetails = [
    report ? `PDF report ${report.id} generated` : 'PDF report already available',
    `${newNotifications.length} delivery event(s) queued/delivered`,
    hospital?.name ? `Hospital: ${hospital.name}` : ''
  ].filter(Boolean).join(' · ');

  return {
    data: {
      ...data,
      resultReports: nextReports,
      notifications: [...newNotifications, ...notifications],
      auditLogs: addAudit(data.auditLogs || [], {
        actor,
        role,
        action: 'Result delivery bundle prepared',
        module: source,
        entityId: orderId,
        details: auditDetails
      })
    },
    report,
    notifications: newNotifications
  };
}

export function retryDeliveryNotification(data, notificationId, { actor = 'System', role = 'admin' } = {}) {
  const notification = (data.notifications || []).find((item) => item.id === notificationId);
  if (!notification) return { data, error: 'Notification not found.' };
  const timestamp = nowIso();
  const retryCount = Number(notification.retryCount || 0) + 1;
  const maxRetries = Number(notification.maxRetries ?? data.notificationSettings?.retryAttempts ?? 3);
  const nextStatus = retryCount >= maxRetries ? 'Failed' : 'Queued';
  return {
    data: {
      ...data,
      notifications: data.notifications.map((item) => item.id === notificationId ? {
        ...item,
        retryCount,
        maxRetries,
        status: nextStatus,
        lastAttemptAt: timestamp,
        error: nextStatus === 'Failed' ? 'Retry limit reached in demo delivery engine.' : ''
      } : item),
      auditLogs: addAudit(data.auditLogs || [], {
        actor,
        role,
        action: 'Delivery notification retry attempted',
        module: 'Results Delivery',
        entityId: notification.entityId || notificationId,
        details: `${notification.channel} ${notificationId} retry ${retryCount}/${maxRetries}`
      })
    }
  };
}

export function markReportDownloaded(data, reportId, { actor = 'System', role = 'doctor' } = {}) {
  const report = (data.resultReports || []).find((item) => item.id === reportId);
  if (!report) return { data, error: 'Report not found.' };
  const timestamp = nowIso();
  return {
    data: {
      ...data,
      resultReports: data.resultReports.map((item) => item.id === reportId ? { ...item, downloadedAt: timestamp, downloadedBy: actor } : item),
      auditLogs: addAudit(data.auditLogs || [], {
        actor,
        role,
        action: 'PDF report downloaded / printed',
        module: 'Results Delivery',
        entityId: report.orderId,
        details: reportId
      })
    }
  };
}

export function transitionOrder(data, { orderId, nextStatus, actor = 'System', role = 'admin', reason = '' }) {
  const order = data.orders.find((item) => item.id === orderId);
  if (!order) return { data, error: 'Order not found.' };
  if (!ORDER_STATUSES.includes(nextStatus)) return { data, error: 'Invalid order status.' };
  if (!canTransitionOrder(order, nextStatus)) return { data, error: `${order.status} cannot move to ${nextStatus}.` };
  if (nextStatus === 'Cancelled' && !reason.trim()) return { data, error: 'Cancellation requires a reason.' };

  const timestamp = nowIso();
  const updatedOrder = {
    ...order,
    status: nextStatus,
    updatedAt: timestamp,
    cancellationReason: nextStatus === 'Cancelled' ? reason : order.cancellationReason,
    timeline: [
      ...(order.timeline || []),
      { status: nextStatus, actor, role, timestamp, reason: reason || undefined }
    ]
  };

  let results = data.results || [];
  let notifications = data.notifications || [];

  if (nextStatus === 'Pending Review' && !results.some((result) => result.orderId === orderId)) {
    const departments = getOrderDepartments(order, data.catalog);
    results = departments.map((department, index) => ({
      id: idWithPrefix('RES-', [...results, ...Array.from({ length: index }, (_, i) => ({ id: `RES-${i + 999}` }))]),
      orderId,
      department,
      status: 'Pending Review',
      parameters: department === 'Laboratory' ? [
        { name: 'Haemoglobin', value: '12.8', unit: 'g/dL', referenceRange: '12.0 - 16.0', flag: 'Normal' },
        { name: 'WBC', value: '12.4', unit: '10^9/L', referenceRange: '4.0 - 11.0', flag: 'High' }
      ] : [],
      reportText: department === 'Imaging' ? 'Preliminary imaging report entered. Awaiting radiologist sign-off.' : 'Structured lab result entered. Awaiting senior review.',
      approvedBy: '',
      approvedAt: '',
      createdAt: timestamp
    })).concat(results);
  }

  let resultReports = data.resultReports || [];

  if (nextStatus === 'Final / Released') {
    results = results.map((result) => result.orderId === orderId ? {
      ...result,
      status: 'Final / Released',
      approvedBy: actor,
      approvedAt: timestamp
    } : result);
    const delivery = createResultDeliveryBundle({ ...data, results, notifications, resultReports }, orderId, { actor, role, source: 'Workflow Engine' });
    if (!delivery.error) {
      notifications = delivery.data.notifications;
      resultReports = delivery.data.resultReports || [];
    }
  }

  const auditLogs = addAudit(data.auditLogs || [], {
    actor,
    role,
    action: `Order moved from ${order.status} to ${nextStatus}`,
    module: 'Workflow Engine',
    entityId: orderId,
    details: reason || 'Lifecycle transition'
  });

  return {
    data: {
      ...data,
      orders: data.orders.map((item) => item.id === orderId ? updatedOrder : item),
      results,
      notifications,
      resultReports,
      auditLogs
    }
  };
}

export function updateBillingStatus(data, { orderId, billingStatus, method = '', actor = 'System', role = 'billing' }) {
  if (!BILLING_STATUSES.includes(billingStatus)) return { data, error: 'Invalid billing status.' };
  const timestamp = nowIso();
  const order = data.orders.find((item) => item.id === orderId);
  if (!order) return { data, error: 'Order not found.' };
  const invoices = data.invoices.map((invoice) => invoice.orderId === orderId ? {
    ...invoice,
    status: billingStatus === 'Paid' ? 'Paid' : billingStatus === 'Insurance Pending' ? 'Insurance Pending' : invoice.status === 'Paid' ? 'Paid' : 'Pending',
    method: method || invoice.method,
    updatedAt: timestamp,
    transactions: billingStatus === 'Paid' ? [
      ...(invoice.transactions || []),
      { id: idWithPrefix('TXN-', invoice.transactions || []), amount: invoice.amount, method: method || 'Transfer', status: 'Paid', createdAt: timestamp }
    ] : (invoice.transactions || [])
  } : invoice);

  return {
    data: {
      ...data,
      orders: data.orders.map((item) => item.id === orderId ? { ...item, billingStatus, updatedAt: timestamp } : item),
      invoices,
      auditLogs: addAudit(data.auditLogs || [], {
        actor,
        role,
        action: `Billing status changed to ${billingStatus}`,
        module: 'Billing Workflow',
        entityId: orderId,
        details: method ? `Payment method: ${method}` : 'Status update'
      })
    }
  };
}

export function createOrder(data, payload, actor = 'System', role = 'doctor') {
  const createdAt = nowIso();
  const orderId = idWithPrefix('ORD-2026-', data.orders || []);
  const isWalkInRequest = payload.requestSource === 'Walk-in' || payload.walkInRequest === true;
  const order = {
    id: orderId,
    patientId: payload.patientId,
    doctorId: payload.doctorId,
    hospitalId: payload.hospitalId,
    itemIds: payload.itemIds,
    urgency: payload.urgency || 'Routine',
    clinicalNotes: payload.clinicalNotes || '',
    status: 'Submitted',
    billingStatus: 'Payment Pending',
    createdAt,
    updatedAt: createdAt,
    requestSource: payload.requestSource || (isWalkInRequest ? 'Walk-in' : 'Clinician'),
    walkInRequest: isWalkInRequest,
    visitId: payload.visitId || '',
    requestedByReception: isWalkInRequest ? actor : '',
    expectedCompletionAt: computeExpectedCompletion(createdAt, payload.itemIds, data.catalog, payload.urgency),
    routedDepartments: getOrderDepartments({ itemIds: payload.itemIds }, data.catalog),
    timeline: [{ status: 'Submitted', actor, role, timestamp: createdAt }]
  };

  const amount = payload.itemIds.reduce((sum, id) => sum + Number(data.catalog.find((item) => item.id === id)?.price || 0), 0);
  const invoice = {
    id: idWithPrefix('INV-', data.invoices || []),
    orderId,
    amount,
    tax: 0,
    discount: 0,
    status: 'Pending',
    method: '',
    insuranceReference: '',
    transactions: [],
    createdAt,
    updatedAt: createdAt
  };

  return {
    ...data,
    orders: [order, ...(data.orders || [])],
    invoices: [invoice, ...(data.invoices || [])],
    notifications: payload.skipIntakeNotification ? (data.notifications || []) : [{
      id: idWithPrefix('NOT-', data.notifications || []),
      title: isWalkInRequest ? 'Walk-in test request' : 'Incoming clinician order',
      body: isWalkInRequest ? `${orderId} was created directly by reception for a walk-in patient.` : `${orderId} is visible to the required workflow queue(s).`,
      audience: isWalkInRequest ? 'billing' : 'receptionist',
      channel: 'In-platform',
      status: 'Delivered',
      read: false,
      createdAt,
      entityId: orderId
    }, ...(data.notifications || [])],
    auditLogs: addAudit(data.auditLogs || [], {
      actor,
      role,
      action: isWalkInRequest ? 'Reception created walk-in test request' : 'Clinician submitted order',
      module: isWalkInRequest ? 'Reception Walk-ins' : 'Order Intake',
      entityId: orderId,
      details: `${payload.itemIds.length} item(s) requested`
    })
  };
}

export function addAudit(auditLogs, event) {
  return [{
    id: idWithPrefix('AUD-', auditLogs),
    actor: event.actor || 'System',
    role: event.role || 'system',
    action: event.action,
    module: event.module,
    entityId: event.entityId || '',
    timestamp: nowIso(),
    details: event.details || ''
  }, ...auditLogs];
}

export function getOrderViewModel(order, data) {
  const patient = data.patients.find((item) => item.id === order.patientId);
  const doctor = data.doctors.find((item) => item.id === order.doctorId);
  const hospital = data.hospitals.find((item) => item.id === order.hospitalId);
  const items = getCatalogItems(order, data.catalog);
  const invoice = data.invoices.find((item) => item.orderId === order.id);
  const results = (data.results || []).filter((item) => item.orderId === order.id);
  return { ...order, patient, doctor, hospital, items, invoice, results };
}
