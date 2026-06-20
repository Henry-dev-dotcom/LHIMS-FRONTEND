import { useMemo, useState } from 'react';
import { Activity, ArrowLeft, Download, Search } from 'lucide-react';
import { Card } from './Card';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { inputClass } from './FormField';
import { formatDateTime } from '../../utils/formatters';
import { patientMatchesSearch } from '../../utils/patientUtils';

function calcAge(dateOfBirth) {
  if (!dateOfBirth) return '—';
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return '—';
  return Math.floor((Date.now() - dob.getTime()) / 31557600000);
}

function isFinalOrder(order) {
  return ['Final / Released', 'Completed'].includes(order?.status);
}

function isFinalResult(result) {
  return ['Final / Released', 'Completed'].includes(result?.status);
}

function getCatalogItem(data, itemId) {
  return (data.catalog || []).find((item) => item.id === itemId);
}

function getPatientOrders(data, patientId) {
  return (data.orders || [])
    .filter((order) => order.patientId === patientId && isFinalOrder(order))
    .sort((a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
}

function getPatientFinalResults(data, patientId) {
  const orderIds = new Set(getPatientOrders(data, patientId).map((order) => order.id));
  return (data.results || [])
    .filter((result) => orderIds.has(result.orderId) && isFinalResult(result))
    .sort((a, b) => new Date(a.approvedAt || a.updatedAt || a.createdAt) - new Date(b.approvedAt || b.updatedAt || b.createdAt));
}

function getCompletedTrendTests(data, patientId) {
  const orders = getPatientOrders(data, patientId);
  const resultOrderIds = new Set(getPatientFinalResults(data, patientId).map((result) => result.orderId));
  const map = new Map();

  orders.forEach((order) => {
    (order.itemIds || []).forEach((itemId) => {
      const item = getCatalogItem(data, itemId);
      if (!item || item.type !== 'Lab' || !(item.parameters || []).length) return;
      if (!resultOrderIds.has(order.id)) return;
      if (!map.has(item.id)) {
        map.set(item.id, {
          id: item.id,
          name: item.name,
          department: item.department || 'Laboratory',
          parameters: item.parameters || [],
          visitCount: 0,
          numericPointCount: 0
        });
      }
      map.get(item.id).visitCount += 1;
    });
  });

  getPatientFinalResults(data, patientId).forEach((result) => {
    (result.parameters || []).forEach((parameter) => {
      const item = parameter.testId ? getCatalogItem(data, parameter.testId) : null;
      if (!item || item.type !== 'Lab') return;
      if (!map.has(item.id)) {
        map.set(item.id, {
          id: item.id,
          name: item.name,
          department: item.department || 'Laboratory',
          parameters: item.parameters || [],
          visitCount: 0,
          numericPointCount: 0
        });
      }
      if (Number.isFinite(Number(parameter.value))) map.get(item.id).numericPointCount += 1;
    });
  });

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function parseRangeValue(row, key) {
  if (Number.isFinite(Number(row?.[key]))) return Number(row[key]);
  const range = String(row?.referenceRange || '');
  const values = range.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (key === 'low') return values.length >= 2 ? values[0] : null;
  if (key === 'high') return values.length >= 2 ? values[1] : (values.length === 1 ? values[0] : null);
  return null;
}

function getTrendRows(data, patientId, testId, parameterName) {
  const orders = Object.fromEntries(getPatientOrders(data, patientId).map((order) => [order.id, order]));
  const catalogItem = getCatalogItem(data, testId);
  const catalogParam = (catalogItem?.parameters || []).find((parameter) => parameter.name === parameterName) || {};

  return (data.results || [])
    .filter((result) => orders[result.orderId] && isFinalResult(result))
    .flatMap((result) => {
      const order = orders[result.orderId];
      return (result.parameters || [])
        .filter((parameter) => parameter.testId === testId && parameter.name === parameterName)
        .map((parameter, index) => ({
          id: `${result.id}-${parameter.name}-${index}`,
          orderId: result.orderId,
          resultId: result.id,
          testId,
          testName: catalogItem?.name || parameter.testName || testId,
          parameter: parameter.name,
          value: parameter.value,
          unit: parameter.unit || catalogParam.unit || '',
          referenceRange: parameter.referenceRange || catalogParam.referenceRange || '',
          low: parameter.low ?? catalogParam.low ?? '',
          high: parameter.high ?? catalogParam.high ?? '',
          criticalLow: parameter.criticalLow ?? catalogParam.criticalLow ?? '',
          criticalHigh: parameter.criticalHigh ?? catalogParam.criticalHigh ?? '',
          flag: parameter.flag || 'Normal',
          department: result.department,
          approvedAt: result.approvedAt || result.updatedAt || result.createdAt || order.updatedAt || order.createdAt,
          createdAt: result.createdAt || order.createdAt,
          urgency: order.urgency || 'Routine'
        }));
    })
    .filter((row) => row.value !== '' && row.value !== null && row.value !== undefined)
    .sort((a, b) => new Date(a.approvedAt || a.createdAt) - new Date(b.approvedAt || b.createdAt));
}

function PatientProgressChart({ rows }) {
  const numericRows = rows
    .filter((row) => Number.isFinite(Number(row.value)))
    .sort((a, b) => new Date(a.approvedAt || a.createdAt) - new Date(b.approvedAt || b.createdAt));

  if (numericRows.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
        This parameter needs at least two finalized numeric results before a progress line can be generated.
      </div>
    );
  }

  const values = numericRows.map((row) => Number(row.value));
  const low = numericRows.map((row) => parseRangeValue(row, 'low')).find((value) => Number.isFinite(value));
  const high = numericRows.map((row) => parseRangeValue(row, 'high')).find((value) => Number.isFinite(value));
  const yValues = [...values, ...(Number.isFinite(low) ? [low] : []), ...(Number.isFinite(high) ? [high] : [])];
  const rawMin = Math.min(...yValues);
  const rawMax = Math.max(...yValues);
  const padding = Math.max((rawMax - rawMin) * 0.2, Math.abs(rawMax || 1) * 0.05, 1);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const span = max - min || 1;
  const left = 11;
  const right = 96;
  const top = 8;
  const bottom = 80;
  const width = right - left;
  const height = bottom - top;
  const yFor = (value) => bottom - ((value - min) / span) * height;
  const xFor = (index) => left + (index / Math.max(numericRows.length - 1, 1)) * width;
  const points = numericRows.map((row, index) => `${xFor(index)},${yFor(Number(row.value))}`).join(' ');
  const latest = numericRows[numericRows.length - 1];
  const first = numericRows[0];
  const change = Number(latest.value) - Number(first.value);
  const unit = latest.unit || '';

  return (
    <div className="rounded-3xl border border-clinical-100 bg-gradient-to-br from-clinical-50 to-white p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-clinical-700">Patient progress line chart</p>
          <p className="mt-1 text-sm text-slate-500">Values are plotted in visit/release order using finalized historical results.</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Change</p>
          <p className={`font-black ${change > 0 ? 'text-amber-700' : change < 0 ? 'text-clinical-700' : 'text-slate-900'}`}>{change > 0 ? '+' : ''}{change.toFixed(2)} {unit}</p>
        </div>
      </div>

      <svg viewBox="0 0 108 100" className="h-72 w-full overflow-visible" role="img" aria-label="Patient test progress line chart">
        {[0, 1, 2, 3].map((tick) => {
          const y = top + (tick / 3) * height;
          const value = max - (tick / 3) * span;
          return (
            <g key={tick}>
              <line x1={left} x2={right} y1={y} y2={y} className="stroke-slate-200" strokeWidth="0.5" />
              <text x="2" y={y + 1.5} className="fill-slate-400 text-[3px] font-bold">{value.toFixed(1)}</text>
            </g>
          );
        })}
        {Number.isFinite(low) && (
          <g>
            <line x1={left} x2={right} y1={yFor(low)} y2={yFor(low)} className="stroke-emerald-500" strokeDasharray="2 2" strokeWidth="0.8" />
            <text x={right + 1} y={yFor(low) + 1.2} className="fill-emerald-700 text-[3px] font-black">Low</text>
          </g>
        )}
        {Number.isFinite(high) && (
          <g>
            <line x1={left} x2={right} y1={yFor(high)} y2={yFor(high)} className="stroke-rose-500" strokeDasharray="2 2" strokeWidth="0.8" />
            <text x={right + 1} y={yFor(high) + 1.2} className="fill-rose-700 text-[3px] font-black">High</text>
          </g>
        )}
        <polyline fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" points={points} className="text-clinical-600" />
        {numericRows.map((row, index) => {
          const value = Number(row.value);
          const x = xFor(index);
          const y = yFor(value);
          const abnormal = ['High', 'Low', 'Critical'].includes(row.flag);
          return (
            <g key={row.id || `${row.orderId}-${index}`}>
              <circle cx={x} cy={y} r="2.5" className={abnormal ? 'fill-rose-600' : 'fill-clinical-700'} />
              <text x={x} y={y - 4} textAnchor="middle" className="fill-slate-700 text-[3.2px] font-black">{value}</text>
              <text x={x} y="94" textAnchor="middle" className="fill-slate-500 text-[2.8px] font-bold">{new Date(row.approvedAt || row.createdAt).toLocaleDateString('en-GB', { month: 'short', day: '2-digit' })}</text>
            </g>
          );
        })}
        <line x1={left} x2={right} y1={bottom} y2={bottom} className="stroke-slate-300" strokeWidth="0.8" />
        <line x1={left} x2={left} y1={top} y2={bottom} className="stroke-slate-300" strokeWidth="0.8" />
      </svg>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-3"><p className="text-xs font-black uppercase tracking-wider text-slate-400">First Value</p><p className="mt-1 font-black text-slate-950">{first.value} {unit}</p><p className="text-xs text-slate-500">{formatDateTime(first.approvedAt || first.createdAt)}</p></div>
        <div className="rounded-2xl bg-white p-3"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Latest Value</p><p className="mt-1 font-black text-slate-950">{latest.value} {unit}</p><p className="text-xs text-slate-500">{formatDateTime(latest.approvedAt || latest.createdAt)}</p></div>
        <div className="rounded-2xl bg-white p-3"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Reference Range</p><p className="mt-1 font-black text-slate-950">{latest.referenceRange || '—'}</p><p className="text-xs text-slate-500">Dashed guide lines show low/high range when available.</p></div>
      </div>
    </div>
  );
}

export function PatientTrendsPanel({ data, allowedPatientIds = null, title = 'Patient Trends', subtitle = 'Search a patient, select a test, then select a parameter to view the trend.' }) {
  const [query, setQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedParameterName, setSelectedParameterName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const allowedSet = allowedPatientIds ? new Set(allowedPatientIds) : null;
  const patients = useMemo(() => (data.patients || []).filter((patient) => !allowedSet || allowedSet.has(patient.id)), [data.patients, allowedSet]);
  const matches = query.trim().length >= 2 ? patients.filter((patient) => patientMatchesSearch(patient, query)).slice(0, 8) : [];
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) || null;
  const completedTests = selectedPatient ? getCompletedTrendTests(data, selectedPatient.id) : [];
  const selectedTest = completedTests.find((test) => test.id === selectedTestId) || null;
  const selectedParameter = selectedTest?.parameters?.find((parameter) => parameter.name === selectedParameterName) || null;
  const rawTrendRows = selectedPatient && selectedTest && selectedParameter ? getTrendRows(data, selectedPatient.id, selectedTest.id, selectedParameter.name) : [];
  const trendRows = rawTrendRows.filter((row) => {
    const date = new Date(row.approvedAt || row.createdAt);
    if (fromDate && date < new Date(`${fromDate}T00:00:00`)) return false;
    if (toDate && date > new Date(`${toDate}T23:59:59`)) return false;
    return true;
  });

  function selectPatient(patientId) {
    const patient = patients.find((item) => item.id === patientId);
    setSelectedPatientId(patientId);
    setSelectedTestId('');
    setSelectedParameterName('');
    setFromDate('');
    setToDate('');
    if (patient) setQuery(patient.fullName || patient.id);
  }

  function resetPatientSearch() {
    setSelectedPatientId('');
    setSelectedTestId('');
    setSelectedParameterName('');
    setFromDate('');
    setToDate('');
    setQuery('');
  }

  function backStep() {
    if (selectedParameterName) return setSelectedParameterName('');
    if (selectedTestId) return setSelectedTestId('');
    return resetPatientSearch();
  }

  function exportTrendCsv() {
    if (!trendRows.length) return;
    const headers = ['Date', 'Patient', 'Test', 'Parameter', 'Value', 'Unit', 'Reference Range', 'Flag', 'Order ID'];
    const lines = trendRows.map((row) => [
      formatDateTime(row.approvedAt || row.createdAt),
      selectedPatient?.fullName || '',
      row.testName || selectedTest?.name || '',
      row.parameter || selectedParameter?.name || '',
      row.value,
      row.unit || '',
      row.referenceRange || '',
      row.flag || '',
      row.orderId || ''
    ].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPatient?.id || 'patient'}-${selectedTest?.id || 'test'}-${selectedParameter?.name || 'parameter'}-trend.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card title={title} subtitle={subtitle} actions={<Activity className="h-5 w-5 text-clinical-600" />}>
      <div className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                className={`${inputClass} pl-9`}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedPatientId('');
                  setSelectedTestId('');
                  setSelectedParameterName('');
                }}
                placeholder="Search patient name or ID..."
              />
            </div>
            {!selectedPatient && query.trim().length < 2 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Type at least 2 characters to search for a patient.</p>
            )}
            {!selectedPatient && query.trim().length >= 2 && (
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                {matches.map((patient) => (
                  <button key={patient.id} type="button" onClick={() => selectPatient(patient.id)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-clinical-50">
                    <span><span className="block font-black text-slate-950">{patient.fullName}</span><span className="text-xs text-slate-500">{patient.id} · {patient.phone || 'No phone'}</span></span>
                    <span className="text-xs font-black uppercase tracking-wider text-clinical-700">Select</span>
                  </button>
                ))}
                {matches.length === 0 && <p className="p-4 text-sm font-semibold text-slate-500">No patients found.</p>}
              </div>
            )}

            {selectedPatient && (
              <div className="rounded-2xl border border-clinical-100 bg-clinical-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-clinical-700">Selected patient</p>
                <p className="mt-1 font-black text-slate-950">{selectedPatient.fullName}</p>
                <p className="text-sm text-slate-600">ID: {selectedPatient.id} · Age: {calcAge(selectedPatient.dateOfBirth)} · Gender: {selectedPatient.gender || '—'}</p>
                <button type="button" onClick={resetPatientSearch} className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-clinical-700">Change patient</button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Trend navigation</p>
                <p className="mt-1 font-black text-slate-950">
                  {!selectedPatient ? 'Search and select a patient' : !selectedTest ? 'Select a test' : !selectedParameter ? `${selectedTest.name} — Select parameter` : `${selectedTest.name} · ${selectedParameter.name}`}
                </p>
              </div>
              {(selectedPatient || selectedTest || selectedParameter) && <Button variant="secondary" onClick={backStep}><ArrowLeft className="h-4 w-4" /> Back</Button>}
            </div>

            {selectedPatient && !selectedTest && (
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Select a completed lab test</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {completedTests.map((test) => (
                    <button key={test.id} onClick={() => { setSelectedTestId(test.id); setSelectedParameterName(''); }} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-clinical-300 hover:bg-clinical-50">
                      <p className="font-black text-slate-950">{test.name}</p>
                      <p className="text-xs text-slate-500">{test.department} · {test.visitCount} completed visit(s)</p>
                    </button>
                  ))}
                  {completedTests.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 md:col-span-2">No completed lab tests with numerical/reference-range data found for this patient.</p>}
                </div>
              </div>
            )}

            {selectedPatient && selectedTest && !selectedParameter && (
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Select a parameter</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(selectedTest.parameters || []).map((parameter) => (
                    <button key={parameter.name} onClick={() => setSelectedParameterName(parameter.name)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-clinical-300 hover:bg-clinical-50">
                      <p className="font-black text-slate-950">{parameter.name}</p>
                      <p className="text-xs text-slate-500">{parameter.unit || 'No Unit'} · Ref: {parameter.referenceRange || '—'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedPatient && selectedTest && selectedParameter && (
              <>
                <div className="rounded-2xl border border-clinical-100 bg-clinical-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-clinical-700">Viewing progress</p>
                      <p className="font-black text-slate-950">{selectedTest.name} · {selectedParameter.name}</p>
                      <p className="mt-1 text-sm text-slate-600">Line chart uses finalized values from previous visits for this exact test parameter.</p>
                    </div>
                    <Button variant="secondary" onClick={exportTrendCsv} disabled={!trendRows.length}><Download className="h-4 w-4" /> Export CSV</Button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">From date<input className={`${inputClass} mt-1`} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">To date<input className={`${inputClass} mt-1`} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
                  </div>
                </div>
                <PatientProgressChart rows={trendRows} />
              </>
            )}
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'approvedAt', label: 'Date', render: (row) => formatDateTime(row.approvedAt || row.createdAt) },
            { key: 'testName', label: 'Test' },
            { key: 'parameter', label: 'Parameter' },
            { key: 'value', label: 'Value', render: (row) => <span className="font-black text-slate-950">{row.value} {row.unit}</span> },
            { key: 'referenceRange', label: 'Range' },
            { key: 'flag', label: 'Flag', render: (row) => <StatusBadge status={row.flag} /> }
          ]}
          rows={trendRows}
          emptyMessage="Select a patient, test and parameter to view historical trend values."
        />
      </div>
    </Card>
  );
}
