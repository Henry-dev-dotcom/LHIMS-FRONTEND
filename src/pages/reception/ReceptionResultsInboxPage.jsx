import { useMemo, useState } from 'react';
import { Download, FileText, Mail, MessageSquare, Search, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { inputClass } from '../../components/ui/FormField';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime } from '../../utils/formatters';
import { openReportPrintWindow } from '../../utils/reporting';
import { getOrderViewModel } from '../../workflow/workflowEngine';

function getReportForOrder(data, orderId) {
  return (data.resultReports || []).find((report) => report.orderId === orderId && report.status !== 'Voided');
}

function resultHasAbnormal(order) {
  return (order.results || []).some((result) => (result.parameters || []).some((parameter) => !['Normal', 'No Range', '', undefined].includes(parameter.flag)));
}

export function ReceptionResultsInboxPage() {
  const { state, dispatch } = useAppStore();
  const data = state.data;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');

  const releasedOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data.orders || [])
      .filter((order) => order.status === 'Final / Released')
      .map((order) => getOrderViewModel(order, data))
      .filter((order) => !filter || (filter === 'Abnormal' ? resultHasAbnormal(order) : order.routedDepartments?.includes(filter)))
      .filter((order) => !q || [order.id, order.patient?.fullName, order.patient?.phone, order.patient?.id, order.doctor?.name, order.hospital?.name, order.items?.map((item) => item.name).join(' ')].filter(Boolean).join(' ').toLowerCase().includes(q))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [data, query, filter]);

  const labResults = releasedOrders.filter((order) => order.routedDepartments?.includes('Laboratory')).length;
  const scanResults = releasedOrders.filter((order) => order.routedDepartments?.includes('Imaging')).length;
  const abnormal = releasedOrders.filter(resultHasAbnormal).length;

  function printReport(order) {
    const report = getReportForOrder(data, order.id);
    if (report) dispatch({ type: 'MARK_REPORT_DOWNLOADED', reportId: report.id });
    openReportPrintWindow({ ...order, resultReport: report });
  }

  function send(order, channel) {
    dispatch({ type: 'SEND_RESULT_TO_PATIENT', payload: { orderId: order.id, channel } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Phase 7 — Reception Workflow"
        title="Reception Results Inbox"
        description="Front desk can view released results, print reports, and prepare privacy-safe email or WhatsApp notices for patients."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Released Results" value={releasedOrders.length} icon={ShieldCheck} tone="green" />
        <MetricCard label="Lab Reports" value={labResults} icon={FileText} tone="blue" />
        <MetricCard label="Scan Reports" value={scanResults} icon={FileText} tone="purple" />
        <MetricCard label="Abnormal Flags" value={abnormal} icon={Search} tone="yellow" />
      </div>

      <Card
        title="Released results for reception"
        subtitle="Patient-facing messages are privacy-safe by default and do not include clinical values."
        actions={<div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px]"><input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, order, doctor, test..." /><select className={inputClass} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All results</option><option value="Laboratory">Laboratory</option><option value="Imaging">Imaging</option><option value="Abnormal">Abnormal only</option></select></div>}
      >
        <DataTable
          columns={[
            { key: 'id', label: 'Order', render: (order) => <span className="font-black text-slate-950">{order.id}</span> },
            { key: 'patient', label: 'Patient', render: (order) => <div><p className="font-bold text-slate-950">{order.patient?.fullName}</p><p className="text-xs text-slate-500">{order.patient?.id} · {order.patient?.phone || 'No phone'}</p></div> },
            { key: 'doctor', label: 'Doctor / Hospital', render: (order) => <div><p className="font-bold">{order.doctor?.name}</p><p className="text-xs text-slate-500">{order.hospital?.name}</p></div> },
            { key: 'items', label: 'Investigations', render: (order) => <div className="flex max-w-[320px] flex-wrap gap-1.5">{(order.items || []).map((item) => <span key={item.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item.name}</span>)}</div> },
            { key: 'flag', label: 'Flag', render: (order) => <StatusBadge status={resultHasAbnormal(order) ? 'Abnormal' : 'Normal'} /> },
            { key: 'report', label: 'Report', render: (order) => getReportForOrder(data, order.id)?.id || 'PDF-ready' },
            { key: 'updatedAt', label: 'Released', render: (order) => formatDateTime(order.updatedAt) },
            { key: 'actions', label: 'Actions', render: (order) => <div className="flex flex-wrap gap-2"><Button onClick={() => printReport(order)}><Download className="h-4 w-4" /> Print</Button><Button variant="secondary" onClick={() => send(order, 'Email')}><Mail className="h-4 w-4" /> Email</Button><Button variant="secondary" onClick={() => send(order, 'WhatsApp')}><MessageSquare className="h-4 w-4" /> WhatsApp</Button></div> }
          ]}
          rows={releasedOrders}
          emptyMessage="No released result reports match this filter."
        />
      </Card>
    </div>
  );
}
