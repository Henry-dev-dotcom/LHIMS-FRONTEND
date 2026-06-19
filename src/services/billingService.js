import { buildQuery } from '../api/apiClient';

export const billingService = {
  invoices: async (client, params = {}) => client.mode === 'mock' ? client.get(client.mock.billing.invoices) : client.request(`/billing/invoices${buildQuery(params)}`),
  invoiceDetail: async (client, invoiceId) => client.mode === 'mock' ? { pendingBackend: true, invoiceId } : client.request(`/billing/invoices/${invoiceId}`),
  updateInvoice: async (client, invoiceId, payload) => client.mode === 'mock' ? { pendingBackend: true, invoiceId, payload } : client.request(`/billing/invoices/${invoiceId}`, { method: 'PATCH', body: payload }),
  recordPayment: async (client, invoiceId, payload) => client.mode === 'mock' ? { pendingBackend: true, invoiceId, payload } : client.request(`/billing/invoices/${invoiceId}/payments`, { method: 'POST', body: payload }),
  refund: async (client, invoiceId, payload) => client.mode === 'mock' ? { pendingBackend: true, invoiceId, payload } : client.request(`/billing/invoices/${invoiceId}/refund`, { method: 'POST', body: payload }),
  receipt: async (client, receiptId) => client.mode === 'mock' ? { pendingBackend: true, receiptId } : client.request(`/billing/receipts/${receiptId}`)
};
