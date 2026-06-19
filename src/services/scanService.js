import { buildQuery } from '../api/apiClient';

export const scanService = {
  queue: async (client, params = {}) => client.mode === 'mock' ? client.get(() => (client.mock.orders.list() || []).filter((order) => order.routedDepartments?.includes('Imaging'))) : client.request(`/scan/queue${buildQuery(params)}`),
  acceptedScans: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, source: 'state.scanBookings' } : client.request(`/scan/accepted-scans${buildQuery(params)}`),
  acceptScan: async (client, orderId, payload) => client.mode === 'mock' ? { pendingBackend: true, orderId, payload } : client.request(`/scan/orders/${orderId}/accept`, { method: 'POST', body: payload }),
  bookings: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/scan/bookings${buildQuery(params)}`),
  createBooking: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/scan/bookings', { method: 'POST', body: payload }),
  saveDraft: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/scan/results/draft', { method: 'POST', body: payload }),
  saveReport: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/scan/results', { method: 'POST', body: payload }),
  submitReview: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/scan/results/submit-review', { method: 'POST', body: payload }),
  signOff: async (client, resultId, payload = {}) => client.mode === 'mock' ? { pendingBackend: true, resultId, payload } : client.request(`/scan/results/${resultId}/sign-off`, { method: 'POST', body: payload }),
  uploadFiles: async (client, resultId, files) => client.mode === 'mock' ? { pendingBackend: true, resultId, files: files?.length || 0 } : client.request(`/scan/results/${resultId}/files`, { method: 'POST', body: { files } }),
  retake: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/scan/retake', { method: 'POST', body: payload }),
  reviewQueue: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/scan/review-queue${buildQuery(params)}`),
  rejectedRetake: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/scan/rejected-retake${buildQuery(params)}`),
  prior: async (client, patientId) => client.mode === 'mock' ? { pendingBackend: true, patientId } : client.request(`/scan/prior/${patientId}`)
};
