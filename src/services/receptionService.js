import { buildQuery } from '../api/apiClient';

export const receptionService = {
  incomingOrders: async (client, params = {}) => client.mode === 'mock' ? client.get(() => (client.mock.orders.list() || []).filter((order) => order.status === 'Submitted')) : client.request(`/reception/incoming-orders${buildQuery(params)}`),
  confirmOrder: async (client, orderId, payload = {}) => client.mode === 'mock' ? { pendingBackend: true, orderId, payload } : client.request(`/reception/orders/${orderId}/confirm`, { method: 'POST', body: payload }),
  checkIn: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/reception/check-in', { method: 'POST', body: payload }),
  walkIn: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/reception/walk-ins', { method: 'POST', body: payload }),
  appointments: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/reception/appointments${buildQuery(params)}`),
  createAppointment: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/reception/appointments', { method: 'POST', body: payload }),
  updateAppointment: async (client, appointmentId, payload) => client.mode === 'mock' ? { pendingBackend: true, appointmentId, payload } : client.request(`/reception/appointments/${appointmentId}`, { method: 'PATCH', body: payload }),
  dailyVisits: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/reception/daily-visits${buildQuery(params)}`),
  resultsInbox: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.results.list) : client.request(`/reception/results-inbox${buildQuery(params)}`),
  sendSafeNotice: async (client, resultId, payload) => client.mode === 'mock' ? { pendingBackend: true, resultId, payload } : client.request(`/reception/results/${resultId}/send-notice`, { method: 'POST', body: payload })
};
