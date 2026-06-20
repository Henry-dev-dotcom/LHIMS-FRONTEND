import { useMemo, useState } from 'react';
import { ClipboardCheck, Edit3, Printer, Search, Send, Save } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { FormField, inputClass } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store/AppStore';
import { getLabCatalogItems, getLabOrders } from '../../utils/orderViews';
import { formatDateTime } from '../../utils/formatters';
import { computeResultFlag } from '../../utils/labFlags';

function getResultForTest(data, orderId, testId) {
  const result = (data.results || []).find((item) => item.orderId === orderId && item.department === 'Laboratory');
  const parameters = (result?.parameters || []).filter((parameter) => parameter.testId === testId);
  const complete = parameters.length > 0 && parameters.every((parameter) => parameter.value !== '');
  const partial = parameters.some((parameter) => parameter.value !== '') && !complete;
  return { result, parameters, complete, partial, status: result?.status || 'Pending' };
}

function getTestStatus(data, orderId, testId) {
  const info = getResultForTest(data, orderId, testId);
  if (!info.parameters.length) return 'Pending';
  if (info.status === 'Final / Released') return 'Final / Released';
  if (info.status === 'Pending Review') return info.complete ? 'Pending Review' : 'Partial';
  if (info.status === 'Draft') return 'Draft';
  return info.complete ? 'Completed' : 'Draft';
}

function statusMatchesFilter(status, filter) {
  if (!filter) return true;
  if (filter === 'Pending') return status === 'Pending';
  if (filter === 'Draft') return status === 'Draft' || status === 'Partial' || status === 'In Progress';
  if (filter === 'Pending Review') return status === 'Pending Review';
  if (filter === 'Completed') return status === 'Final / Released' || status === 'Completed';
  return true;
}

function openSampleLabel(sample, order) {
  const win = window.open('', '_blank', 'width=420,height=520');
  if (!win) return;
  win.document.write(`
    <html><head><title>Sample Label ${sample.id}</title></head>
    <body style="font-family:Arial,sans-serif;padding:24px;">
      <div style="border:2px solid #111;padding:18px;width:320px;">
        <h2 style="margin:0 0 8px;">DIAGNOSIS CENTER LAB</h2>
        <div style="font-family:monospace;font-size:22px;font-weight:800;letter-spacing:2px;">${sample.id}</div>
        <p><strong>Patient:</strong> ${order?.patient?.fullName || ''}</p>
        <p><strong>Patient ID:</strong> ${order?.patient?.id || ''}</p>
        <p><strong>Order:</strong> ${sample.orderId}</p>
        <p><strong>Sample:</strong> ${sample.sampleType || '—'}</p>
        <p><strong>Accepted:</strong> ${formatDateTime(sample.acceptedAt || sample.collectedAt)}</p>
        <div style="margin-top:18px;border:1px dashed #111;padding:12px;text-align:center;font-family:monospace;">||||| ${sample.id} |||||</div>
      </div>
      <script>window.print();<\/script>
    </body></html>
  `);
  win.document.close();
}

