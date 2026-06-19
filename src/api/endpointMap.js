export const endpointMap = {
  system: {
    health: 'GET /health',
    version: 'GET /version',
    databaseStatus: 'GET /database/status',
    routeContracts: 'GET /access/route-contracts'
  },
  auth: {
    login: 'POST /auth/login',
    logout: 'POST /auth/logout',
    me: 'GET /auth/me',
    refresh: 'POST /auth/refresh',
    changePassword: 'PATCH /auth/change-password'
  },
  patients: {
    list: 'GET /patients',
    create: 'POST /patients',
    detail: 'GET /patients/:id',
    update: 'PATCH /patients/:id',
    orders: 'GET /patients/:id/orders',
    trends: 'GET /patients/:id/trends',
    duplicates: 'POST /patients/check-duplicates'
  },
  doctor: {
    profile: 'GET /doctor/profile',
    updateProfile: 'PATCH /doctor/profile',
    patients: 'GET /doctor/patients',
    createOrder: 'POST /doctor/orders',
    activeOrders: 'GET /doctor/orders/active',
    completedOrders: 'GET /doctor/orders/completed',
    results: 'GET /doctor/results',
    trends: 'GET /doctor/patient-trends/:patientId'
  },
  orders: {
    list: 'GET /orders',
    detail: 'GET /orders/:id',
    updateStatus: 'PATCH /orders/:id/status',
    transition: 'POST /orders/:id/transition',
    cancel: 'POST /orders/:id/cancel',
    timeline: 'GET /orders/:id/timeline'
  },
  reception: {
    incomingOrders: 'GET /reception/incoming-orders',
    confirmOrder: 'POST /reception/orders/:id/confirm',
    checkIn: 'POST /reception/check-in',
    walkIns: 'POST /reception/walk-ins',
    appointments: 'GET|POST /reception/appointments',
    updateAppointment: 'PATCH /reception/appointments/:id',
    dailyVisits: 'GET /reception/daily-visits',
    resultsInbox: 'GET /reception/results-inbox',
    sendSafeNotice: 'POST /reception/results/:id/send-notice'
  },
  lab: {
    queue: 'GET /lab/queue',
    acceptSample: 'POST /lab/orders/:orderId/accept',
    acceptSampleCanonical: 'POST /lab/samples/accept',
    acceptedSamples: 'GET /lab/accepted-samples',
    saveResult: 'POST /lab/results',
    draftResult: 'POST /lab/results/draft',
    submitReview: 'POST /lab/results/submit-review',
    signOff: 'POST /lab/results/:id/sign-off',
    attachFiles: 'POST /lab/results/:id/files',
    rejectSample: 'POST /lab/samples/:id/reject',
    reviewQueue: 'GET /lab/review-queue',
    rejectedRetest: 'GET /lab/rejected-retest',
    referenceRanges: 'GET /lab/reference-ranges/:catalogItemId',
    patientTrends: 'GET /lab/patient-trends/:patientId',
    qc: 'GET|POST /lab/qc',
    inventory: 'GET|POST /lab/inventory',
    inventoryTransaction: 'POST /lab/inventory/:id/transactions'
  },
  scan: {
    queue: 'GET /scan/queue',
    acceptScan: 'POST /scan/orders/:orderId/accept',
    acceptScanCanonical: 'POST /scan/accept',
    acceptedScans: 'GET /scan/accepted-scans',
    booking: 'GET|POST /scan/bookings',
    saveReport: 'POST /scan/results',
    draftReport: 'POST /scan/results/draft',
    submitReview: 'POST /scan/results/submit-review',
    uploadFiles: 'POST /scan/results/:id/files',
    signOff: 'POST /scan/results/:id/sign-off',
    retake: 'POST /scan/retake',
    reviewQueue: 'GET /scan/review-queue',
    rejectedRetake: 'GET /scan/rejected-retake',
    prior: 'GET /scan/prior/:patientId'
  },
  billing: {
    invoices: 'GET /billing/invoices',
    invoiceDetail: 'GET /billing/invoices/:id',
    updateInvoice: 'PATCH /billing/invoices/:id',
    payment: 'POST /billing/invoices/:id/payments',
    refund: 'POST /billing/invoices/:id/refund',
    receipt: 'GET /billing/receipts/:id'
  },
  finance: {
    shifts: 'GET|POST /finance/shifts',
    startShift: 'POST /finance/shifts/start',
    closeShift: 'POST /finance/shifts/:id/close',
    currentShift: 'GET /finance/shifts/current',
    shiftHistory: 'GET /finance/shifts/history',
    float: 'GET /finance/float',
    floatAdjustments: 'POST /finance/float/adjustments',
    expenses: 'GET|POST /finance/expenses',
    updateExpense: 'PATCH /finance/expenses/:id',
    payExpense: 'POST /finance/expenses/:id/payment',
    writeOffExpense: 'POST /finance/expenses/:id/write-off',
    ledger: 'GET /finance/ledger',
    analytics: 'GET /finance/analytics',
    ageing: 'GET /finance/ageing'
  },
  admin: {
    users: 'GET|POST /admin/users',
    updateUser: 'PATCH /admin/users/:id',
    hospitals: 'GET|POST /admin/hospitals',
    updateHospital: 'PATCH /admin/hospitals/:id',
    doctors: 'GET|POST /admin/doctors',
    updateDoctor: 'PATCH /admin/doctors/:id',
    catalog: 'GET|POST /admin/catalog',
    updateCatalog: 'PATCH /admin/catalog/:id',
    referenceRanges: 'GET|POST /admin/reference-ranges',
    updateReferenceRange: 'PATCH /admin/reference-ranges/:id',
    departments: 'GET|POST /admin/departments',
    updateDepartment: 'PATCH /admin/departments/:id',
    equipment: 'GET|POST /admin/equipment',
    updateEquipment: 'PATCH /admin/equipment/:id',
    auditLogs: 'GET /admin/audit-logs',
    systemEvents: 'GET /admin/system-events',
    apiRequestLogs: 'GET /admin/api-request-logs',
    auditSummary: 'GET /admin/audit-summary',
    auditExport: 'GET /admin/audit-export',
    configExport: 'GET /admin/config-export',
    fullExport: 'GET /admin/full-export'
  },
  results: {
    list: 'GET /results',
    detail: 'GET /results/:id',
    release: 'POST /results/:id/release',
    report: 'GET /results/:id/report',
    email: 'POST /results/:id/email',
    sms: 'POST /results/:id/sms',
    whatsapp: 'POST /results/:id/whatsapp',
    deliveryLogs: 'GET /results/delivery-logs',
    retryDelivery: 'POST /results/delivery/logs/:id/retry'
  },
  reports: {
    overview: 'GET /reports',
    dashboard: 'GET /reports/dashboard',
    financeAnalytics: 'GET /reports/analytics/finance',
    labAnalytics: 'GET /reports/analytics/lab',
    scanAnalytics: 'GET /reports/analytics/scan',
    receptionAnalytics: 'GET /reports/analytics/reception',
    auditAnalytics: 'GET /reports/analytics/audit',
    tat: 'GET /reports/tat',
    volume: 'GET /reports/order-volume',
    revenue: 'GET /reports/revenue',
    outstanding: 'GET /reports/outstanding',
    abnormal: 'GET /reports/abnormal-results',
    productivity: 'GET /reports/staff-productivity',
    resultsDelivery: 'GET /reports/results-delivery',
    export: 'GET /reports/export'
  },
  notifications: {
    list: 'GET /notifications',
    create: 'POST /notifications',
    markAllRead: 'PATCH /notifications/read-all',
    markRead: 'PATCH /notifications/:id/read',
    markUnread: 'PATCH /notifications/:id/unread',
    deliver: 'POST /notifications/:id/deliver',
    logs: 'GET /notifications/logs',
    retry: 'POST /notifications/logs/:id/retry',
    preferences: 'GET|PATCH /notifications/preferences',
    settings: 'PATCH /notifications/settings'
  },
  files: {
    list: 'GET /files',
    upload: 'POST /files/upload',
    detail: 'GET /files/:id',
    download: 'GET /files/:id/download',
    delete: 'DELETE /files/:id',
    dicomStudies: 'GET /files/dicom/studies',
    dicomStudy: 'GET /files/dicom/studies/:studyUid'
  }
};

export function flattenEndpointMap() {
  return Object.entries(endpointMap).flatMap(([module, endpoints]) =>
    Object.entries(endpoints).map(([name, signature]) => ({ module, name, signature }))
  );
}
