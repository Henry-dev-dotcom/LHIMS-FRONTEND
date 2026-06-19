import { useMemo, useState } from 'react';
import { CalendarDays, Clock, ScanLine, Search } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime, getById } from '../../utils/formatters';

function dateOnly(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export function AppointmentsPage() {
  const { state, dispatch } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ patientId: '', orderId: '', scheduledAt: '', purpose: 'Visit / sample collection', room: 'Reception', notes: '' });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Scheduled');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('');
  const selectedPatientOrders = useMemo(() => state.data.orders.filter((order) => !form.patientId || order.patientId === form.patientId), [state.data.orders, form.patientId]);
  const rooms = ['Reception', 'Sample Collection Bay', 'X-Ray Room 1', 'Ultrasound Room', 'CT Suite', 'MRI Suite'];

  function submit(event) {
    event.preventDefault();
    dispatch({ type: 'CREATE_APPOINTMENT', payload: form });
    setForm({ patientId: '', orderId: '', scheduledAt: '', purpose: 'Visit / sample collection', room: 'Reception', notes: '' });
  }

  function mark(appointmentId, nextStatus) {
    const reason = ['Cancelled', 'Rescheduled'].includes(nextStatus) ? (window.prompt(`Reason for ${nextStatus.toLowerCase()}:`) || '') : '';
    if (['Cancelled', 'Rescheduled'].includes(nextStatus) && !reason.trim()) return;
    dispatch({ type: 'UPDATE_APPOINTMENT_STATUS', payload: { appointmentId, status: nextStatus, reason } });
  }

  const appointments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (state.data.appointments || [])
      .map((appointment) => ({ ...appointment, patient: getById(state.data.patients, appointment.patientId), order: getById(state.data.orders, appointment.orderId) }))
      .filter((appointment) => !status || appointment.status === status)
      .filter((appointment) => !room || appointment.room === room)
      .filter((appointment) => !date || dateOnly(appointment.scheduledAt) === date)
      .filter((appointment) => !q || [appointment.id, appointment.patient?.fullName, appointment.patient?.phone, appointment.orderId, appointment.room, appointment.purpose, appointment.status].filter(Boolean).join(' ').toLowerCase().includes(q))
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }, [state.data, query, status, room, date]);

  const scheduled = (state.data.appointments || []).filter((item) => item.status === 'Scheduled').length;
  const todaySlots = (state.data.appointments || []).filter((item) => dateOnly(item.scheduledAt) === today).length;
  const imagingSlots = (state.data.appointments || []).filter((item) => /x-ray|ultrasound|ct|mri/i.test(`${item.room} ${item.purpose}`)).length;
  const completed = (state.data.appointments || []).filter((item) => item.status === 'Completed').length;

  const roomBoard = rooms.map((roomName) => ({ room: roomName, count: appointments.filter((item) => item.room === roomName).length }));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Phase 7 — Reception Workflow" title="Appointment Scheduler" description="Schedule patient visits, keep room/equipment coordination visible, and track completed, cancelled and rescheduled slots." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Scheduled" value={scheduled} icon={CalendarDays} tone="blue" />
        <MetricCard label="Today" value={todaySlots} icon={Clock} tone="green" />
        <MetricCard label="Imaging slots" value={imagingSlots} icon={ScanLine} tone="purple" />
        <MetricCard label="Completed" value={completed} icon={Search} tone="yellow" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-6">
          <Card title="Create appointment" subtitle="Links visit schedule to patient and optional order.">
            <form onSubmit={submit} className="space-y-4">
              <FormField label="Patient"><select className={inputClass} required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value, orderId: '' })}><option value="">Choose patient</option>{state.data.patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} — {patient.id}</option>)}</select></FormField>
              <FormField label="Linked Order"><select className={inputClass} value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}><option value="">No linked order</option>{selectedPatientOrders.map((order) => <option key={order.id} value={order.id}>{order.id} — {order.status}</option>)}</select></FormField>
              <FormField label="Scheduled date/time"><input type="datetime-local" className={inputClass} required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} /></FormField>
              <FormField label="Purpose"><input className={inputClass} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></FormField>
              <FormField label="Room / Area"><select className={inputClass} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>{rooms.map((roomName) => <option key={roomName}>{roomName}</option>)}</select></FormField>
              <FormField label="Notes"><textarea rows="3" className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FormField>
              <Button type="submit">Schedule Appointment</Button>
            </form>
          </Card>

          <Card title="Room / area board" subtitle="A quick visibility board for reception and imaging slots.">
            <div className="grid gap-3 sm:grid-cols-2">
              {roomBoard.map((item) => <button key={item.room} type="button" onClick={() => setRoom(item.room)} className={`rounded-2xl border p-3 text-left ${room === item.room ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}><p className="font-black text-slate-950">{item.room}</p><p className="text-xs text-slate-500">{item.count} visible slot(s)</p></button>)}
            </div>
          </Card>
        </div>

        <Card
          title="Calendar / slot list"
          subtitle="Filtered appointment list with completion, reschedule and cancellation controls."
          actions={<div className="grid gap-3 md:grid-cols-4"><input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient/order/room" /><input type="date" className={inputClass} value={date} onChange={(event) => setDate(event.target.value)} /><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>Scheduled</option><option>Completed</option><option>Rescheduled</option><option>Cancelled</option></select><select className={inputClass} value={room} onChange={(event) => setRoom(event.target.value)}><option value="">All rooms</option>{rooms.map((roomName) => <option key={roomName}>{roomName}</option>)}</select></div>}
        >
          <DataTable columns={[{ key: 'id', label: 'Appointment', render: (row) => <span className="font-black text-slate-950">{row.id}</span> }, { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-bold">{row.patient?.fullName || '—'}</p><p className="text-xs text-slate-500">{row.patient?.phone || row.patientId}</p></div> }, { key: 'orderId', label: 'Order', render: (row) => row.orderId || '—' }, { key: 'room', label: 'Room' }, { key: 'purpose', label: 'Purpose' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }, { key: 'scheduledAt', label: 'Time', render: (row) => formatDateTime(row.scheduledAt) }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => mark(row.id, 'Completed')}>Complete</Button><Button variant="subtle" className="px-3 py-1.5 text-xs" onClick={() => mark(row.id, 'Rescheduled')}>Reschedule</Button><Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => mark(row.id, 'Cancelled')}>Cancel</Button></div> }]} rows={appointments} emptyMessage="No appointment slots match this filter." />
        </Card>
      </div>
    </div>
  );
}
