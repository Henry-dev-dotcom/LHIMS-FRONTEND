import { useAppStore } from '../store/AppStore';
import { canAccessPage } from '../utils/permissions';
import { OverviewPage } from '../pages/dashboards/OverviewPage';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { AccessRestrictedPage } from '../pages/auth/AccessRestrictedPage';
import { OrderRegistryPage } from '../pages/core/OrderRegistryPage';
import { PatientRecordsPage } from '../pages/core/PatientRecordsPage';
import { DoctorPortalPage } from '../pages/doctor/DoctorPortalPage';
import { DoctorNewOrderPage } from '../pages/doctor/DoctorNewOrderPage';
import { DoctorResultsPage } from '../pages/doctor/DoctorResultsPage';
import { DoctorActiveOrdersPage } from '../pages/doctor/DoctorActiveOrdersPage';
import { DoctorCompletedOrdersPage } from '../pages/doctor/DoctorCompletedOrdersPage';
import { DoctorPatientTrendsPage } from '../pages/doctor/DoctorPatientTrendsPage';
import { AuditLogPage } from '../pages/admin/AuditLogPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { HospitalsPage } from '../pages/admin/HospitalsPage';
import { NotificationSettingsPage } from '../pages/admin/NotificationSettingsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { ResultsDeliveryPage } from '../pages/results/ResultsDeliveryPage';
import { SecurityReliabilityPage } from '../pages/security/SecurityReliabilityPage';
import { LabQueuePage } from '../pages/lab/LabQueuePage';
import { SampleLogPage } from '../pages/lab/SampleLogPage';
import { LabAcceptPage } from '../pages/lab/LabAcceptPage';
import { AcceptedSamplesPage } from '../pages/lab/AcceptedSamplesPage';
import { LabReviewPage } from '../pages/lab/LabReviewPage';
import { LabRejectedSamplesPage } from '../pages/lab/LabRejectedSamplesPage';
import { ScanQueuePage } from '../pages/scan/ScanQueuePage';
import { ScanAcceptPage } from '../pages/scan/ScanAcceptPage';
import { AcceptedScansPage } from '../pages/scan/AcceptedScansPage';
import { ScanReviewPage } from '../pages/scan/ScanReviewPage';
import { ScanRejectedPage } from '../pages/scan/ScanRejectedPage';
import { EquipmentBookingPage } from '../pages/scan/EquipmentBookingPage';
import { IncomingOrdersPage } from '../pages/reception/IncomingOrdersPage';
import { PatientCheckInPage } from '../pages/reception/PatientCheckInPage';
import { AppointmentsPage } from '../pages/reception/AppointmentsPage';
import { ReceptionDailyVisitsPage } from '../pages/reception/ReceptionDailyVisitsPage';
import { ReceptionResultsInboxPage } from '../pages/reception/ReceptionResultsInboxPage';
import { InvoicesPage } from '../pages/billing/InvoicesPage';
import { PriceCatalogPage } from '../pages/billing/PriceCatalogPage';
import { FinanceShiftPage } from '../pages/billing/FinanceShiftPage';
import { FloatTrackerPage } from '../pages/billing/FloatTrackerPage';
import { ExpensesPage } from '../pages/billing/ExpensesPage';
import { AccountLedgerPage } from '../pages/billing/AccountLedgerPage';
import { BillingAnalyticsPage } from '../pages/billing/BillingAnalyticsPage';
import { ApiReadinessPage } from '../pages/system/ApiReadinessPage';
import { PAGE_META } from './routeRegistry';

const roleDashboardMap = {
  'doctor-dashboard': 'doctor',
  'reception-dashboard': 'receptionist',
  'lab-dashboard': 'lab',
  'scan-dashboard': 'scan',
  'billing-dashboard': 'billing',
  'admin-dashboard': 'admin'
};

export function AppRouter() {
  const { state } = useAppStore();
  const pageId = state.currentPage || 'overview';
  const role = state.auth?.role || 'admin';

  if (!canAccessPage(role, pageId)) {
    return <AccessRestrictedPage pageId={pageId} />;
  }

  if (pageId === 'overview') return <OverviewPage />;
  if (pageId === 'orders') return <OrderRegistryPage />;
  if (pageId === 'patients') return <PatientRecordsPage />;
  if (pageId === 'doctor-dashboard') return <DoctorPortalPage />;
  if (pageId === 'doctor-new-order') return <DoctorNewOrderPage />;
  if (pageId === 'doctor-active-orders') return <DoctorActiveOrdersPage />;
  if (pageId === 'doctor-completed-orders') return <DoctorCompletedOrdersPage />;
  if (pageId === 'doctor-results') return <DoctorResultsPage />;
  if (pageId === 'doctor-patient-trends') return <DoctorPatientTrendsPage />;
  if (pageId === 'audit-log') return <AuditLogPage />;
  if (pageId === 'users') return <UserManagementPage />;
  if (pageId === 'hospitals') return <HospitalsPage />;
  if (pageId === 'notification-settings') return <NotificationSettingsPage />;
  if (pageId === 'settings') return <AdminSettingsPage />;
  if (pageId === 'reports') return <ReportsPage />;
  if (pageId === 'result-delivery') return <ResultsDeliveryPage />;
  if (pageId === 'security') return <SecurityReliabilityPage />;
  if (pageId === 'lab-queue') return <LabQueuePage />;
  if (pageId === 'sample-log') return <SampleLogPage />;
  if (pageId === 'lab-accept') return <LabAcceptPage />;
  if (pageId === 'accepted-samples') return <AcceptedSamplesPage />;
  if (pageId === 'lab-review') return <LabReviewPage />;
  if (pageId === 'lab-rejections') return <LabRejectedSamplesPage />;
  if (pageId === 'scan-queue') return <ScanQueuePage />;
  if (pageId === 'scan-accept') return <ScanAcceptPage />;
  if (pageId === 'accepted-scans') return <AcceptedScansPage />;
  if (pageId === 'scan-review') return <ScanReviewPage />;
  if (pageId === 'scan-rejections') return <ScanRejectedPage />;
  if (pageId === 'equipment-booking') return <EquipmentBookingPage />;
  if (pageId === 'incoming-orders') return <IncomingOrdersPage />;
  if (pageId === 'patient-checkin') return <PatientCheckInPage />;
  if (pageId === 'appointments') return <AppointmentsPage />;
  if (pageId === 'daily-visits') return <ReceptionDailyVisitsPage />;
  if (pageId === 'reception-results') return <ReceptionResultsInboxPage />;
  if (pageId === 'invoices') return <InvoicesPage />;
  if (pageId === 'finance-shift') return <FinanceShiftPage />;
  if (pageId === 'float-tracker') return <FloatTrackerPage />;
  if (pageId === 'expenses') return <ExpensesPage />;
  if (pageId === 'account-ledger') return <AccountLedgerPage />;
  if (pageId === 'billing-analytics') return <BillingAnalyticsPage />;
  if (pageId === 'price-catalog') return <PriceCatalogPage />;
  if (pageId === 'api-readiness') return <ApiReadinessPage />;
  if (roleDashboardMap[pageId]) return <RoleDashboard role={roleDashboardMap[pageId]} />;

  const meta = PAGE_META[pageId] || {
    title: 'Module Placeholder',
    section: 'Foundation',
    description: 'This module route exists as part of the Section 1 foundation.',
    requirements: []
  };

  return <PlaceholderPage {...meta} />;
}
