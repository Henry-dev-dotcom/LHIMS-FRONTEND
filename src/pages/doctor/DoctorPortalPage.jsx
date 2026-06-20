import { useState } from 'react';
import { Bell, Building2, CheckCircle2, Clock, Download, Edit3, FileText, LineChart, Send, UserRound } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FormField, inputClass } from '../../components/ui/FormField';
import { formatDateTime } from '../../utils/formatters';
import { openReportPrintWindow } from '../../utils/reporting';
import { getDoctorContextFromState, getReportForOrder, orderItemsText } from './doctorUtils';

function CompactDoctorProfile({ doctor, hospital, dispatch }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(doctor);

  return (
    <Card
      title="Doctor Profile"
      subtitle="Hospital-side profile shown on orders and reports."
      actions={<Button variant="secondary" onClick={() => { setDraft(doctor); setEditing(true); }}><Edit3 className="h-4 w-4" /> Edit Profile</Button>}
      className="h-full"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-clinical-50 p-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-clinical-700 shadow-sm">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-clinical-700">Doctor</p>
            <p className="mt-1 font-black leading-tight text-slate-950">{doctor?.name}</p>
            <p className="text-sm text-slate-500">{doctor?.specialty}</p>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Hospital</dt>
            <dd className="mt-1 font-black text-slate-950">{hospital?.name}</dd>
            <dd className="mt-1"><StatusBadge status={hospital?.accountStatus || 'Unknown'} /></dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">License No.</dt>
            <dd className="mt-1 font-black text-slate-950">{doctor?.licenseNumber}</dd>
            <dd className="text-sm text-slate-500">Medical and Dental Council</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Contact</dt>
            <dd className="mt-1 font-black text-slate-950">{doctor?.phone}</dd>
            <dd className="break-words text-sm text-slate-500">{doctor?.email}</dd>
          </div>
        </dl>
      </div>

      <Modal
        open={editing}
        title="Edit Doctor Profile"
        description="Update doctor profile data used by the doctor portal and report letterhead."
        onClose={() => setEditing(false)}
        footer={<><Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={() => { dispatch({ type: 'UPDATE_DOCTOR_PROFILE', doctorId: doctor.id, payload: draft }); setEditing(false); }}>Save Profile</Button></>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {['name','specialty','licenseNumber','email','phone'].map((field) => (
            <FormField key={field} label={field.replace(/([A-Z])/g, ' $1')}>
              <input className={inputClass} value={draft?.[field] || ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
            </FormField>
          ))}
        </div>
      </Modal>
    </Card>
  );
}

function NotificationPreferences({ doctor, dispatch }) {
  const prefs = doctor?.notificationPreferences || { email: false, sms: false };
  return (
    <Card title="Notification Preferences" subtitle="Result-release alert channels. SMS contains no clinical detail." compact>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {[['email','Email result alerts'], ['sms','SMS result alerts']].map(([key, label]) => (
          <button key={key} onClick={() => dispatch({ type: 'UPDATE_NOTIFICATION_PREFS', doctorId: doctor.id, payload: { [key]: !prefs[key] } })} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3 text-left transition hover:bg-slate-50">
            <div><p className="font-black text-slate-900">{label}</p><p className="text-xs text-slate-500">Notify when results are released.</p></div>
            <StatusBadge status={prefs[key] ? 'Active' : 'Inactive'} />
          </button>
        ))}
      </div>
    </Card>
  );
}

function HospitalAccountInfo({ hospital }) {
  return (
    <Card title="Hospital / Account" subtitle="Linked hospital billing and status." compact>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Hospital</dt><dd className="text-right font-black text-slate-900">{hospital?.name}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Billing</dt><dd className="text-right font-black text-slate-900">{hospital?.billingContact}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd><StatusBadge status={hospital?.accountStatus || 'Unknown'} /></dd></div>
      </dl>
    </Card>
  );
}

export function DoctorPortalPage() {
  const { state, dispatch } = useAppStore();
  const { data, doctor, hospital, activeOrders, completedOrders, doctorPatients } = getDoctorContextFromState(state);
  const recentActive = activeOrders.slice(0, 4);
  const recentCompleted = completedOrders.slice(0, 4);
  const unreadAlerts = data.notifications.filter((notification) => notification.audience === 'doctor' && !notification.read).length;

  const metricCards = [
    ['Active Orders', activeOrders.length, Clock],
    ['Completed Results', completedOrders.length, CheckCircle2],
    ['Referred Patients', doctorPatients.length, UserRound],
    ['Unread Alerts', unreadAlerts, Bell]
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Doctor Portal"
        title="Doctor Dashboard"
        description="A cleaner doctor workspace. Use the sidebar sections for New Order, Active Orders, Completed Orders, Results Viewer, and Patient Trends."
        actions={<><Button onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-new-order' })}><Send className="h-4 w-4" /> New Order</Button><Button variant="secondary" onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-patient-trends' })}><LineChart className="h-4 w-4" /> Patient Trends</Button></>}
      />

      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <CompactDoctorProfile doctor={doctor} hospital={hospital} dispatch={dispatch} />
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            {metricCards.map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <Icon className="mb-3 h-5 w-5 text-clinical-600" />
                <p className="text-xl font-black text-slate-950">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <button onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-new-order' })} className="rounded-3xl border border-clinical-100 bg-clinical-50 p-5 text-left transition hover:border-clinical-300 hover:bg-white">
              <Send className="mb-3 h-5 w-5 text-clinical-700" />
              <p className="font-black text-slate-950">Create New Order</p>
              <p className="mt-1 text-sm text-slate-500">Search patient and add multiple tests/scans.</p>
            </button>
            <button onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-active-orders' })} className="rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:bg-slate-50">
              <Clock className="mb-3 h-5 w-5 text-slate-600" />
              <p className="font-black text-slate-950">Active Orders</p>
              <p className="mt-1 text-sm text-slate-500">Track orders still being processed.</p>
            </button>
            <button onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-completed-orders' })} className="rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:bg-slate-50">
              <FileText className="mb-3 h-5 w-5 text-slate-600" />
              <p className="font-black text-slate-950">Completed Orders</p>
              <p className="mt-1 text-sm text-slate-500">Review finalized results and reports.</p>
            </button>
            <button onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-patient-trends' })} className="rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:bg-slate-50">
              <LineChart className="mb-3 h-5 w-5 text-slate-600" />
              <p className="font-black text-slate-950">Patient Trends</p>
              <p className="mt-1 text-sm text-slate-500">Track repeated test progress.</p>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card title="Recent Active Orders" subtitle="A short dashboard preview. Open Active Orders for the full worklist." actions={<Button variant="secondary" onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-active-orders' })}>View All</Button>}>
            <DataTable
              columns={[
                { key: 'id', label: 'Order ID', render: (order) => <span className="font-black text-slate-950">{order.id}</span> },
                { key: 'patient', label: 'Patient', render: (order) => <div><p className="font-bold">{order.patient?.fullName}</p><p className="text-xs text-slate-400">{order.patient?.id}</p></div> },
                { key: 'items', label: 'Tests / Scans', render: orderItemsText },
                { key: 'status', label: 'Status', render: (order) => <StatusBadge status={order.status} /> },
                { key: 'expected', label: 'Expected', render: (order) => formatDateTime(order.expectedCompletionAt) }
              ]}
              rows={recentActive}
              emptyMessage="No active orders."
            />
          </Card>

          <Card title="Recently Completed" subtitle="A short preview of released reports." actions={<Button variant="secondary" onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'doctor-completed-orders' })}>View Completed</Button>}>
            <DataTable
              columns={[
                { key: 'id', label: 'Order ID', render: (order) => <span className="font-black text-slate-950">{order.id}</span> },
                { key: 'patient', label: 'Patient', render: (order) => order.patient?.fullName || '—' },
                { key: 'items', label: 'Tests / Scans', render: orderItemsText },
                { key: 'date', label: 'Released', render: (order) => formatDateTime(order.updatedAt) },
                { key: 'actions', label: 'Actions', render: (order) => <Button onClick={() => { const report = getReportForOrder(data, order.id); if (report) dispatch({ type: 'MARK_REPORT_DOWNLOADED', reportId: report.id }); openReportPrintWindow({ ...order, resultReport: report }); }}><Download className="h-4 w-4" /> PDF</Button> }
              ]}
              rows={recentCompleted}
              emptyMessage="No completed results released yet."
            />
          </Card>
        </div>
        <div className="space-y-5">
          <NotificationPreferences doctor={doctor} dispatch={dispatch} />
          <HospitalAccountInfo hospital={hospital} />
        </div>
      </div>
    </div>
  );
}
