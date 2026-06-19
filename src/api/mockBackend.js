import { seedData } from '../data/seedData';
import { mapApiCollection, mapPatientToApi, mapOrderToApi, mapResultToApi, mapInvoiceToApi, mapCatalogItemToApi } from './modelMappers';

function searchItems(items, query, fields) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => fields.some((field) => String(item[field] || '').toLowerCase().includes(q)));
}

export function createMockBackend(data = seedData) {
  const source = data || seedData;
  return {
    auth: {
      me: (auth) => ({ auth })
    },
    patients: {
      list: ({ query = '' } = {}) => mapApiCollection(searchItems(source.patients || [], query, ['id','fullName','phone','email','nationalId','policyNumber']), mapPatientToApi),
      detail: (patientId) => mapPatientToApi((source.patients || []).find((patient) => patient.id === patientId)),
      trends: (patientId) => ({ patientId, results: (source.results || []).filter((result) => (source.orders || []).some((order) => order.id === result.orderId && order.patientId === patientId)).map(mapResultToApi) })
    },
    orders: {
      list: () => mapApiCollection(source.orders || [], mapOrderToApi),
      detail: (orderId) => mapOrderToApi((source.orders || []).find((order) => order.id === orderId))
    },
    catalog: {
      list: () => mapApiCollection(source.catalog || [], mapCatalogItemToApi),
      lab: () => mapApiCollection((source.catalog || []).filter((item) => item.department === 'Laboratory'), mapCatalogItemToApi),
      scan: () => mapApiCollection((source.catalog || []).filter((item) => item.department === 'Imaging'), mapCatalogItemToApi)
    },
    results: {
      list: () => mapApiCollection(source.results || [], mapResultToApi),
      deliveryLogs: () => source.notifications || []
    },
    billing: {
      invoices: () => mapApiCollection(source.invoices || [], mapInvoiceToApi),
      shifts: () => source.financeShifts || [],
      expenses: () => source.expenses || []
    },
    admin: {
      users: () => source.users || [],
      hospitals: () => source.hospitals || [],
      doctors: () => source.doctors || [],
      auditLogs: () => source.auditLogs || []
    }
  };
}
