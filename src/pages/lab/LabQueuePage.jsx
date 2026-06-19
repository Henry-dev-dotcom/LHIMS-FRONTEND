import { useMemo, useState } from 'react';
import { CheckCircle2, Search, Square, CheckSquare } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PatientTrendsPanel } from '../../components/ui/PatientTrendsPanel';
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

export function LabQueuePage() {
  const { state, dispatch } = useAppStore();
  const data = state.data;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sampleFilter, setSampleFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const baseRows = useMemo(() => getLabOrders(data)
    .filter((order) => !status || order.status === status)
    .filter((order) => labQueueMatches(order, query))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [data, query, status]);
  const rows = baseRows.filter((order) => !sampleFilter || sampleStateForOrder(data, order.id) === sampleFilter);

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Laboratory · Requested Patients"
        title="Lab Queue"
        description="Only lab-routed requests are shown here. Search patients, select multiple requests, and accept samples in batches before result entry."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Lab Patients" value={baseRows.length} icon={Search} tone="blue" />
        <MetricCard label="Waiting Acceptance" value={pending.length} icon={CheckCircle2} tone="yellow" />
        <MetricCard label="Urgent" value={urgent} icon={CheckCircle2} tone="red" />
        <MetricCard label="Pending Review" value={pendingReview} icon={CheckCircle2} tone="purple" />
      </div>
      <Card title="Requested lab patients" subtitle="Search by patient name, order ID, doctor, hospital, or test name. Use batch acceptance when several samples arrive together.">
        <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_200px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient name, patient ID, order ID, test name..." />
          </div>
          <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All order statuses</option><option>Submitted</option><option>Confirmed</option><option>In Progress</option><option>Pending Review</option><option>Final / Released</option></select>
          <select className={inputClass} value={sampleFilter} onChange={(event) => setSampleFilter(event.target.value)}><option value="">All sample states</option><option>Not Accepted</option><option>Accepted</option><option>Rejected</option><option>Recollection Requested</option></select>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-600"><span className="font-black text-slate-950">{selected.length}</span> selected for batch acceptance</div>
          <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={toggleAll}>{allVisibleSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />} {allVisibleSelected ? 'Clear visible' : 'Select visible'}</Button><Button disabled={!selected.length} onClick={batchAccept}><CheckCircle2 className="h-4 w-4" /> Accept Selected Samples</Button></div>
        </div>
        <DataTable
          columns={[
            { key: 'select', label: '', render: (row) => <button type="button" disabled={sampleStateForOrder(data, row.id) === 'Accepted'} onClick={() => toggleRow(row.id)} className="text-clinical-700 disabled:text-slate-300">{selected.includes(row.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}</button> },
            { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-black text-slate-950">{row.patient?.fullName}</p><p className="text-xs text-slate-400">{row.patient?.id}</p></div> },
            { key: 'id', label: 'Order ID', render: (row) => <span className="font-black text-slate-950">{row.id}</span> },
            { key: 'tests', label: 'Lab Tests', render: (row) => <div className="max-w-[280px] text-sm font-semibold text-slate-700">{describeOrderItems(row.items)}</div> },
            { key: 'doctor', label: 'Doctor / Hospital', render: (row) => <div><p className="font-semibold">{row.doctor?.name}</p><p className="text-xs text-slate-400">{row.hospital?.name}</p></div> },
            { key: 'urgency', label: 'Urgency', render: (row) => <StatusBadge status={row.urgency} /> },
            { key: 'status', label: 'Sample', render: (row) => <StatusBadge status={sampleStateForOrder(data, row.id)} /> },
            { key: 'createdAt', label: 'Requested', render: (row) => formatDateTime(row.createdAt) },
            { key: 'actions', label: 'Action', render: (row) => <Button onClick={() => dispatch({ type: 'OPEN_LAB_ACCEPT', orderId: row.id })}><CheckCircle2 className="h-4 w-4" /> Review / Accept</Button> }
          ]}
          rows={rows}
          emptyMessage="No lab-routed patients match your search."
        />
      </Card>
      <PatientTrendsPanel data={data} allowedPatientIds={[...new Set(baseRows.map((row) => row.patientId))]} title="Lab Patient Trends" subtitle="Trend finalized lab values for patients visible in the laboratory workflow." />
    </div>
  );
}
