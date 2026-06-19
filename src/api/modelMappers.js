export function mapPatientToApi(patient = {}) {
  return {
    id: patient.id,
    fullName: patient.fullName,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    nationalId: patient.nationalId,
    referringHospitalId: patient.referringHospitalId,
    referringDoctorId: patient.referringDoctorId,
    insuranceProvider: patient.insuranceProvider,
    policyNumber: patient.policyNumber,
    emergencyContact: patient.emergencyContact,
    allergies: patient.allergies,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt
  };
}

export function mapOrderToApi(order = {}) {
  return {
    id: order.id,
    patientId: order.patientId,
    doctorId: order.doctorId,
    hospitalId: order.hospitalId,
    itemIds: order.itemIds || [],
    status: order.status,
    billingStatus: order.billingStatus,
    urgency: order.urgency,
    clinicalNotes: order.clinicalNotes,
    routedDepartments: order.routedDepartments || [],
    expectedCompletionAt: order.expectedCompletionAt,
    timeline: order.timeline || [],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

export function mapResultToApi(result = {}) {
  return {
    id: result.id,
    orderId: result.orderId,
    department: result.department,
    status: result.status,
    parameters: result.parameters || [],
    reportText: result.reportText,
    equipment: result.equipment,
    internalNotes: result.internalNotes,
    files: result.files || [],
    abnormal: Boolean(result.abnormal),
    approvedBy: result.approvedBy,
    approvedAt: result.approvedAt,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  };
}

export function mapInvoiceToApi(invoice = {}) {
  return {
    id: invoice.id,
    orderId: invoice.orderId,
    amount: Number(invoice.amount || 0),
    tax: Number(invoice.tax || 0),
    discount: Number(invoice.discount || 0),
    status: invoice.status,
    method: invoice.method,
    insuranceReference: invoice.insuranceReference,
    transactions: invoice.transactions || [],
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt
  };
}

export function mapCatalogItemToApi(item = {}) {
  return {
    id: item.id,
    name: item.name,
    abbreviation: item.abbreviation,
    department: item.department,
    modality: item.modality,
    price: Number(item.price || 0),
    expectedHours: Number(item.expectedHours || 0),
    sampleType: item.sampleType,
    aliases: item.aliases || [],
    parameters: item.parameters || []
  };
}

export function mapApiCollection(collection = [], mapper = (item) => item) {
  return Array.isArray(collection) ? collection.map(mapper) : [];
}
