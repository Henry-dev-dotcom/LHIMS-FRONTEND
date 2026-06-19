import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Search, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { WorkflowTimeline } from '../../components/ui/WorkflowTimeline';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime, money } from '../../utils/formatters';
import { getOrderViewModel } from '../../workflow/workflowEngine';

function ItemTags({ items = [] }) {
  return <div className="flex max-w-[320px] flex-wrap gap-1.5">{items.map((item) => <span key={item.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item.name}</span>)}</div>;
}

const statusCards = [
  { key: 'Submitted', label: 'New / Submitted', description: 'Waiting for reception confirmation.' },
  { key: 'Confirmed', label: 'Confirmed', description: 'Verified and routed to departments.' },
  { key: 'Cancelled', label: 'Cancelled', description: 'Stopped with a reason.' },
  { key: '', label: 'All Orders', description: 'All reception-visible orders.' }
];

export function IncomingOrdersPage() {
  const { state, dispatch } = useAppStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Submitted');
  const [notes, setNotes] = useState('Patient details verified and routed to department queue(s).');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const allReceptionOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (state.data.orders || [])
      .map((order) => getOrderViewModel(order, state.data))
      .filter((order) => !status || order.status === status)
      .filter((order) => !q || [order.id, order.patient?.fullName, order.patient?.phone, order.doctor?.name, order.hospital?.name, order.items?.map((item) => item.name).join(' '), order.urgency, order.status].filter(Boolean).join(' ').toLowerCase().includes(q))
      .sort((a, b) => (a.urgency === 'Urgent' ? -1 : 1) - (b.urgency === 'Urgent' ? -1 : 1) || new Date(b.createdAt) - new Date(a.createdAt));
  }, [state.data, query, status]);

  const selectedOrder = allReceptionOrders.find((order) => order.id === selectedOrderId) || allReceptionOrders[0];
  const submitted = state.data.orders.filter((order) => order.status === 'Submitted').length;
  const urgent = state.data.orders.filter((order) => order.status === 'Submitted' && order.urgency === 'Urgent').length;
  const confirmed = state.data.orders.filter((order) => order.status === 'Confirmed').length;
  const cancelled = state.data.orders.filter((order) => order.status === 'Cancelled').length;

  function confirm(orderId) {
    dispatch({ type: 'CONFIRM_RECEPTION_ORDER', orderId, payload: { receptionNotes: notes } });
  }

  function cancel(orderId) {
    const reason = window.prompt('Enter cancellation reason visible to doctor and admin:') || '';
    if (!reason.trim()) return;
    dispatch({ type: 'TRANSITION_ORDER', payload: { orderId, nextStatus: 'Cancelled', reason } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Phase 7 — Reception Workflow"
        title="Incoming Orders Queue"
        description="A clearer front-desk order board for reviewing doctor-submitted requests, confirming patient details, and routing to Lab or Scan."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Submitted" value={submitted} icon={Search} tone="yellow" />
        <MetricCard label="Urgent waiting" value={urgent} icon={XCircle} tone="red" />
        <MetricCard label="Confirmed" value={confirmed} icon={CheckCircle2} tone="green" />
        <MetricCard label="Cancelled" value={cancelled} icon={ClipboardList} tone="purple" />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {statusCards.map((card) => {
          const count = card.key ? state.data.orders.filter((order) => order.status === card.key).length : state.data.orders.length;
          const active = status === card.key;
          return (
            <button key={card.label} type="button" onClick={() => setStatus(card.key)} className={`rounded-3xl border p-4 text-left transition ${active ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-3"><p className="text-sm font-black text-slate-950">{card.label}</p><span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-black text-white">{count}</span></div>
              <p className="mt-1 text-xs leading-5 text-slate-500">{card.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-6">
          <Card title="Order confirmation panel" subtitle="Keep notes here, then confirm selected orders from the queue.">
            <div className="space-y-4">
              <FormField label="Search orders"><input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order, patient, phone, doctor, test" /></FormField>
              <FormField label="Reception verification notes"><textarea className={inputClass} rows="5" value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">Confirmation verifies the linked invoice, updates the order timeline, and makes each Lab/Scan item visible to its routed department.</div>
            </div>
          </Card>

          <Card title="Focused order preview" subtitle="Select any row to see the exact patient, doctor, routing and invoice context.">
            {selectedOrder ? <div className="space-y-4">
              <div><p className="text-xs font-black uppercase tracking-wide text-slate-400">Order</p><p className="text-xl font-black text-slate-950">{selectedOrder.id}</p><p className="text-sm text-slate-500">Created {formatDateTime(selectedOrder.createdAt)}</p></div>
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div><span className="font-black text-slate-700">Patient:</span> {selectedOrder.patient?.fullName} · {selectedOrder.patient?.phone}</div>
                <div><span className="font-black text-slate-700">Doctor:</span> {selectedOrder.doctor?.name} · {selectedOrder.hospital?.name}</div>
                <div><span className="font-black text-slate-700">Invoice:</span> {selectedOrder.invoice?.id || 'Not generated'} {selectedOrder.invoice ? `· ${money(selectedOrder.invoice.amount)}` : ''}</div>
                <div><span className="font-black text-slate-700">Routed:</span> {(selectedOrder.routedDepartments || []).join(', ') || '—'}</div>
              </div>
              <WorkflowTimeline status={selectedOrder.status} />
              <ItemTags items={selectedOrder.items} />
              <div className="flex flex-wrap gap-2">{selectedOrder.status === 'Submitted' && <Button onClick={() => confirm(selectedOrder.id)}>Confirm Order</Button>} {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Final / Released' && <Button variant="danger" onClick={() => cancel(selectedOrder.id)}>Cancel with Reason</Button>}</div>
            </div> : <p className="text-sm text-slate-500">No order selected.</p>}
          </Card>
        </div>

        <Card title="Incoming doctor orders" subtitle="Click a row to populate the focused preview; urgent orders remain easy to spot.">
          <DataTable
            columns={[
              { key: 'id', label: 'Order', render: (row) => <button type="button" onClick={() => setSelectedOrderId(row.id)} className="font-black text-blue-700 hover:text-blue-900">{row.id}</button> },
              { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-bold text-slate-900">{row.patient?.fullName}</p><p className="text-xs text-slate-500">{row.patient?.phone}</p></div> },
              { key: 'doctor', label: 'Doctor / Hospital', render: (row) => <div><p className="font-bold text-slate-900">{row.doctor?.name}</p><p className="text-xs text-slate-500">{row.hospital?.name}</p></div> },
              { key: 'items', label: 'Tests / Scans', render: (row) => <ItemTags items={row.items} /> },
              { key: 'urgency', label: 'Urgency', render: (row) => <StatusBadge status={row.urgency} /> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'expected', label: 'Expected', render: (row) => formatDateTime(row.expectedCompletionAt) },
              { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-2">{row.status === 'Submitted' && <Button className="px-3 py-1.5 text-xs" onClick={() => confirm(row.id)}>Confirm</Button>} {row.status !== 'Cancelled' && row.status !== 'Final / Released' && <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => cancel(row.id)}>Cancel</Button>}</div> }
            ]}
            rows={allReceptionOrders}
            emptyMessage="No incoming orders match this filter."
          />
        </Card>
      </div>
    </div>
  );
}
