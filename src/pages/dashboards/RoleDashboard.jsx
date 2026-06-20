import {
  Bell,
  Building2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FlaskConical,
  ScanLine,
  ShieldCheck,
  UserRound,
  UsersRound
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { WorkflowTimeline } from '../../components/ui/WorkflowTimeline';
import { InsightStrip } from '../../components/ui/InsightStrip';
import { ROLE_DASHBOARD_REQUIREMENTS, ROLES } from '../../data/roles';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime, getById, money } from '../../utils/formatters';
import { getNavForRole } from '../../utils/permissions';

const roleHeaders = {
  doctor: {
    eyebrow: 'Doctor Portal',
    title: 'Hospital-side doctor workspace',
    description: 'Places patient orders, follows active work, receives released results, and manages result notification preferences.'
  },
  receptionist: {
    eyebrow: 'Reception Desk',
    title: 'Incoming order and check-in command center',
    description: 'Confirms doctor orders, handles walk-ins, manages patient check-in, and routes work to billing, lab and scan units.'
  },
  lab: {
    eyebrow: 'Laboratory Unit',
    title: 'Lab processing dashboard',
    description: 'Tracks routed lab orders, sample collection, structured result entry, abnormal flags and review handoff.'
  },
  scan: {
    eyebrow: 'Scan / Imaging Unit',
    title: 'Imaging processing dashboard',
    description: 'Manages scan queues, room/equipment booking, uploads, reports and radiologist sign-off.'
  },
  billing: {
    eyebrow: 'Billing / Finance',
    title: 'Finance control dashboard',
    description: 'Generates invoices, tracks payment status, follows outstanding balances and prepares financial reports.'
  },
  admin: {
    eyebrow: 'Administration',
    title: 'System oversight dashboard',
    description: 'Manages users, hospitals, catalog configuration, department settings, audit logs and system reports.'
  }
};

function itemType(order, catalog, type) {
  return order.itemIds.some((id) => getById(catalog, id)?.type === type);
}

function getDoctorOrders(data, auth) {
  if (!auth?.linkedDoctorId) return data.orders;
  return data.orders.filter((order) => order.doctorId === auth.linkedDoctorId);
}

function getRoleRows(role, data, auth) {
  const { orders, catalog, invoices, auditLogs, notifications, patients, hospitals, doctors, users } = data;
  if (role === 'doctor') return getDoctorOrders(data, auth).slice(0, 6);
  if (role === 'receptionist') return orders.filter((order) => ['Submitted', 'Confirmed'].includes(order.status)).slice(0, 6);
  if (role === 'lab') return orders.filter((order) => itemType(order, catalog, 'Lab')).slice(0, 6);
  if (role === 'scan') return orders.filter((order) => itemType(order, catalog, 'Scan')).slice(0, 6);
  if (role === 'billing') return invoices.slice(0, 6);
  if (role === 'admin') return auditLogs.slice(0, 6);
  return orders.slice(0, 6);
}

function getMetrics(role, data, auth) {
  const { orders, patients, catalog, invoices, hospitals, auditLogs, results, users, notifications } = data;
  const doctorOrders = getDoctorOrders(data, auth);
  const labOrders = orders.filter((order) => itemType(order, catalog, 'Lab'));
  const scanOrders = orders.filter((order) => itemType(order, catalog, 'Scan'));
  const outstanding = invoices.filter((invoice) => invoice.status !== 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = invoices.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);

  const map = {
    doctor: [
      ['Active Orders', doctorOrders.filter((order) => order.status !== 'Final / Released' && order.status !== 'Cancelled').length, ClipboardList, 'blue'],
      ['Completed Results', doctorOrders.filter((order) => order.status === 'Final / Released').length, ClipboardCheck, 'green'],
      ['Referred Patients', new Set(doctorOrders.map((order) => order.patientId)).size, UsersRound, 'purple'],
      ['Alerts', notifications.filter((note) => note.audience === 'doctor' && !note.read).length, Bell, 'yellow']
    ],
    receptionist: [
      ['Submitted Orders', orders.filter((order) => order.status === 'Submitted').length, ClipboardList, 'yellow'],
      ['Confirmed Today', orders.filter((order) => order.status === 'Confirmed').length, ClipboardCheck, 'green'],
      ['Patient Records', patients.length, UsersRound, 'blue'],
      ['Urgent Queue', orders.filter((order) => order.urgency === 'Urgent').length, Bell, 'red']
    ],
    lab: [
      ['Lab Routed', labOrders.length, FlaskConical, 'green'],
      ['In Progress', labOrders.filter((order) => order.status === 'In Progress').length, ClipboardList, 'blue'],
      ['Pending Review', results.filter((result) => result.department === 'Laboratory' && result.status === 'Pending Review').length, ShieldCheck, 'yellow'],
      ['Released', results.filter((result) => result.department === 'Laboratory' && result.status === 'Final / Released').length, ClipboardCheck, 'green']
    ],
    scan: [
      ['Scan Routed', scanOrders.length, ScanLine, 'purple'],
      ['In Progress', scanOrders.filter((order) => order.status === 'In Progress').length, ClipboardList, 'blue'],
      ['Pending Reports', results.filter((result) => result.department === 'Imaging' && result.status === 'Pending Review').length, ShieldCheck, 'yellow'],
      ['Released', results.filter((result) => result.department === 'Imaging' && result.status === 'Final / Released').length, ClipboardCheck, 'green']
    ],
    billing: [
      ['Invoices', invoices.length, CreditCard, 'blue'],
      ['Outstanding', money(outstanding), CreditCard, 'red'],
      ['Collected', money(paid), CreditCard, 'green'],
      ['Insurance Pending', invoices.filter((invoice) => invoice.status === 'Insurance Pending').length, ShieldCheck, 'yellow']
    ],
    admin: [
      ['Users', users.length, UserRound, 'blue'],
      ['Hospitals', hospitals.length, Building2, 'purple'],
      ['Orders', orders.length, ClipboardList, 'green'],
      ['Audit Events', auditLogs.length, ShieldCheck, 'yellow']
    ]
  };
  return map[role] || map.admin;
}

