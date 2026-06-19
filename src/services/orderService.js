import { buildQuery } from '../api/apiClient';

export const orderService = {
  list: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.orders.list) : client.request(`/orders${buildQuery(params)}`),
  detail: async (client, orderId) => client.mode === 'mock' ? client.get(client.mock.orders.detail, orderId) : client.request(`/orders/${orderId}`),
  updateStatus: async (client, orderId, payload) => client.mode === 'mock' ? { pendingBackend: true, orderId, payload } : client.request(`/orders/${orderId}/status`, { method: 'PATCH', body: payload }),
  transition: async (client, orderId, payload) => client.mode === 'mock' ? { pendingBackend: true, orderId, payload } : client.request(`/orders/${orderId}/transition`, { method: 'POST', body: payload }),
  cancel: async (client, orderId, payload) => client.mode === 'mock' ? { pendingBackend: true, orderId, payload } : client.request(`/orders/${orderId}/cancel`, { method: 'POST', body: payload }),
  timeline: async (client, orderId) => client.mode === 'mock' ? client.get(client.mock.orders.detail, orderId) : client.request(`/orders/${orderId}/timeline`)
};
