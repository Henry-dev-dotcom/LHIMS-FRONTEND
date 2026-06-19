import { buildQuery } from '../api/apiClient';

export const notificationService = {
  list: async (client, params = {}) => client.mode === 'mock' ? client.get(() => client.mock.results.deliveryLogs()) : client.request(`/notifications${buildQuery(params)}`),
  create: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/notifications', { method: 'POST', body: payload }),
  markRead: async (client, notificationId) => client.mode === 'mock' ? { pendingBackend: true, notificationId } : client.request(`/notifications/${notificationId}/read`, { method: 'PATCH' }),
  markUnread: async (client, notificationId) => client.mode === 'mock' ? { pendingBackend: true, notificationId } : client.request(`/notifications/${notificationId}/unread`, { method: 'PATCH' }),
  markAllRead: async (client) => client.mode === 'mock' ? { pendingBackend: true } : client.request('/notifications/read-all', { method: 'PATCH' }),
  deliver: async (client, notificationId, payload) => client.mode === 'mock' ? { pendingBackend: true, notificationId, payload } : client.request(`/notifications/${notificationId}/deliver`, { method: 'POST', body: payload }),
  logs: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/notifications/logs${buildQuery(params)}`),
  retry: async (client, logId, payload = {}) => client.mode === 'mock' ? { pendingBackend: true, logId, payload } : client.request(`/notifications/logs/${logId}/retry`, { method: 'POST', body: payload }),
  preferences: async (client) => client.mode === 'mock' ? { pendingBackend: true } : client.request('/notifications/preferences'),
  updatePreferences: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/notifications/preferences', { method: 'PATCH', body: payload }),
  updateSettings: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/notifications/settings', { method: 'PATCH', body: payload })
};
