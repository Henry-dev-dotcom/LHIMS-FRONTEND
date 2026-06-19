import { buildQuery } from '../api/apiClient';

function resourceService(path, mockResolver) {
  return {
    list: async (client, params = {}) => client.mode === 'mock' ? client.get(mockResolver || (() => [])) : client.request(`${path}${buildQuery(params)}`),
    create: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request(path, { method: 'POST', body: payload }),
    update: async (client, id, payload) => client.mode === 'mock' ? { pendingBackend: true, id, payload } : client.request(`${path}/${id}`, { method: 'PATCH', body: payload })
  };
}

export const adminService = {
  users: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.admin.users) : client.request(`/admin/users${buildQuery(params)}`),
  createUser: async (client, payload) => client.mode === 'mock' ? { pendingBackend: true, payload } : client.request('/admin/users', { method: 'POST', body: payload }),
  updateUser: async (client, userId, payload) => client.mode === 'mock' ? { pendingBackend: true, userId, payload } : client.request(`/admin/users/${userId}`, { method: 'PATCH', body: payload }),
  hospitals: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.admin.hospitals) : client.request(`/admin/hospitals${buildQuery(params)}`),
  doctors: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.admin.doctors) : client.request(`/admin/doctors${buildQuery(params)}`),
  catalog: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.catalog.list) : client.request(`/admin/catalog${buildQuery(params)}`),
  referenceRanges: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/admin/reference-ranges${buildQuery(params)}`),
  departments: resourceService('/admin/departments'),
  equipment: resourceService('/admin/equipment'),
  auditLogs: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.admin.auditLogs) : client.request(`/admin/audit-logs${buildQuery(params)}`),
  systemEvents: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/admin/system-events${buildQuery(params)}`),
  apiRequestLogs: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/admin/api-request-logs${buildQuery(params)}`),
  auditSummary: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/admin/audit-summary${buildQuery(params)}`),
  auditExport: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/admin/audit-export${buildQuery(params)}`),
  exportConfig: async (client) => client.mode === 'mock' ? { pendingBackend: true } : client.request('/admin/config-export'),
  fullExport: async (client) => client.mode === 'mock' ? { pendingBackend: true } : client.request('/admin/full-export')
};
