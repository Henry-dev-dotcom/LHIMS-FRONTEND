import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastHost } from '../components/ui/ToastHost';
import { MobileBottomNav } from '../components/ui/MobileBottomNav';
import { AppRouter } from '../routes/AppRouter';

export function AppShell() {
  return (
    <div className="min-h-screen bg-app-radial text-slate-900 print:bg-white">
      <div className="min-h-screen lg:flex">
        <Sidebar />
        <div className="min-w-0 flex-1 lg:ml-[19rem]">
          <Header />
          <main id="main-content" className="px-3 pb-28 pt-4 sm:px-5 lg:px-8 lg:py-7 print:px-0 print:py-0">
            <div className="mx-auto max-w-[1540px] print:max-w-none">
              <AppRouter />
            </div>
          </main>
        </div>
        <MobileBottomNav />
        <ToastHost />
      </div>
    </div>
  );
}
