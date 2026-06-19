export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return '—';
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return '—';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthOffset = today.getMonth() - dob.getMonth();
  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function patientMatchesSearch(patient, search) {
  const term = String(search || '').toLowerCase();
  if (!term) return true;
  return [patient.id, patient.fullName, patient.phone, patient.email, patient.nationalId, patient.policyNumber]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(term));
}

export function findDuplicatePatients(patients, draft, currentPatientId = '') {
  const name = String(draft.fullName || '').trim().toLowerCase();
  const dob = draft.dateOfBirth || '';
  const phone = String(draft.phone || '').replace(/\D/g, '');
  const nationalId = String(draft.nationalId || '').trim().toLowerCase();
  if (!name && !phone && !nationalId) return [];
  return (patients || []).filter((patient) => {
    if (patient.id === currentPatientId) return false;
    const patientPhone = String(patient.phone || '').replace(/\D/g, '');
    const patientNationalId = String(patient.nationalId || '').trim().toLowerCase();
    const sameIdentity = nationalId && patientNationalId && nationalId === patientNationalId;
    const samePhone = phone && patientPhone && phone === patientPhone;
    const sameNameDob = name && dob && String(patient.fullName || '').trim().toLowerCase() === name && patient.dateOfBirth === dob;
    return sameIdentity || samePhone || sameNameDob;
  });
}

export function buildPatientOrderHistory(patientId, orders, data) {
  return (orders || [])
    .filter((order) => order.patientId === patientId)
    .map((order) => ({
      ...order,
      doctor: data.doctors.find((doctor) => doctor.id === order.doctorId),
      hospital: data.hospitals.find((hospital) => hospital.id === order.hospitalId),
      items: (order.itemIds || []).map((itemId) => data.catalog.find((item) => item.id === itemId)).filter(Boolean),
      invoice: data.invoices.find((invoice) => invoice.orderId === order.id),
      results: (data.results || []).filter((result) => result.orderId === order.id)
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
