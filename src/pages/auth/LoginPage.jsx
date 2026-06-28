import { useMemo, useState } from 'react';
import { Activity, ArrowRight, CheckCircle2, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { ROLES } from '../../data/roles';
import { useAppStore } from '../../store/AppStore';
import { Button } from '../../components/ui/Button';
import { ToastHost } from '../../components/ui/ToastHost';
import '../../styles/getlabs-theme.css';

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
    <div className="getlabs-login min-h-screen bg-[#f8f1e8] p-4 text-[#2f2f2d] sm:p-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-4 py-3 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-sm bg-[#2f2f2d] text-white">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#2f2f2d]">Diagnosis Center</h1>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#756f67]">Orders · Billing · Results</p>
            </div>
          </div>
          <button type="button" className="getlabs-outline-button hidden sm:inline-flex" onClick={() => setUsername('admin')}>Demo access</button>
        </header>

        <main className="grid flex-1 overflow-hidden rounded-[2rem] border border-[#e3d8c9] bg-[#fffaf3] shadow-[0_30px_80px_rgba(47,47,45,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative min-h-[22rem] overflow-hidden bg-[#eadbc7] p-7 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.75),transparent_26%),linear-gradient(135deg,rgba(255,250,243,0.1),rgba(47,47,45,0.18))]" />
            <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[#d8c5a9]/80 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#2f2f2d]/70">Clinical workspace</p>
                <h2 className="getlabs-serif mt-5 max-w-xl text-4xl leading-[1.03] tracking-[-0.04em] text-[#2f2f2d] sm:text-5xl lg:text-6xl">
                  Manage lab requests with a calmer, cleaner workflow.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-8 text-[#5f5a53]">
                  A warm, simple interface for clinicians, reception, laboratory, scan, billing, and administration teams.
                </p>
              </div>

              <div className="mt-10 grid gap-3 text-sm sm:grid-cols-2">
                {['Queue requests', 'Accept samples', 'Enter results', 'Send to clinician'].map((item) => (
                  <div key={item} className="flex items-center gap-2 border border-[#2f2f2d]/15 bg-[#fffaf3]/70 px-4 py-3 text-[#3c3935] backdrop-blur">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-5 sm:p-8 lg:p-12">
            <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#756f67]">Secure sign in</p>
                <h2 className="getlabs-serif mt-2 text-4xl leading-tight tracking-[-0.04em] text-[#2f2f2d]">Open your workspace.</h2>
                <p className="mt-3 text-sm leading-6 text-[#756f67]">Use the demo credentials or select a role to continue into the platform.</p>

                <form onSubmit={submitCredentials} className="mt-6 space-y-4 border border-[#e3d8c9] bg-[#f8f1e8] p-4 sm:p-5">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#756f67]"><UserRound className="h-3.5 w-3.5" /> Username</span>
                    <input value={username} onChange={(event) => setUsername(event.target.value)} className="getlabs-input" />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#756f67]"><KeyRound className="h-3.5 w-3.5" /> Password</span>
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="getlabs-input" />
                  </label>
                  {selectedRole && (
                    <div className="border border-[#e3d8c9] bg-[#fffaf3] px-4 py-3 text-xs text-[#756f67]">
                      <span className="font-black text-[#2f2f2d]">Selected:</span> {selectedRole.label} — {selectedRole.demoUser}
                    </div>
                  )}
                  <Button className="getlabs-primary-button w-full justify-center" type="submit"><ShieldCheck className="h-4 w-4" /> Sign in</Button>
                </form>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#756f67]">Quick role login</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => dispatch({ type: 'LOGIN_AS', roleId: role.id })}
                      className="group border border-[#e3d8c9] bg-[#fffaf3] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2f2f2d] hover:shadow-[0_18px_40px_rgba(47,47,45,0.12)] sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-[#2f2f2d]">{role.label}</p>
                          <p className="mt-1 text-xs leading-5 text-[#756f67]">{role.subtitle}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-[#756f67] transition group-hover:translate-x-1 group-hover:text-[#2f2f2d]" />
                      </div>
                      <div className="mt-4 border border-[#e3d8c9] bg-[#f8f1e8] px-3 py-2 text-xs font-bold text-[#5f5a53]">
                        {role.demoUsername} / {role.demoPassword}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <ToastHost />
    </div>
  );
}
