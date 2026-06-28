import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, FlaskConical, Search, Send, UploadCloud } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { inputClass } from '../../components/ui/FormField';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime } from '../../utils/formatters';
import { describeOrderItems, getLabOrders } from '../../utils/orderViews';

function resultTestNames(result, order) {
  const namesFromParameters = Array.from(new Set((result?.parameters || []).map((parameter) => parameter.testName).filter(Boolean)));
  if (namesFromParameters.length) return namesFromParameters;
  return (order?.items || []).map((item) => item.name).filter(Boolean);
}

function matchesResult(row, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.result?.id, row.result?.orderId, row.order?.patient?.fullName, row.order?.patient?.id, row.order?.doctor?.name, row.order?.hospital?.name, resultTestNames(row.result, row.order).join(', '), row.result?.status]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function LabResultCard({ row, onOpen }) {
  const abnormal = (row.result?.parameters || []).some((parameter) => ['High', 'Low', 'Critical'].includes(parameter.flag));
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-clinical-200 hover:bg-slate-50/70">
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.9fr)_minmax(320px,1.2fr)_minmax(260px,0.9fr)]">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-slate-950">{row.order?.patient?.fullName || 'Unknown patient'}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">{row.order?.patient?.id} · {row.result?.orderId}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status="Sent to Clinician" />
            {abnormal && <StatusBadge status="Abnormal" />}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Lab tests</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {resultTestNames(row.result, row.order).map((name) => (
              <span key={`${row.result?.id}-${name}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">{name}</span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Clinician / Hospital</p>
            <p className="mt-1 truncate font-black text-slate-900">{row.order?.doctor?.name}</p>
            <p className="truncate text-sm text-slate-500">{row.order?.hospital?.name}</p>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">Sent {formatDateTime(row.result?.signedAt || row.result?.approvedAt || row.result?.updatedAt)}</p>
          <Button onClick={() => onOpen(row)} className="w-full justify-center"><FileText className="h-4 w-4" /> View Stored Result</Button>
        </div>
      </div>
    </article>
  );
}

export function LabResultsPage() {
  const { state } = useAppStore();
  const data = state.data;
  const labOrders = useMemo(() => getLabOrders(data), [data]);
  const [query, setQuery] = useState('');
  const [workspace, setWorkspace] = useState('list');
  const [activeResultId, setActiveResultId] = useState('');

  const rows = useMemo(() => (data.results || [])
    .filter((result) => result.department === 'Laboratory' && result.status === 'Final / Released')
    .map((result) => ({ result, order: labOrders.find((order) => order.id === result.orderId) }))
    .sort((a, b) => new Date(b.result.signedAt || b.result.approvedAt || b.result.updatedAt || 0) - new Date(a.result.signedAt || a.result.approvedAt || a.result.updatedAt || 0)), [data, labOrders]);

  const filteredRows = rows.filter((row) => matchesResult(row, query));
  const activeRow = rows.find((row) => row.result.id === activeResultId) || null;
  const abnormalCount = rows.filter((row) => (row.result.parameters || []).some((parameter) => ['High', 'Low', 'Critical'].includes(parameter.flag))).length;
  const fileCount = rows.reduce((total, row) => total + (row.result.files?.length || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const sentToday = rows.filter((row) => String(row.result.signedAt || row.result.approvedAt || row.result.updatedAt || '').startsWith(today)).length;

  const openResult = (row) => {
    setActiveResultId(row.result.id);
    setWorkspace('detail');
  };

  return (
    <div className="getlabs-page space-y-6">
      <PageHeader
        eyebrow="Laboratory · Sent Reports"
        title="Results"
        description="All laboratory results pushed to clinicians are stored here for review, audit reference, and future retrieval."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Stored Results" value={rows.length} icon={FileText} tone="blue" />
        <MetricCard label="Sent Today" value={sentToday} icon={Send} tone="green" />
        <MetricCard label="Abnormal Flags" value={abnormalCount} icon={CheckCircle2} tone="red" />
        <MetricCard label="Attachments" value={fileCount} icon={UploadCloud} tone="purple" />
      </div>

      {workspace === 'list' && (
        <Card title="Sent laboratory results" subtitle="Search all reports that have already been pushed directly to clinicians.">
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, order ID, clinician, hospital, or test..." />
            </div>
            <div className="space-y-3">
              {filteredRows.length ? filteredRows.map((row) => (
                <LabResultCard key={row.result.id} row={row} onOpen={openResult} />
              )) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="font-black text-slate-900">No sent laboratory results found.</p>
                  <p className="mt-2 text-sm text-slate-500">Completed results will appear here after they are pushed from Accepted Samples.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {workspace === 'detail' && (
        <Card title="Stored laboratory result" subtitle="This report has already been pushed to the clinician and stored in the laboratory results archive.">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <Button variant="secondary" onClick={() => setWorkspace('list')}><ArrowLeft className="h-4 w-4" /> Back to Results</Button>
              {activeRow && <div className="flex flex-wrap items-center gap-2"><StatusBadge status="Sent to Clinician" /><StatusBadge status={activeRow.result.status} /></div>}
            </div>

            {!activeRow ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="font-black text-slate-900">No stored result selected.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Patient</p><p className="mt-1 font-black text-slate-950">{activeRow.order?.patient?.fullName}</p><p className="text-sm text-slate-500">{activeRow.order?.patient?.id}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Order / Result</p><p className="mt-1 font-black text-slate-950">{activeRow.result.orderId}</p><p className="text-sm text-slate-500">{activeRow.result.id}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Clinician</p><p className="mt-1 font-black text-slate-950">{activeRow.order?.doctor?.name}</p><p className="text-sm text-slate-500">{activeRow.order?.hospital?.name}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Sent</p><p className="mt-1 font-black text-slate-950">{formatDateTime(activeRow.result.signedAt || activeRow.result.approvedAt || activeRow.result.updatedAt)}</p><p className="text-sm text-slate-500">{activeRow.result.signedBy || activeRow.result.approvedBy}</p></div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Result parameters</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {(activeRow.result.parameters || []).map((parameter, index) => (
                      <div key={`${parameter.testId}-${parameter.name}-${index}`} className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-black text-slate-500">{parameter.testName}</p>
                        <p className="mt-1 font-black text-slate-950">{parameter.name}: {parameter.value} {parameter.unit}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {parameter.referenceRange && <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">Ref: {parameter.referenceRange}</span>}
                          <StatusBadge status={parameter.flag || 'Normal'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Report summary</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{activeRow.result.reportText || 'No report summary provided.'}</p>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Attachments</p>
                    <div className="mt-3 space-y-2">
                      {(activeRow.result.files || []).length ? activeRow.result.files.map((file) => (
                        <div key={file.id || file.name} className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                          <UploadCloud className="mt-0.5 h-4 w-4 shrink-0 text-clinical-600" />
                          <div className="min-w-0">
                            <p className="truncate">{file.name || file.fileName}</p>
                            {file.testName && <p className="mt-0.5 text-xs font-semibold text-slate-500">Attached to {file.testName}</p>}
                          </div>
                        </div>
                      )) : <p className="text-sm text-slate-500">No imported files attached.</p>}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Audit details</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p><span className="font-black text-slate-900">Hash:</span> {activeRow.result.reportHash || 'Not available'}</p>
                      <p><span className="font-black text-slate-900">Secure ID:</span> {activeRow.result.secureId || 'Not available'}</p>
                      <p><span className="font-black text-slate-900">Signature:</span> {activeRow.result.signatureStatus || 'Signed'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