function ResultEntryModal({ open, onClose, order, sample, testItem, data, dispatch }) {
  const existing = testItem ? getResultForTest(data, order?.id, testItem.id).parameters : [];
  const [values, setValues] = useState(() => Object.fromEntries((testItem?.parameters || []).map((parameter) => [`${testItem.id}::${parameter.name}`, existing.find((entry) => entry.name === parameter.name)?.value || ''])));
  const [equipment, setEquipment] = useState('Sysmex XN-550');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [reportText, setReportText] = useState('');
  if (!testItem || !order) return null;
  const save = (mode) => {
    dispatch({ type: 'ENTER_TEST_RESULT', payload: { orderId: order.id, testId: testItem.id, values, equipment, technicianNotes, reportText, mode } });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={`Enter results · ${testItem.name}`} description="Save drafts while working, then submit completed values for senior review/sign-off.">
      <div className="space-y-4">
        <div className="rounded-2xl border border-clinical-100 bg-clinical-50/60 p-3 text-xs font-semibold leading-5 text-clinical-800">
          Sample {sample?.id || '—'} · Reference ranges and live flags are shown beside every parameter.
        </div>
        {(testItem.parameters || []).length === 0 ? (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">No editable reference-range parameters are defined for this test. Ask Admin to add parameters under Settings before final reporting.</div>
        ) : (testItem.parameters || []).map((parameter) => {
          const key = `${testItem.id}::${parameter.name}`;
          const value = values[key] || '';
          const flag = value === '' ? 'Pending' : computeResultFlag(value, parameter.low, parameter.high, parameter.criticalLow, parameter.criticalHigh);
          const flagClass = flag === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : flag === 'High' || flag === 'Low' ? 'bg-amber-50 text-amber-700 border-amber-200' : flag === 'Critical' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-500 border-slate-200';
          return (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid gap-3 md:grid-cols-[1.15fr_1fr_120px_140px] md:items-center">
                <div>
                  <p className="font-black text-slate-950">{parameter.name}</p>
                  <p className="text-xs font-semibold text-slate-500">Unit: {parameter.unit || '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Reference Range</p>
                  <p className="mt-1 text-sm font-black text-slate-800">{parameter.referenceRange || 'No displayed range'}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    Low: {parameter.low ?? '—'} · High: {parameter.high ?? '—'}
                    {parameter.criticalLow !== undefined && parameter.criticalLow !== '' ? ` · Critical low: ${parameter.criticalLow}` : ''}
                    {parameter.criticalHigh !== undefined && parameter.criticalHigh !== '' ? ` · Critical high: ${parameter.criticalHigh}` : ''}
                  </p>
                </div>
                <input className={inputClass} value={value} onChange={(event) => setValues({ ...values, [key]: event.target.value })} placeholder="Value" />
                <div className={`rounded-full border px-3 py-2 text-center text-xs font-black ${flagClass}`}>{flag}</div>
              </div>
            </div>
          );
        })}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Analyzer / Equipment"><select className={inputClass} value={equipment} onChange={(event) => setEquipment(event.target.value)}>{(data.labAnalyzers || []).map((item) => <option key={item}>{item}</option>)}</select></FormField>
          <FormField label="Report Comment"><input className={inputClass} value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="Optional report comment" /></FormField>
        </div>
        <FormField label="Internal Technician Notes"><textarea className={`${inputClass} min-h-24`} value={technicianNotes} onChange={(event) => setTechnicianNotes(event.target.value)} placeholder="Internal review notes, not visible on patient report." /></FormField>
        <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="secondary" onClick={() => save('draft')}><Save className="h-4 w-4" /> Save Draft</Button><Button onClick={() => save('review')}><Send className="h-4 w-4" /> Submit for Review</Button></div>
      </div>
    </Modal>
  );
}

export function AcceptedSamplesPage() {
  const { state, dispatch } = useAppStore();
  const data = state.data;
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeOrderId, setActiveOrderId] = useState(state.ui.activeAcceptedSampleOrderId || '');
  const [entryTestId, setEntryTestId] = useState('');
  const labOrders = useMemo(() => getLabOrders(data), [data]);
  const accepted = (data.sampleLogs || []).filter((sample) => sample.status === 'Accepted').map((sample) => {
    const order = labOrders.find((item) => item.id === sample.orderId);
    return { ...sample, order, patient: order?.patient, doctor: order?.doctor, hospital: order?.hospital };
  }).filter((row) => row.order);
  const rows = accepted.filter((row) => {
    const q = query.trim().toLowerCase();
    const rowTests = getLabCatalogItems(row.order, data.catalog || []);
    const testStatuses = rowTests.map((test) => getTestStatus(data, row.orderId, test.id));
    const matchesStatus = !statusFilter || testStatuses.some((item) => statusMatchesFilter(item, statusFilter));
    const matchesQuery = !q || [row.id, row.orderId, row.patient?.fullName, row.patient?.id, row.doctor?.name, rowTests.map((test) => test.name).join(' ')].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });
  const activeOrder = labOrders.find((order) => order.id === activeOrderId) || rows[0]?.order;
  const activeSample = accepted.find((sample) => sample.orderId === activeOrder?.id);
  const activeTests = activeOrder ? getLabCatalogItems(activeOrder, data.catalog || []) : [];
  const entryTest = activeTests.find((test) => test.id === entryTestId);
  const draftCount = activeTests.filter((test) => getTestStatus(data, activeOrder?.id, test.id) === 'Draft').length;
  const pendingReviewCount = activeTests.filter((test) => getTestStatus(data, activeOrder?.id, test.id) === 'Pending Review').length;
  const completedCount = activeTests.filter((test) => ['Final / Released', 'Completed'].includes(getTestStatus(data, activeOrder?.id, test.id))).length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Laboratory · Accepted Samples" title="Accepted Samples" description="Search accepted samples, open the patient sample window, save result drafts, and submit completed tests to the review/sign-off queue." />
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Accepted" subtitle={String(accepted.length)} />
        <Card title="Drafts" subtitle={String(draftCount)} />
        <Card title="Pending review" subtitle={String(pendingReviewCount)} />
        <Card title="Released" subtitle={String(completedCount)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card title="Accepted sample search" subtitle="Search by patient, sample ID, order ID, doctor, or lab test.">
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accepted patients..." />
            </div>
            <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All result states</option><option>Pending</option><option>Draft</option><option>Pending Review</option><option>Completed</option></select>
          </div>
          <DataTable
            columns={[
              { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-black text-slate-950">{row.patient?.fullName}</p><p className="text-xs text-slate-400">{row.patient?.id}</p></div> },
              { key: 'id', label: 'Sample ID', render: (row) => <span className="font-black text-slate-950">{row.id}</span> },
              { key: 'orderId', label: 'Order' },
              { key: 'status', label: 'Status', render: () => <StatusBadge status="Accepted" /> },
              { key: 'actions', label: 'Action', render: (row) => <Button onClick={() => { setActiveOrderId(row.orderId); dispatch({ type: 'OPEN_ACCEPTED_SAMPLE', orderId: row.orderId }); }}><ClipboardCheck className="h-4 w-4" /> Open</Button> }
            ]}
            rows={rows}
            emptyMessage="No accepted samples match your search."
          />
        </Card>
        <Card title="Patient sample window" subtitle="Each requested test has its own draft/result entry action.">
          {!activeOrder ? <p className="text-sm text-slate-500">Select an accepted sample to begin.</p> : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Patient</p><p className="font-black text-slate-950">{activeOrder.patient?.fullName}</p><p className="text-sm text-slate-500">{activeOrder.patient?.id} · {activeOrder.patient?.phone}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Order / Sample</p><p className="font-black text-slate-950">{activeOrder.id}</p><p className="text-sm text-slate-500">{activeSample?.id || '—'} · {formatDateTime(activeOrder.createdAt)}</p></div>
              </div>
              {activeSample && <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => { openSampleLabel(activeSample, activeOrder); dispatch({ type: 'PRINT_SAMPLE_LABEL', sampleId: activeSample.id }); }}><Printer className="h-4 w-4" /> Print Sample Label</Button><Button variant="secondary" onClick={() => dispatch({ type: 'NAVIGATE', pageId: 'lab-review' })}>Open Review Queue</Button></div>}
              <div className="space-y-3">
                {activeTests.map((test) => {
                  const resultInfo = getResultForTest(data, activeOrder.id, test.id);
                  const status = getTestStatus(data, activeOrder.id, test.id);
                  return (
                    <div key={test.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div><p className="font-black text-slate-950">{test.name}</p><p className="text-sm text-slate-500">{test.id} · {test.parameters?.length || 0} parameter(s)</p></div>
                        <div className="flex flex-wrap items-center gap-2"><StatusBadge status={status} /><Button disabled={status === 'Final / Released'} onClick={() => setEntryTestId(test.id)}><Edit3 className="h-4 w-4" /> {resultInfo.parameters.length ? 'Edit / View Entry' : 'Enter Results'}</Button></div>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {(test.parameters || []).slice(0, 4).map((parameter) => <div key={parameter.name} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"><span className="font-black text-slate-800">{parameter.name}</span> · {parameter.referenceRange || 'No range'} {parameter.unit ? `· ${parameter.unit}` : ''}</div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
      <ResultEntryModal open={Boolean(entryTestId)} onClose={() => setEntryTestId('')} order={activeOrder} sample={activeSample} testItem={entryTest} data={data} dispatch={dispatch} />
    </div>
  );
}
