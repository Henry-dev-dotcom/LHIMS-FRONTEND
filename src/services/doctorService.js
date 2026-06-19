import { buildQuery } from '../api/apiClient';

export const doctorService = {
  profile: async (client) => client.mode === 'mock' ? { pendingBackend: true, auth: client.auth } : client.request('/doctor/profile'),
  updateProfile: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/doctor/profile', { method: 'PATCH', body: payload }),
  patients: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.patients.list, params) : client.request(`/doctor/patients${buildQuery(params)}`),
  createOrder: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/doctor/orders', { method: 'POST', body: payload }),
  activeOrders: async (client, params = {}) => client.mode === 'mock' ? client.get(() => (client.mock.orders.list() || []).filter((order) => !['Final / Released','Cancelled'].includes(order.status))) : client.request(`/doctor/orders/active${buildQuery(params)}`),
  completedOrders: async (client, params = {}) => client.mode === 'mock' ? client.get(() => (client.mock.orders.list() || []).filter((order) => order.status === 'Final / Released')) : client.request(`/doctor/orders/completed${buildQuery(params)}`),
  results: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.results.list) : client.request(`/doctor/results${buildQuery(params)}`),
  patientTrends: async (client, patientId) => client.mode === 'mock' ? client.get(client.mock.patients.trends, patientId) : client.request(`/doctor/patient-trends/${patientId}`)
};
