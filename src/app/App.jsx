import { AppStoreProvider, useAppStore } from '../store/AppStore';
import { LoginPage } from '../pages/auth/LoginPage';
import { AppShell } from '../layouts/AppShell';

function AppContent() {
  const { state } = useAppStore();
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
