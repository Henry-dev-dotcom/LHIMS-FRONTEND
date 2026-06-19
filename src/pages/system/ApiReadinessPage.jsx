import { Activity, Database, Layers, PlugZap, ServerCog, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { API_MODES } from '../../api/config';
import { useApiReadiness } from '../../hooks/useApiReadiness';

export function ApiReadinessPage() {
  const { config, endpoints, readiness, updateMode } = useApiReadiness();
  const endpointRows = endpoints.map((endpoint, index) => ({ id: `${endpoint.module}-${endpoint.name}-${index}`, ...endpoint }));
  const serviceRows = readiness.services.map((service) => ({ id: service, service, status: 'Mapped', mode: readiness.apiMode }));
  const modelRows = readiness.mappedModels.map((model) => ({ id: model, model, status: 'Mapped', purpose: model === 'Catalog Item' ? 'Catalog and reference-range backend contract' : `${model} backend payload mapper` }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business Stage 10"
        title="Live API Integration Console"
        description="Frontend service layer, endpoint map, model mappers, token storage, and mock/live API switch are aligned with the completed backend business logic."
        actions={
          <>
            <Button variant={readiness.apiMode === API_MODES.MOCK ? 'primary' : 'secondary'} onClick={() => updateMode(API_MODES.MOCK)}>Mock API Mode</Button>
            <Button variant={readiness.apiMode === API_MODES.LIVE ? 'primary' : 'secondary'} onClick={() => updateMode(API_MODES.LIVE)}>Live API Mode</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="API Mode" value={readiness.apiMode.toUpperCase()} icon={PlugZap} tone={readiness.apiMode === API_MODES.MOCK ? 'yellow' : 'green'} helper="Mock mode uses local demo data; live mode calls the backend API." />
        <MetricCard label="Service Files" value={readiness.serviceCount} icon={Layers} tone="blue" helper="Auth, patient, doctor, lab, scan, billing, admin and more." />
        <MetricCard label="Endpoint Contracts" value={readiness.endpointCount} icon={ServerCog} tone="purple" helper="Mapped to the planned backend API routes." />
        <MetricCard label="Mapped Models" value={readiness.mappedModels.length} icon={Database} tone="green" helper="Core frontend objects normalized for backend payloads." />
      </div>

      <Card title="Backend connection settings" subtitle="Use this console to verify live mode settings before connecting the pages to the backend.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Base URL</p>
            <p className="mt-2 break-all text-sm font-bold text-slate-800">{config.baseUrl}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Timeout</p>
            <p className="mt-2 text-sm font-bold text-slate-800">{config.timeoutMs}ms</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Status</p>
            <div className="mt-2"><StatusBadge status={readiness.apiMode === API_MODES.MOCK ? 'Backend pending' : 'Live mode selected'} /></div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <strong>Important:</strong> Mock mode keeps the frontend working without a backend. When the backend is ready, set <code className="rounded bg-white/70 px-1 py-0.5">VITE_API_BASE_URL</code> and switch to Live API Mode.
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Service readiness" subtitle="Each service file now acts as the future integration boundary between pages and backend APIs.">
          <DataTable
            dense
            columns={[
              { key: 'service', label: 'Service' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'mode', label: 'Current Mode' }
            ]}
            rows={serviceRows}
          />
        </Card>

        <Card title="Model mappers" subtitle="Core objects are mapped to backend-friendly payload contracts.">
          <DataTable
            dense
            columns={[
              { key: 'model', label: 'Model' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'purpose', label: 'Purpose' }
            ]}
            rows={modelRows}
          />
        </Card>
      </div>

      <Card title="Endpoint contract map" subtitle="These are the backend API contracts the frontend is now prepared to connect to.">
        <DataTable
          dense
          columns={[
            { key: 'module', label: 'Module', render: (row) => <span className="font-black capitalize text-slate-800">{row.module}</span> },
            { key: 'name', label: 'Action' },
            { key: 'signature', label: 'Endpoint Contract' }
          ]}
          rows={endpointRows}
        />
      </Card>

      <Card title="Integration readiness checklist">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            'apiClient.js created for live backend requests',
            'Mock backend adapter created for current demo data',
            'Service files created for every major module',
            'Patient, order, result, invoice and catalog mappers created',
            'Endpoint map aligns with planned backend sections',
            'Mock/live API mode switch available',
            'Frontend can keep working before backend exists',
            'Backend integration stays inside services instead of rewriting pages'
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Next backend handoff" subtitle="This summarizes what the backend team should build first.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Foundation', 'Express/TypeScript, PostgreSQL, Prisma, health checks, Swagger'],
            ['Auth + Roles', 'JWT login, refresh tokens, role middleware and permission guards'],
            ['Core APIs', 'Patients, orders, lab, scan, billing, finance, admin and results']
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900"><Activity className="h-4 w-4 text-clinical-600" /> {title}</div>
              <p className="text-sm leading-6 text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
