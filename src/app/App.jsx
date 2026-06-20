import { AppStoreProvider, useAppStore } from '../store/AppStore';
import { LoginPage } from '../pages/auth/LoginPage';
import { AppShell } from '../layouts/AppShell';
import { ReportVerificationPage } from '../pages/public/ReportVerificationPage';
import { PatientPortalAccessPage } from '../pages/public/PatientPortalAccessPage';

function AppContent() {
  const { state } = useAppStore();
  const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
  if (hash.startsWith('#/verify-report/')) return <ReportVerificationPage />;
  if (hash.startsWith('#/patient/results/')) return <PatientPortalAccessPage />;
  if (!state.auth) return <LoginPage />;
  return <AppShell />;
}

export default function App() {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  );
}