function getTableConfig(role, data) {
  if (role === 'billing') {
    return {
      title: 'Recent invoices',
      subtitle: 'Finance-facing invoice status snapshot.',
      columns: [
        { key: 'id', label: 'Invoice' },
        { key: 'orderId', label: 'Order' },
        { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'updatedAt', label: 'Updated', render: (row) => formatDateTime(row.updatedAt) }
      ]
    };
  }
  if (role === 'admin') {
    return {
      title: 'Recent audit events',
      subtitle: 'System oversight event feed.',
      columns: [
        { key: 'id', label: 'Audit ID' },
        { key: 'actor', label: 'Actor' },
        { key: 'role', label: 'Role', render: (row) => <StatusBadge status={row.role} /> },
        { key: 'action', label: 'Action' },
        { key: 'timestamp', label: 'Time', render: (row) => formatDateTime(row.timestamp) }
      ]
    };
  }
  return {
    title: 'Role queue snapshot',
    subtitle: 'Orders filtered for this role’s dashboard responsibilities.',
    columns: [
      { key: 'id', label: 'Order ID' },
      { key: 'patient', label: 'Patient', render: (row) => getById(data.patients, row.patientId)?.fullName || '—' },
      { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
      { key: 'billingStatus', label: 'Billing', render: (row) => <StatusBadge status={row.billingStatus} /> },
      { key: 'urgency', label: 'Urgency', render: (row) => <StatusBadge status={row.urgency} /> },
      { key: 'expectedCompletionAt', label: 'Expected', render: (row) => formatDateTime(row.expectedCompletionAt) }
    ]
  };
}

function getIdentityCard(role, data, auth) {
  if (role === 'doctor') {
    const doctor = data.doctors.find((item) => item.id === auth?.linkedDoctorId) || data.doctors[0];
    const hospital = data.hospitals.find((item) => item.id === doctor?.hospitalId);
    return [
      ['Doctor', doctor?.name],
      ['Specialty', doctor?.specialty],
      ['Hospital', hospital?.name],
      ['License', doctor?.licenseNumber],
      ['Email/SMS', `${doctor?.notificationPreferences?.email ? 'Email on' : 'Email off'} / ${doctor?.notificationPreferences?.sms ? 'SMS on' : 'SMS off'}`]
    ];
  }
  const roleInfo = ROLES.find((item) => item.id === role);
  return [
    ['Signed in as', auth?.userName || roleInfo?.demoUser],
    ['Role', roleInfo?.label],
    ['Landing page', roleInfo?.landing],
    ['Allowed pages', getNavForRole(role).length],
    ['Session started', formatDateTime(auth?.loginAt)]
  ];
}

export function RoleDashboard({ role }) {
  const { state, dispatch } = useAppStore();
  const config = roleHeaders[role] || roleHeaders.admin;
  const rows = getRoleRows(role, state.data, state.auth);
  const table = getTableConfig(role, state.data);
  const identity = getIdentityCard(role, state.data, state.auth);
  const requirements = ROLE_DASHBOARD_REQUIREMENTS[role] || [];
  const firstOrder = rows.find((row) => row.status);
  const insightItems = [
    { label: 'Visible modules', value: getNavForRole(role).length, helper: 'Role-safe navigation' },
    { label: 'Queue rows', value: rows.length, helper: 'Visible in this workspace' },
    { label: 'Audit trail', value: state.data.auditLogs.length, helper: 'Tracked system events' },
    { label: 'Notifications', value: state.data.notifications.length, helper: 'Delivery and alerts' }
  ];

  return (
    <div>
      <PageHeader eyebrow={config.eyebrow} title={config.title} description={config.description} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {getMetrics(role, state.data, state.auth).map(([label, value, Icon, tone]) => (
          <MetricCard key={label} label={label} value={value} icon={Icon} tone={tone} />
        ))}
      </div>
      <InsightStrip className="mt-3" items={insightItems} />
      {firstOrder && (
        <div className="mt-4">
          <WorkflowTimeline status={firstOrder.status} timeline={firstOrder.timeline} />
        </div>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card title="Role identity & permissions" subtitle="The session role, accessible modules and active clinical responsibilities are explicit.">
          <div className="space-y-3">
            {identity.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
                <span className="text-right text-sm font-bold text-slate-800">{value || '—'}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'orders' })}>Open Order Registry</Button>
            <Button variant="subtle" onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'overview' })}>System Overview</Button>
          </div>
        </Card>
        <Card title={table.title} subtitle={table.subtitle}>
          <DataTable columns={table.columns} rows={rows} />
        </Card>
      </div>
      <Card className="mt-6" title="Workspace capabilities for this role" subtitle="Role-specific features available in this workspace.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {requirements.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <StatusBadge status="Mapped" />
              <p className="mt-3 font-bold text-slate-900">{item}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Route, permissions and workflow are active.</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
