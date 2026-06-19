import { ClipboardList, CreditCard, FlaskConical, ScanLine, UsersRound } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { InsightStrip } from '../../components/ui/InsightStrip';
import { WorkflowTimeline } from '../../components/ui/WorkflowTimeline';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime, getById, money } from '../../utils/formatters';
import { canViewPrices } from '../../utils/priceVisibility';

export function OverviewPage() {
  const { state } = useAppStore();
  const { patients, orders, catalog, invoices, results, auditLogs, notifications } = state.data;
  const canSeeFinance = canViewPrices(state.auth?.role);
  const labOrders = orders.filter((order) => order.itemIds.some((id) => getById(catalog, id)?.type === 'Lab')).length;
  const scanOrders = orders.filter((order) => order.itemIds.some((id) => getById(catalog, id)?.type === 'Scan')).length;
  const outstanding = invoices.filter((invoice) => invoice.status !== 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const latestOrder = orders[0];
  const insightItems = [
    { label: 'Finalized results', value: results.filter((result) => result.status === 'Final / Released').length, helper: 'Released to doctors' },
    { label: 'Audit events', value: auditLogs.length, helper: 'Traceability coverage' },
    { label: 'Delivery events', value: notifications.length, helper: 'In-platform / email / SMS' },
    { label: 'Open invoices', value: invoices.filter((invoice) => invoice.status !== 'Paid').length, helper: 'Billing follow-up' }
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Section 14 — UI/UX Polish"
        title="Diagnosis Center command workspace"
        description="A polished healthcare operations interface for role-based ordering, reception routing, laboratory and imaging work, billing, reporting, delivery, security and audit monitoring."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Patients" value={patients.length} icon={UsersRound} tone="blue" />
        <MetricCard label="Orders" value={orders.length} icon={ClipboardList} tone="purple" />
        <MetricCard label="Lab routed" value={labOrders} icon={FlaskConical} tone="green" />
        <MetricCard label="Scan routed" value={scanOrders} icon={ScanLine} tone="yellow" />
        {canSeeFinance ? <MetricCard label="Outstanding" value={money(outstanding)} icon={CreditCard} tone="red" /> : <MetricCard label="Open invoices" value={invoices.filter((invoice) => invoice.status !== 'Paid').length} icon={CreditCard} tone="red" />}
      </div>
      <InsightStrip className="mt-5" items={insightItems} />
      {latestOrder && (
        <div className="mt-6">
          <WorkflowTimeline status={latestOrder.status} timeline={latestOrder.timeline} />
        </div>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card title="Recent order registry" subtitle="Seeded order data used to validate routing, role dashboards, and shared table components.">
          <DataTable
            columns={[
              { key: 'id', label: 'Order ID' },
              { key: 'patient', label: 'Patient', render: (row) => getById(patients, row.patientId)?.fullName || '—' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'billingStatus', label: 'Billing', render: (row) => <StatusBadge status={row.billingStatus} /> },
              { key: 'createdAt', label: 'Submitted', render: (row) => formatDateTime(row.createdAt) }
            ]}
            rows={orders}
          />
        </Card>
        <Card title="Platform polish status" subtitle="Section 14 visual and usability checklist.">
          <div className="space-y-3 text-sm">
            {[
              'Consistent polished app shell',
              'Six role-based workspaces',
              'Refined dashboard metric cards',
              'Responsive permission-aware navigation',
              'Accessible protected-route feedback',
              'LocalStorage demo persistence',
              'Mobile tables become readable cards',
              'Print-ready report and dashboard styling'
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-semibold text-slate-700">{item}</span>
                <StatusBadge status="Ready" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
