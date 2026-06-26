import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, CheckSquare, FlaskConical, Search, Square } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { inputClass } from '../../components/ui/FormField';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime } from '../../utils/formatters';
import { describeOrderItems, getLabOrders } from '../../utils/orderViews';

function labQueueMatches(row, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.id, row.patient?.fullName, row.patient?.id, row.doctor?.name, row.hospital?.name, describeOrderItems(row.items), row.urgency, row.status]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function sampleStateForOrder(data, orderId) {
  const samples = (data.sampleLogs || []).filter((sample) => sample.orderId === orderId);
  if (samples.some((sample) => sample.status === 'Accepted')) return 'Accepted';
  if (samples.some((sample) => sample.status === 'Rejected')) return 'Rejected';
  if (samples.some((sample) => sample.status === 'Recollection Requested')) return 'Recollection Requested';
  return 'Not Accepted';
}

function acceptedSampleForOrder(data, orderId) {
  return (data.sampleLogs || []).find((sample) => sample.orderId === orderId && sample.status === 'Accepted');
}

function LabQueueStepper({ currentStep }) {
  const steps = [
    { number: 1, label: 'Queue' },
    { number: 2, label: 'Review sample' },
    { number: 3, label: 'Send to diagnostics' }
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="grid gap-2 md:grid-cols-3">
        {steps.map((step) => {
          const active = step.number === currentStep;
          const complete = step.number < currentStep;
          return (
            <div key={step.number} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${active ? 'bg-clinical-50 text-clinical-800' : 'bg-slate-50 text-slate-500'}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${active || complete ? 'bg-clinical-600 text-white' : 'bg-white text-slate-400'}`}>{step.number}</span>
              <span className="text-sm font-black">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LabQueuePage() {
  const { state, dispatch } = useAppStore();
  const data = state.data;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sampleFilter, setSampleFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [workspace, setWorkspace] = useState(state.ui.activeLabAcceptOrderId ? 'review' : 'queue');
  const [activeOrderId, setActiveOrderId] = useState(state.ui.activeLabAcceptOrderId || '');
  const [sampleType, setSampleType] = useState('Blood');

  const labOrders = useMemo(() => getLabOrders(data), [data]);
  const baseRows = useMemo(() => labOrders
    .filter((order) => !status || order.status === status)
    .filter((order) => labQueueMatches(order, query))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [labOrders, query, status]);
  const rows = baseRows.filter((order) => !sampleFilter || sampleStateForOrder(data, order.id) === sampleFilter);
  const activeOrder = labOrders.find((order) => order.id === activeOrderId) || null;
  const acceptedSample = activeOrder ? acceptedSampleForOrder(data, activeOrder.id) : null;

  const acceptedOrderIds = new Set((data.sampleLogs || []).filter((sample) => sample.status === 'Accepted').map((sample) => sample.orderId));
  const pending = baseRows.filter((order) => !acceptedOrderIds.has(order.id));
  const urgent = baseRows.filter((order) => order.urgency === 'Urgent').length;
  const pendingReview = baseRows.filter((order) => order.result?.status === 'Pending Review').length;
  const selectableRows = rows.filter((order) => sampleStateForOrder(data, order.id) !== 'Accepted');
  const allVisibleSelected = selectableRows.length > 0 && selectableRows.every((order) => selected.includes(order.id));
  const toggleRow = (orderId) => setSelected((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]);
  const toggleAll = () => setSelected(allVisibleSelected ? [] : selectableRows.map((order) => order.id));
  const batchAccept = () => {
    dispatch({ type: 'BATCH_ACCEPT_LAB_SAMPLES', orderIds: selected, payload: { sampleType: 'Blood' } });
    setSelected([]);
  };
  const openReviewWorkspace = (order) => {
    const sample = acceptedSampleForOrder(data, order.id);
    setActiveOrderId(order.id);
    setSampleType(sample?.sampleType || 'Blood');
    setWorkspace('review');
  };
  const goBackToQueue = () => {
    setWorkspace('queue');
    setActiveOrderId('');
  };
  const sendActiveToDiagnostics = () => {
    if (!activeOrder) return;
    dispatch({ type: 'ACCEPT_LAB_SAMPLE', orderId: activeOrder.id, payload: { sampleType } });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Laboratory · Requested Patients"
        title="Lab Queue"
        description="A focused queue workflow. Select one request, review it in the same page area, then send the sample directly to diagnostics."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Lab Patients" value={baseRows.length} icon={Search} tone="blue" />
        <MetricCard label="Awaiting Sample" value={pending.length} icon={CheckCircle2} tone="yellow" />
        <MetricCard label="Urgent" value={urgent} icon={CheckCircle2} tone="red" />
        <MetricCard label="Pending Review" value={pendingReview} icon={CheckCircle2} tone="purple" />
      </div>

      {workspace === 'queue' && (
        <Card title="Requested lab patients" subtitle="Search and select a request. The review panel opens here instead of continuing further down the page.">
          <div className="space-y-4">
            <LabQueueStepper currentStep={1} />

            <div className="grid gap-3 xl:grid-cols-[1fr_200px_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient name, patient ID, order ID, test name..." />
              </div>
              <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">All order statuses</option>
                <option>Submitted</option>
                <option>Confirmed</option>
                <option>In Progress</option>
                <option>Pending Review</option>
                <option>Final / Released</option>
              </select>
              <select className={inputClass} value={sampleFilter} onChange={(event) => setSampleFilter(event.target.value)}>
                <option value="">All sample states</option>
                <option>Not Accepted</option>
                <option>Accepted</option>
                <option>Rejected</option>
                <option>Recollection Requested</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-600"><span className="font-black text-slate-950">{selected.length}</span> selected for direct diagnostic routing</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={toggleAll}>{allVisibleSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />} {allVisibleSelected ? 'Clear visible' : 'Select visible'}</Button>
                <Button disabled={!selected.length} onClick={batchAccept}><CheckCircle2 className="h-4 w-4" /> Send Selected to Diagnostics</Button>
              </div>
            </div>

            <DataTable
              columns={[
                { key: 'select', label: '', render: (row) => <button type="button" disabled={sampleStateForOrder(data, row.id) === 'Accepted'} onClick={() => toggleRow(row.id)} className="text-clinical-700 disabled:text-slate-300">{selected.includes(row.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}</button> },
                { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-black text-slate-950">{row.patient?.fullName}</p><p className="text-xs text-slate-400">{row.patient?.id}</p></div> },
                { key: 'id', label: 'Order ID', render: (row) => <span className="font-black text-slate-950">{row.id}</span> },
                { key: 'tests', label: 'Lab Tests', render: (row) => <div className="max-w-[300px] text-sm font-semibold text-slate-700">{describeOrderItems(row.items)}</div> },
                { key: 'doctor', label: 'Clinician / Hospital', render: (row) => <div><p className="font-semibold">{row.doctor?.name}</p><p className="text-xs text-slate-400">{row.hospital?.name}</p></div> },
                { key: 'urgency', label: 'Urgency', render: (row) => <StatusBadge status={row.urgency} /> },
                { key: 'status', label: 'Sample', render: (row) => <StatusBadge status={sampleStateForOrder(data, row.id)} /> },
                { key: 'createdAt', label: 'Requested', render: (row) => formatDateTime(row.createdAt) },
                { key: 'actions', label: 'Action', render: (row) => <Button onClick={() => openReviewWorkspace(row)}><CheckCircle2 className="h-4 w-4" /> {sampleStateForOrder(data, row.id) === 'Accepted' ? 'Open' : 'Review / Send'}</Button> }
              ]}
              rows={rows}
              emptyMessage="No lab-routed patients match your search."
            />
          </div>
        </Card>
      )}

      {workspace === 'review' && (
        <Card title="Sample routing workspace" subtitle="Review the request and send the specimen straight to diagnostic result entry.">
          <div className="space-y-5">
            <LabQueueStepper currentStep={activeOrder && acceptedSample ? 3 : 2} />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <Button variant="secondary" onClick={goBackToQueue}><ArrowLeft className="h-4 w-4" /> Back to Queue</Button>
              {activeOrder && <div className="flex flex-wrap items-center gap-2"><StatusBadge status={activeOrder.urgency} /><StatusBadge status={sampleStateForOrder(data, activeOrder.id)} /></div>}
            </div>

            {!activeOrder ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="font-black text-slate-900">No lab request selected.</p>
                <p className="mt-2 text-sm text-slate-500">Go back to the queue and select a patient request.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Patient</p>
                    <p className="mt-1 font-black text-slate-950">{activeOrder.patient?.fullName}</p>
                    <p className="text-sm text-slate-500">{activeOrder.patient?.id} · {activeOrder.patient?.phone}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Order ID</p>
                    <p className="mt-1 font-black text-slate-950">{activeOrder.id}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(activeOrder.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Clinician</p>
                    <p className="mt-1 font-black text-slate-950">{activeOrder.doctor?.name}</p>
                    <p className="text-sm text-slate-500">{activeOrder.hospital?.name}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Processing</p>
                    <p className="mt-1 font-black text-slate-950">{activeOrder.status}</p>
                    <p className="text-sm text-slate-500">{activeOrder.items?.length || 0} requested item(s)</p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                  <div className="rounded-3xl border border-slate-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Requested lab tests</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {activeOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                          <span className="font-bold text-slate-900"><FlaskConical className="mr-2 inline h-4 w-4 text-clinical-600" />{item.name}</span>
                          <StatusBadge status={item.id} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Sample type</p>
                    <select className={`${inputClass} mt-3`} value={sampleType} onChange={(event) => setSampleType(event.target.value)} disabled={Boolean(acceptedSample)}>
                      <option>Blood</option>
                      <option>Urine</option>
                      <option>Stool</option>
                      <option>Swab</option>
                      <option>Serum</option>
                      <option>Plasma</option>
                    </select>
                    {acceptedSample ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="font-black text-emerald-800">Sample already sent: {acceptedSample.id}</p>
                        <p className="mt-1 text-sm text-emerald-700">Accepted by {acceptedSample.acceptedBy || acceptedSample.collectedBy} at {formatDateTime(acceptedSample.acceptedAt || acceptedSample.collectedAt)}</p>
                      </div>
                    ) : (
                      <Button onClick={sendActiveToDiagnostics}><CheckCircle2 className="h-4 w-4" /> Send to Diagnostics</Button>
                    )}
                    {acceptedSample && <Button onClick={sendActiveToDiagnostics}><CheckCircle2 className="h-4 w-4" /> Open Diagnostics Workspace</Button>}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Clinical notes</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{activeOrder.clinicalNotes || 'No clinical notes provided.'}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
