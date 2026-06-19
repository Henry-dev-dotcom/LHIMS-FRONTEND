import { buildQuery } from '../api/apiClient';

export const fileService = {
  list: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/files${buildQuery(params)}`),
  upload: async (client, files = [], metadata = {}) => client.mode === 'mock' ? {
    pendingBackend: true,
    metadata,
    files: Array.from(files).map((file) => ({ name: file.name, size: file.size, type: file.type, isDicom: /\.(dcm|dicom)$/i.test(file.name) }))
  } : client.request('/files/upload', { method: 'POST', body: { files, metadata } }),
  detail: async (client, fileId) => client.mode === 'mock' ? { pendingBackend: true, fileId } : client.request(`/files/${fileId}`),
  download: async (client, fileId) => client.mode === 'mock' ? { pendingBackend: true, fileId } : client.request(`/files/${fileId}/download`),
  delete: async (client, fileId) => client.mode === 'mock' ? { pendingBackend: true, fileId } : client.request(`/files/${fileId}`, { method: 'DELETE' }),
  attachToScanResult: async (client, resultId, files) => client.mode === 'mock' ? { pendingBackend: true, resultId, files: files?.length || 0 } : client.request(`/scan/results/${resultId}/files`, { method: 'POST', body: { files } }),
  attachToLabResult: async (client, resultId, files) => client.mode === 'mock' ? { pendingBackend: true, resultId, files: files?.length || 0 } : client.request(`/lab/results/${resultId}/files`, { method: 'POST', body: { files } }),
  dicomStudies: async (client, params = {}) => client.mode === 'mock' ? { pendingBackend: true, params } : client.request(`/files/dicom/studies${buildQuery(params)}`),
  dicomStudy: async (client, studyUid) => client.mode === 'mock' ? { pendingBackend: true, studyUid } : client.request(`/files/dicom/studies/${studyUid}`)
};
