import { useMemo, useState } from 'react';
import { CheckCircle2, Search, ScanLine } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { inputClass } from '../../components/ui/FormField';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime } from '../../utils/formatters';
import { describeOrderItems, getScanCatalogItems, getScanOrders } from '../../utils/orderViews';

function scanQueueMatches(row, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.id, row.patient?.fullName, row.patient?.id, row.doctor?.name, row.hospital?.name, describeOrderItems(row.items), row.urgency, row.status]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

export function ScanQueuePage() {
  const { state, dispatch } = useAppStore();
  const data = state.data;
  const [query, setQuery] = useState('');
  const [modality, setModality] = useState('');
  const [status, setStatus] = useState('');
  const scanOrders = useMemo(() => getScanOrders(data)
    .filter((order) => order.status !== 'Submitted' && order.status !== 'Cancelled')
    .filter((order) => !status || order.status === status)
    .filter((order) => !modality || getScanCatalogItems(order, data.catalog || []).some((item) => item.modality === modality))
    .filter((order) => scanQueueMatches(order, query))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [data, query, modality, status]);
  const acceptedOrderIds = new Set((data.scanBookings || []).filter((booking) => booking.status === 'Accepted').map((booking) => booking.orderId));
  const waiting = scanOrders.filter((order) => !acceptedOrderIds.has(order.id));
  const modalities = [...new Set((data.catalog || []).filter((item) => item.department === 'Imaging').map((item) => item.modality).filter(Boolean))];
  const pendingReports = scanOrders.filter((order) => !order.result || order.result.status !== 'Final / Released').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Imaging · Requested Patients"
        title="Scan Queue"
        description="A lighter patient-focused queue. Review and accept scan requests first, then continue reporting from Accepted Scans. Lab-only requests are hidden from imaging staff."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Scan Patients" value={scanOrders.length} icon={ScanLine} tone="purple" />
        <MetricCard label="Waiting Acceptance" value={waiting.length} icon={CheckCircle2} tone="yellow" />
        <MetricCard label="Accepted Scans" value={acceptedOrderIds.size} icon={CheckCircle2} tone="green" />
        <MetricCard label="Pending Reports" value={pendingReports} icon={ScanLine} tone="blue" />
      </div>
      <Card title="Requested scan patients" subtitle="Search by patient name, order ID, doctor, hospital, modality or scan name.">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient name, order ID, scan name..." />
          </div>
          <select className={inputClass} value={modality} onChange={(event) => setModality(event.target.value)}><option value="">All modalities</option>{modalities.map((item) => <option key={item}>{item}</option>)}</select>
          <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>Confirmed</option><option>In Progress</option><option>Pending Review</option><option>Final / Released</option></select>
        </div>
        <DataTable
          columns={[
            { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-black text-slate-950">{row.patient?.fullName}</p><p className="text-xs text-slate-400">{row.patient?.id}</p></div> },
            { key: 'id', label: 'Order ID', render: (row) => <span className="font-black text-slate-950">{row.id}</span> },
            { key: 'scans', label: 'Scans', render: (row) => <div className="max-w-[280px] text-sm font-semibold text-slate-700">{describeOrderItems(row.items)}</div> },
            { key: 'modality', label: 'Modality', render: (row) => <div className="flex flex-wrap gap-1">{getScanCatalogItems(row, data.catalog || []).map((item) => <StatusBadge key={item.id} status={item.modality} />)}</div> },
            { key: 'doctor', label: 'Doctor / Hospital', render: (row) => <div><p className="font-semibold">{row.doctor?.name}</p><p className="text-xs text-slate-400">{row.hospital?.name}</p></div> },
            { key: 'urgency', label: 'Urgency', render: (row) => <StatusBadge status={row.urgency} /> },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={acceptedOrderIds.has(row.id) ? 'Scan Accepted' : row.status} /> },
            { key: 'createdAt', label: 'Requested', render: (row) => formatDateTime(row.createdAt) },
            { key: 'actions', label: 'Action', render: (row) => <Button onClick={() => dispatch({ type: 'OPEN_SCAN_ACCEPT', orderId: row.id })}><CheckCircle2 className="h-4 w-4" /> Review / Accept</Button> }
          ]}
          rows={scanOrders}
          emptyMessage="No imaging-routed patients match your search."
        />
      </Card>
    </div>
  );
}
