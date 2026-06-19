import { buildQuery } from '../api/apiClient';

export const labService = {
  queue: async (client, params = {}) => client.mode === 'mock' ? client.get(() => (client.mock.orders.list() || []).filter((order) => order.routedDepartments?.includes('Laboratory'))) : client.request(`/lab/queue${buildQuery(params)}`),
  acceptedSamples: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, source: 'state.sampleLogs' } : client.request(`/lab/accepted-samples${buildQuery(params)}`),
  acceptSample: async (client, orderId, payload) => client.mode === 'mock' ? { pendingBackend: true, orderId, payload } : client.request(`/lab/orders/${orderId}/accept`, { method: 'POST', body: payload }),
  saveDraft: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/lab/results/draft', { method: 'POST', body: payload }),
  saveResult: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/lab/results', { method: 'POST', body: payload }),
  submitReview: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/lab/results/submit-review', { method: 'POST', body: payload }),
  signOff: async (client, resultId, payload = {}) => client.mode === 'mock' ? { pendingBackend: true, resultId, payload } : client.request(`/lab/results/${resultId}/sign-off`, { method: 'POST', body: payload }),
  attachFiles: async (client, resultId, files) => client.mode === 'mock' ? { pendingBackend: true, resultId, files: files?.length || 0 } : client.request(`/lab/results/${resultId}/files`, { method: 'POST', body: { files } }),
  rejectSample: async (client, sampleId, payload) => client.mode === 'mock' ? { pendingBackend: true, sampleId, payload } : client.request(`/lab/samples/${sampleId}/reject`, { method: 'POST', body: payload }),
  reviewQueue: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/lab/review-queue${buildQuery(params)}`),
  rejectedRetest: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/lab/rejected-retest${buildQuery(params)}`),
  referenceRanges: async (client, catalogItemId) => client.mode === 'mock' ? client.get(() => (client.mock.catalog.lab() || []).find((item) => item.id === catalogItemId)?.parameters || []) : client.request(`/lab/reference-ranges/${catalogItemId}`),
  patientTrends: async (client, patientId) => client.mode === 'mock' ? client.get(client.mock.patients.trends, patientId) : client.request(`/lab/patient-trends/${patientId}`),
  qc: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/lab/qc${buildQuery(params)}`),
  createQc: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/lab/qc', { method: 'POST', body: payload }),
  inventory: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/lab/inventory${buildQuery(params)}`),
  createInventoryItem: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/lab/inventory', { method: 'POST', body: payload }),
  inventoryTransaction: async (client, itemId, payload) => client.mode === 'mock' ? { pendingBackend: true, itemId, payload } : client.request(`/lab/inventory/${itemId}/transactions`, { method: 'POST', body: payload })
};
