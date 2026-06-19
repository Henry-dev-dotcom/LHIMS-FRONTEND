import { getOrderViewModel } from '../../workflow/workflowEngine';

export function getDoctorContextFromState(state) {
  const data = state.data;
  const doctor = data.doctors.find((item) => item.id === state.auth?.linkedDoctorId) || data.doctors[0];
  const hospital = data.hospitals.find((item) => item.id === doctor?.hospitalId) || data.hospitals.find((item) => item.id === state.auth?.hospitalId);
  const orders = (data.orders || [])
    .filter((order) => order.doctorId === doctor?.id)
    .map((order) => getOrderViewModel(order, data))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const activeOrders = orders.filter((order) => !['Final / Released', 'Cancelled'].includes(order.status));
  const completedOrders = orders.filter((order) => order.status === 'Final / Released');
  const patientIds = new Set(orders.map((order) => order.patientId));
  const doctorPatients = (data.patients || []).filter((patient) => patient.referringDoctorId === doctor?.id || patientIds.has(patient.id));
  return { data, doctor, hospital, orders, activeOrders, completedOrders, doctorPatients };
}

export function orderItemsText(order) {
  return order?.items?.map((item) => item.name).join(', ') || '—';
}

export function getReportForOrder(data, orderId) {
  return (data.resultReports || []).find((report) => report.orderId === orderId && report.status !== 'Voided');
}
