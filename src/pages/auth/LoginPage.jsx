import { useMemo, useState } from 'react';
import { Activity, ArrowRight, CheckCircle2, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { ROLES } from '../../data/roles';
import { useAppStore } from '../../store/AppStore';
import { Button } from '../../components/ui/Button';
import { ToastHost } from '../../components/ui/ToastHost';

export function LoginPage() {
  const { dispatch } = useAppStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const selectedRole = useMemo(() => ROLES.find((role) => role.demoUsername === username), [username]);

  function submitCredentials(event) {
    event.preventDefault();
    dispatch({ type: 'LOGIN_WITH_CREDENTIALS', username, password });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff1ff,transparent_32%),radial-gradient(circle_at_bottom_right,#d8fff0,transparent_28%),linear-gradient(135deg,#081a33,#102a52_45%,#0f766e)] p-3 sm:p-5">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-7xl items-center justify-center sm:min-h-[calc(100vh-40px)]">
        <div className="grid w-full overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/95 shadow-panel backdrop-blur-xl sm:rounded-[2rem] xl:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-slate-950 p-5 text-white sm:p-8 lg:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-clinical-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 flex items-center gap-3 sm:mb-10">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-clinical-500 to-emerald-500">
                  <Activity className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-xl font-black sm:text-2xl">Diagnosis Center</h1>
                  <p className="text-sm text-white/50">Order & Results Management Platform</p>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Clinical Workspace</p>
              <h2 className="mt-3 max-w-md text-2xl font-black leading-tight tracking-tight sm:text-4xl">Polished role-based platform workspace.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/65 sm:mt-5">
                Choose one of the six system roles or use the quick credentials. Each login opens a dedicated landing page with refined navigation and permission-aware workflow pages.
              </p>
              <div className="mt-8 hidden gap-3 text-sm sm:grid sm:grid-cols-2">
                {['Clinician', 'Receptionist', 'Lab Staff', 'Scan / Imaging', 'Billing / Finance', 'Admin'].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/75">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8 lg:p-12">
            <div className="grid gap-6 sm:gap-8 xl:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-clinical-600">Test credentials</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Sign in</h2>
                <p className="mt-2 text-sm text-slate-500">Use the quick cards or enter credentials to open the correct role workspace.</p>
                <form onSubmit={submitCredentials} className="mt-5 space-y-4 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 sm:mt-6 sm:rounded-3xl sm:p-5">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500"><UserRound className="h-3.5 w-3.5" /> Username</span>
                    <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none ring-clinical-100 transition focus:border-clinical-300 focus:ring-4" />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500"><KeyRound className="h-3.5 w-3.5" /> Password</span>
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none ring-clinical-100 transition focus:border-clinical-300 focus:ring-4" />
                  </label>
                  {selectedRole && (
                    <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-600">
                      <span className="font-black text-slate-900">Selected:</span> {selectedRole.label} — {selectedRole.demoUser}
                    </div>
                  )}
                  <Button className="w-full" type="submit"><ShieldCheck className="h-4 w-4" /> Sign in</Button>
                </form>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-clinical-600">Quick role login</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => dispatch({ type: 'LOGIN_AS', roleId: role.id })}
                      className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left shadow-soft transition hover:-translate-y-1 hover:border-clinical-200 hover:bg-clinical-50 hover:shadow-lift sm:rounded-3xl sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950">{role.label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{role.subtitle}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-clinical-600" />
                      </div>
                      <div className="mt-4 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                        {role.demoUsername} / {role.demoPassword}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastHost />
    </div>
  );
}
