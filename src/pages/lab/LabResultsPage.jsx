import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Edit3, Eye, FileDown, FileText, GitCompareArrows, History, LockKeyhole, Printer, QrCode, Save, Search, ShieldCheck, Signature, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FormField, inputClass } from '../../components/ui/FormField';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime } from '../../utils/formatters';
import { computeResultFlag } from '../../utils/labFlags';
import { getPatientPortalUrl, getQrCodeUrl, getReportVerificationUrl, openLabResultPdfWindow, openReportPrintWindow } from '../../utils/reporting';


function formatFileSize(size = 0) {
  const value = Number(size || 0);
  if (!value) return '0 KB';
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function openResultAttachment(file) {
  if (!file?.dataUrl && !file?.url) return;
  const win = window.open(file.dataUrl || file.url, '_blank', 'noopener,noreferrer');
  if (!win) {
    const link = document.createElement('a');
    link.href = file.dataUrl || file.url;
    link.download = file.name || file.fileName || 'lab-result-document';
    link.click();
  }
}

function ResultAttachments({ files = [] }) {
  if (!files.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Imported Result Documents</p>
          <p className="text-sm font-semibold text-slate-600">PDF, Word, text, or scanned result files attached during lab result entry.</p>
        </div>
        <span className="rounded-full bg-clinical-50 px-3 py-1 text-xs font-black text-clinical-700">{files.length}</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {files.map((file) => (
          <div key={file.id || file.name} className="rounded-2xl bg-slate-50 p-3">
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-1 h-5 w-5 shrink-0 text-clinical-700" />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-black text-slate-950">{file.name || file.fileName || 'Imported result document'}</p>
                <p className="text-xs font-semibold text-slate-500">{file.testName || 'Lab result'} · {formatFileSize(file.size || file.fileSize)} · {file.dataUrl || file.url ? 'openable' : 'metadata only'}</p>
                {file.uploadedAt && <p className="mt-1 text-[11px] font-semibold text-slate-400">Imported {formatDateTime(file.uploadedAt)}</p>}
              </div>
              {(file.dataUrl || file.url) && <Button size="sm" variant="secondary" onClick={() => openResultAttachment(file)}>Open</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getResultContext(data, result) {
  const order = (data.orders || []).find((item) => item.id === result?.orderId);
  const patient = (data.patients || []).find((item) => item.id === order?.patientId);
  const doctor = (data.doctors || []).find((item) => item.id === order?.doctorId);
  const hospital = (data.hospitals || []).find((item) => item.id === order?.hospitalId);
  const items = (order?.itemIds || []).map((itemId) => (data.catalog || []).find((item) => item.id === itemId)).filter(Boolean);
  return { order, patient, doctor, hospital, items };
}

function uniqueTests(parameters = []) {
  return [...new Set(parameters.map((parameter) => parameter.testName || parameter.testId).filter(Boolean))];
}

function flagTone(flag) {
  if (flag === 'Normal') return 'Normal';
  if (flag === 'Pending') return 'Pending';
  if (flag === 'No Range') return 'No Range';
  return flag || 'No Range';
}

function printLabResult(data, result) {
  const { order, patient, doctor, hospital, items } = getResultContext(data, result);
  if (!order) return;
  openReportPrintWindow({
    order: { ...order, patient, doctor, hospital, items, results: [result] },
    patient,
    doctor,
    hospital,
    items,
    results: [result]
  });
}

function snapshotFromResult(result = {}) {
  return {
    status: result.status || '',
    parameters: result.parameters || [],
    reportText: result.reportText || '',
    internalNotes: result.internalNotes || ''
  };
}

function getVersionEntries(result) {
  if (!result) return [];
  const changes = [...(result.versionHistory || result.amendments || [])].sort((a, b) => new Date(a.changedAt || 0) - new Date(b.changedAt || 0));
  if (!changes.length) {
    return [{
      id: `${result.id}-v1`,
      version: 1,
      label: 'v1',
      changedAt: result.createdAt || result.updatedAt,
      changedBy: result.approvedBy || 'Lab Staff',
      reason: 'Initial result entry',
      snapshot: snapshotFromResult(result),
      reportHash: result.reportHash || ''
    }];
  }
  const entries = [{
    id: `${result.id}-v1`,
    version: 1,
    label: 'v1',
    changedAt: result.createdAt || changes[0].changedAt,
    changedBy: result.createdBy || 'Lab Staff',
    reason: 'Initial result entry',
    snapshot: changes[0].previousSnapshot || { parameters: changes[0].previousValues || [], reportText: '', internalNotes: '', status: result.status },
    reportHash: changes[0].previousHash || ''
  }];
  changes.forEach((change, index) => {
    const version = Number(change.versionAfter || change.version || index + 2);
    entries.push({
      id: change.id || `${result.id}-v${version}`,
      version,
      label: `v${version}`,
      changedAt: change.changedAt,
      changedBy: change.changedBy,
      reason: change.reason,
      snapshot: change.updatedSnapshot || (index === changes.length - 1 ? snapshotFromResult(result) : changes[index + 1].previousSnapshot) || snapshotFromResult(result),
      reportHash: change.updatedHash || result.reportHash || ''
    });
  });
  return entries;
}

function getLatestChange(result) {
  const entries = [...(result?.versionHistory || result?.amendments || [])].sort((a, b) => new Date(b.changedAt || 0) - new Date(a.changedAt || 0));
  return entries[0] || null;
}

function parameterKey(parameter = {}) {
  return `${parameter.testId || parameter.testName || 'test'}::${parameter.name || 'parameter'}`;
}

function compareSnapshots(before = {}, after = {}) {
  const previous = before.parameters || before.previousValues || [];
  const updated = after.parameters || after.updatedValues || [];
  const keys = [...new Set([...previous.map(parameterKey), ...updated.map(parameterKey)])];
  return keys.map((key) => {
    const oldParameter = previous.find((item) => parameterKey(item) === key) || {};
    const newParameter = updated.find((item) => parameterKey(item) === key) || {};
    return {
      id: key,
      testName: newParameter.testName || oldParameter.testName || newParameter.testId || oldParameter.testId || 'Test',
      name: newParameter.name || oldParameter.name || 'Parameter',
      previousValue: oldParameter.value ?? '—',
      nextValue: newParameter.value ?? '—',
      previousFlag: oldParameter.flag || '—',
      nextFlag: newParameter.flag || '—',
      changed: String(oldParameter.value ?? '') !== String(newParameter.value ?? '') || String(oldParameter.flag ?? '') !== String(newParameter.flag ?? '')
    };
  });
}

function IntegrityCard({ result }) {
  const verificationUrl = getReportVerificationUrl(result);
  const patientPortalUrl = getPatientPortalUrl(result);
  const signed = result?.signatureStatus === 'Signed' && result.digitalSignature;
  return (
    <Card compact title="Report integrity" subtitle={signed ? 'Digitally signed and verification-ready.' : 'Needs digital supervisor signature before final release.'}>
      <div className="grid gap-3 lg:grid-cols-[160px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <img className="mx-auto h-28 w-28 rounded-xl" src={getQrCodeUrl(verificationUrl)} alt="Report verification QR code" />
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">QR Verification</p>
        </div>
        <div className="space-y-2 text-xs font-semibold text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">Secure ID</p><p className="break-all font-mono">{result?.secureId || 'Generated after signature'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">Report Hash</p><p className="break-all font-mono">{result?.reportHash || 'Pending final signature'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">Patient Portal</p><p className="break-all font-mono">{patientPortalUrl}</p></div>
          <div className="flex flex-wrap gap-2 pt-1">
            <StatusBadge status={signed ? 'Signed' : (result?.signatureStatus || 'Unsigned')} />
            {result?.previousHash && <StatusBadge status="Versioned" />}
          </div>
        </div>
      </div>
    </Card>
  );
}

function VersionTimelineModal({ result, onClose }) {
  const versions = getVersionEntries(result);
  return (
    <Modal open={Boolean(result)} onClose={onClose} title={`Version History · ${result?.id || ''}`} description="Audit-safe timeline of every saved lab result version, correction reason, editor and hash snapshot.">
      <div className="space-y-3">
        {versions.map((version, index) => (
          <div key={version.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-slate-950">{version.label}</p>
                <p className="text-sm font-semibold text-slate-500">{version.reason || (index === 0 ? 'Initial entry' : 'Result correction')}</p>
              </div>
              <div className="text-right text-xs font-semibold text-slate-500">
                <p className="font-black text-slate-800">{version.changedBy || 'Lab Staff'}</p>
                <p>{formatDateTime(version.changedAt)}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {(version.snapshot?.parameters || []).slice(0, 4).map((parameter) => (
                <div key={`${version.id}-${parameterKey(parameter)}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-black text-slate-900">{parameter.name}</p>
                  <p className="text-slate-600">{parameter.value} {parameter.unit} · {parameter.flag || 'No flag'}</p>
                </div>
              ))}
            </div>
            {version.reportHash && <p className="mt-3 break-all rounded-xl bg-slate-950 px-3 py-2 font-mono text-[10px] font-semibold text-white">{version.reportHash}</p>}
          </div>
        ))}
      </div>
    </Modal>
  );
}

function CompareChangesModal({ result, onClose }) {
  const latest = getLatestChange(result);
  const before = latest?.previousSnapshot || { parameters: latest?.previousValues || [] };
  const after = latest?.updatedSnapshot || snapshotFromResult(result);
  const rows = latest ? compareSnapshots(before, after) : [];
  return (
    <Modal open={Boolean(result)} onClose={onClose} title={`Compare Changes · ${result?.id || ''}`} description="Side-by-side audit diff showing the latest saved change to result values and flags.">
      {latest ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-clinical-100 bg-clinical-50 p-4">
            <p className="text-sm font-black text-clinical-900">v{latest.versionBefore || Math.max(1, Number(latest.version || 2) - 1)} → v{latest.versionAfter || latest.version || 2}</p>
            <p className="text-sm font-semibold text-clinical-800">{latest.reason}</p>
            <p className="mt-1 text-xs font-semibold text-clinical-700">{latest.changedBy} · {formatDateTime(latest.changedAt)}</p>
          </div>
          <DataTable
            dense
            columns={[
              { key: 'testName', label: 'Test' },
              { key: 'name', label: 'Parameter' },
              { key: 'previousValue', label: 'Previous', render: (row) => <span className="font-black text-red-700">{row.previousValue} <span className="text-xs text-red-500">{row.previousFlag}</span></span> },
              { key: 'nextValue', label: 'Updated', render: (row) => <span className="font-black text-emerald-700">{row.nextValue} <span className="text-xs text-emerald-600">{row.nextFlag}</span></span> },
              { key: 'changed', label: 'Changed?', render: (row) => row.changed ? <StatusBadge status="Changed" /> : <StatusBadge status="No Change" /> }
            ]}
            rows={rows}
            emptyMessage="No changed parameters found."
          />
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-500">No correction history exists for this result yet.</p>
      )}
    </Modal>
  );
}

function SignatureModal({ result, data, dispatch, onClose }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [note, setNote] = useState('Digitally signed after laboratory supervisor review.');

  useEffect(() => {
    if (!result) return;
    setSignedBy(result.signedBy || 'Lab Supervisor');
    setSignatureDataUrl(result.digitalSignature || '');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.strokeStyle = '#0f172a';
  }, [result]);

  if (!result) return null;
  const { patient, order } = getResultContext(data, result);

  function pointer(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  function startDraw(event) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = pointer(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawing(true);
  }

  function moveDraw(event) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = pointer(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDraw() {
    if (!drawing) return;
    setDrawing(false);
    setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  }

  function saveSignature() {
    dispatch({
      type: 'SIGN_LAB_RESULT_WITH_SIGNATURE',
      resultId: result.id,
      payload: { signedBy, note, signatureDataUrl }
    });
    onClose();
  }

  return (
    <Modal open={Boolean(result)} onClose={onClose} title={`Digital Sign-off · ${result.id}`} description={`Supervisor signature for ${patient?.fullName || 'selected patient'} · ${order?.id || result.orderId}`}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Signing locks this report as final, generates a secure verification ID, creates a report hash, and sends doctor/reception notifications. If the result is edited later, the signature is marked as needing re-signature.
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Draw supervisor signature</p>
            <canvas
              ref={canvasRef}
              width="720"
              height="220"
              className="h-48 w-full touch-none rounded-2xl border-2 border-dashed border-slate-300 bg-white"
              onPointerDown={startDraw}
              onPointerMove={moveDraw}
              onPointerUp={stopDraw}
              onPointerLeave={stopDraw}
            />
          </div>
          <div className="space-y-3">
            <FormField label="Signed by"><input className={inputClass} value={signedBy} onChange={(event) => setSignedBy(event.target.value)} /></FormField>
            <FormField label="Sign-off note"><textarea className={`${inputClass} min-h-24`} value={note} onChange={(event) => setNote(event.target.value)} /></FormField>
            {signatureDataUrl ? <StatusBadge status="Signature captured" /> : <StatusBadge status="Unsigned" />}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={clearSignature}><XCircle className="h-4 w-4" /> Clear</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={saveSignature} disabled={!signatureDataUrl || !signedBy.trim()}><Signature className="h-4 w-4" /> Sign & Release</Button>
        </div>
      </div>
    </Modal>
  );
}

function ResultViewModal({ result, data, onClose, onEdit, onCompare, onHistory, onSign }) {
  if (!result) return null;
  const { order, patient, doctor } = getResultContext(data, result);
  return (
    <Modal open={Boolean(result)} onClose={onClose} title={`Laboratory Result · ${result.orderId}`} description="View stored laboratory result details, flags, integrity status, amendment history and print-ready report output.">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Patient</p><p className="font-black text-slate-950">{patient?.fullName || '—'}</p><p className="text-xs text-slate-500">{patient?.id || '—'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Doctor</p><p className="font-black text-slate-950">{doctor?.name || '—'}</p><p className="text-xs text-slate-500">{order?.urgency || 'Routine'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Status</p><StatusBadge status={result.status} /><p className="mt-1 text-xs text-slate-500">{formatDateTime(result.updatedAt)}</p></div>
        </div>

        <IntegrityCard result={result} />

        <DataTable
          dense
          columns={[
            { key: 'testName', label: 'Test' },
            { key: 'name', label: 'Parameter' },
            { key: 'value', label: 'Value', render: (row) => <span className="font-black text-slate-950">{row.value} {row.unit}</span> },
            { key: 'referenceRange', label: 'Reference Range' },
            { key: 'flag', label: 'Flag', render: (row) => <StatusBadge status={flagTone(row.flag)} /> }
          ]}
          rows={result.parameters || []}
          emptyMessage="No parameters are stored for this result."
        />

        {result.reportText && <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Report Comment</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-700 whitespace-pre-line">{result.reportText}</p></div>}
        <ResultAttachments files={result.files || []} />
        {result.internalNotes && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-amber-700">Internal Notes</p><p className="mt-2 text-sm font-semibold leading-6 text-amber-800 whitespace-pre-line">{result.internalNotes}</p></div>}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="secondary" onClick={onHistory}><History className="h-4 w-4" /> History</Button>
          <Button variant="secondary" onClick={onCompare}><GitCompareArrows className="h-4 w-4" /> Compare</Button>
          <Button variant="secondary" onClick={() => printLabResult(data, result)}><Printer className="h-4 w-4" /> Print</Button>
          <Button variant="secondary" onClick={() => openLabResultPdfWindow({ data, result })}><FileDown className="h-4 w-4" /> Generate PDF</Button>
          <Button variant="success" onClick={onSign}><Signature className="h-4 w-4" /> Sign</Button>
          <Button onClick={onEdit}><Edit3 className="h-4 w-4" /> Edit Result</Button>
        </div>
      </div>
    </Modal>
  );
}

function ResultEditModal({ result, data, dispatch, onClose }) {
  const [parameters, setParameters] = useState([]);
  const [reportText, setReportText] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState('Pending Review');
  const [reason, setReason] = useState('Result corrected from laboratory archive.');

  useEffect(() => {
    setParameters((result?.parameters || []).map((parameter, index) => ({ ...parameter, rowId: `${parameter.testId || 'test'}-${parameter.name || 'parameter'}-${index}` })));
    setReportText(result?.reportText || '');
    setInternalNotes(result?.internalNotes || '');
    setStatus(result?.status || 'Pending Review');
    setReason(result?.status === 'Final / Released' ? 'Released result corrected after review.' : 'Result corrected from laboratory archive.');
  }, [result]);

  if (!result) return null;
  const { patient } = getResultContext(data, result);

  function updateParameter(rowId, value) {
    setParameters((rows) => rows.map((row) => {
      if (row.rowId !== rowId) return row;
      return {
        ...row,
        value,
        flag: value === '' ? 'Pending' : computeResultFlag(value, row.low, row.high, row.criticalLow, row.criticalHigh)
      };
    }));
  }

  function saveChanges() {
    dispatch({
      type: 'UPDATE_LAB_RESULT_ARCHIVE',
      resultId: result.id,
      payload: {
        parameters: parameters.map(({ rowId, ...parameter }) => parameter),
        reportText,
        internalNotes,
        status,
        reason
      }
    });
    onClose();
  }

  return (
    <Modal open={Boolean(result)} onClose={onClose} title={`Edit Laboratory Result · ${result.orderId}`} description={`Correct stored lab values for ${patient?.fullName || 'selected patient'} while keeping version history and invalidating old signatures when needed.`}>
      <div className="space-y-4">
        {result.digitalSignature && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">This result is signed. Saving a correction will preserve the old version, invalidate the old signature, create a new hash, and require supervisor re-signature.</div>}
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <FormField label="Correction reason"><input className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for correction" /></FormField>
          <FormField label="Result status"><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option>Draft</option><option>In Progress</option><option>Pending Review</option><option>Final / Released</option></select></FormField>
        </div>

        <div className="space-y-3">
          {parameters.map((parameter) => (
            <div key={parameter.rowId} className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_150px_130px] md:items-center">
                <div>
                  <p className="font-black text-slate-950">{parameter.testName || parameter.testId}</p>
                  <p className="text-sm font-semibold text-slate-500">{parameter.name} · {parameter.unit || 'No unit'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Reference Range</p>
                  <p className="mt-1 text-sm font-black text-slate-800">{parameter.referenceRange || '—'}</p>
                </div>
                <input className={inputClass} value={parameter.value || ''} onChange={(event) => updateParameter(parameter.rowId, event.target.value)} placeholder="Value" />
                <StatusBadge status={flagTone(parameter.flag)} />
              </div>
            </div>
          ))}
          {!parameters.length && <p className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-500">No editable parameters found for this result.</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Report Comment"><textarea className={`${inputClass} min-h-24`} value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="Clinical report comment" /></FormField>
          <FormField label="Internal Notes"><textarea className={`${inputClass} min-h-24`} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} placeholder="Internal lab notes" /></FormField>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={saveChanges}><Save className="h-4 w-4" /> Save Correction</Button>
        </div>
      </div>
    </Modal>
  );
}

export function LabResultsPage() {
  const { state, dispatch } = useAppStore();
  const data = state.data;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [activeResultId, setActiveResultId] = useState('');
  const [editResultId, setEditResultId] = useState('');
  const [historyResultId, setHistoryResultId] = useState('');
  const [compareResultId, setCompareResultId] = useState('');
  const [signResultId, setSignResultId] = useState('');

  const rows = useMemo(() => (data.results || [])
    .filter((result) => result.department === 'Laboratory')
    .map((result) => {
      const context = getResultContext(data, result);
      return { ...result, ...context, testNames: uniqueTests(result.parameters || []) };
    })
    .filter((row) => row.order)
    .filter((row) => !status || row.status === status || row.signatureStatus === status)
    .filter((row) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [row.id, row.orderId, row.patient?.fullName, row.patient?.id, row.doctor?.name, row.testNames.join(' '), row.status, row.reportHash, row.secureId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    })
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)), [data, query, status]);

  const allLabResults = (data.results || []).filter((result) => result.department === 'Laboratory');
  const released = allLabResults.filter((result) => result.status === 'Final / Released').length;
  const review = allLabResults.filter((result) => result.status === 'Pending Review').length;
  const abnormal = allLabResults.filter((result) => result.abnormal || (result.parameters || []).some((parameter) => ['High', 'Low', 'Critical'].includes(parameter.flag))).length;
  const amended = allLabResults.filter((result) => result.amendments?.length || result.versionHistory?.length).length;
  const signed = allLabResults.filter((result) => result.signatureStatus === 'Signed' && result.digitalSignature).length;
  const needsResign = allLabResults.filter((result) => result.signatureStatus === 'Needs re-sign after correction').length;
  const activeResult = allLabResults.find((result) => result.id === activeResultId);
  const editResult = allLabResults.find((result) => result.id === editResultId);
  const historyResult = allLabResults.find((result) => result.id === historyResultId);
  const compareResult = allLabResults.find((result) => result.id === compareResultId);
  const signResult = allLabResults.find((result) => result.id === signResultId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Laboratory"
        title="Results"
        description="Stored laboratory results with version history, diff comparison, PDF generation, QR verification, report hashing and digital supervisor sign-off."
        actions={<FileText className="h-5 w-5 text-clinical-600" />}
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Card compact title="Stored Results" subtitle={String(allLabResults.length)} />
        <Card compact title="Pending Review" subtitle={String(review)} />
        <Card compact title="Released" subtitle={String(released)} />
        <Card compact title="Abnormal Flags" subtitle={String(abnormal)} />
        <Card compact title="Versioned" subtitle={String(amended)} />
        <Card compact title="Signed" subtitle={`${signed}${needsResign ? ` / ${needsResign} re-sign` : ''}`} />
      </div>

      <Card compact title="Security controls" subtitle="Medical-grade reporting controls for official lab reports.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><History className="h-5 w-5 text-clinical-600" /><p className="mt-2 font-black text-slate-950">Version timeline</p><p className="text-sm text-slate-500">v1, v2, v3 result versions with editor and reason.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><GitCompareArrows className="h-5 w-5 text-clinical-600" /><p className="mt-2 font-black text-slate-950">Compare changes</p><p className="text-sm text-slate-500">Parameter-level previous vs updated value diff.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><QrCode className="h-5 w-5 text-clinical-600" /><p className="mt-2 font-black text-slate-950">QR + hash</p><p className="text-sm text-slate-500">Verification URL, secure ID and tamper-evident report hash.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><Signature className="h-5 w-5 text-clinical-600" /><p className="mt-2 font-black text-slate-950">Digital sign-off</p><p className="text-sm text-slate-500">Canvas signature locks and releases final reports.</p></div>
        </div>
      </Card>

      <Card title="Laboratory result archive" subtitle="Submitted and released laboratory results remain available to lab users for review, PDF generation, printout, correction and sign-off.">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, order, result ID, secure ID, hash, doctor or test..." />
          </div>
          <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All result states</option>
            <option>Draft</option>
            <option>In Progress</option>
            <option>Pending Review</option>
            <option>Final / Released</option>
            <option>Signed</option>
            <option>Needs re-sign after correction</option>
          </select>
        </div>

        <DataTable
          columns={[
            { key: 'id', label: 'Result ID', render: (row) => <div><span className="font-black text-slate-950">{row.id}</span><p className="text-[10px] font-mono text-slate-500">{row.secureId || 'Unsigned'}</p></div> },
            { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-black text-slate-950">{row.patient?.fullName}</p><p className="text-xs text-slate-500">{row.patient?.id}</p></div> },
            { key: 'orderId', label: 'Order' },
            { key: 'tests', label: 'Tests', render: (row) => row.testNames.join(', ') || '—' },
            { key: 'flags', label: 'Flags', render: (row) => <div className="flex flex-wrap gap-1">{[...new Set((row.parameters || []).map((parameter) => parameter.flag || 'No Range'))].map((flag) => <StatusBadge key={flag} status={flagTone(flag)} />)}</div> },
            { key: 'security', label: 'Security', render: (row) => <div className="flex flex-col gap-1"><StatusBadge status={row.signatureStatus || 'Unsigned'} />{row.reportHash && <span className="max-w-[150px] truncate font-mono text-[10px] text-slate-500">{row.reportHash}</span>}</div> },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'updatedAt', label: 'Updated', render: (row) => formatDateTime(row.updatedAt) },
            { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => setActiveResultId(row.id)}><Eye className="h-4 w-4" /> View</Button><Button size="sm" variant="secondary" onClick={() => setHistoryResultId(row.id)}><History className="h-4 w-4" /> History</Button><Button size="sm" variant="secondary" onClick={() => setCompareResultId(row.id)}><GitCompareArrows className="h-4 w-4" /> Compare</Button><Button size="sm" variant="secondary" onClick={() => openLabResultPdfWindow({ data, result: row })}><FileDown className="h-4 w-4" /> PDF</Button><Button size="sm" variant="success" onClick={() => setSignResultId(row.id)}><ShieldCheck className="h-4 w-4" /> Sign</Button><Button size="sm" onClick={() => setEditResultId(row.id)}><Edit3 className="h-4 w-4" /> Edit</Button></div> }
          ]}
          rows={rows}
          emptyMessage="No laboratory results match this filter."
        />
      </Card>

      <ResultViewModal
        result={activeResult}
        data={data}
        onClose={() => setActiveResultId('')}
        onEdit={() => {
          setEditResultId(activeResult?.id || '');
          setActiveResultId('');
        }}
        onHistory={() => {
          setHistoryResultId(activeResult?.id || '');
          setActiveResultId('');
        }}
        onCompare={() => {
          setCompareResultId(activeResult?.id || '');
          setActiveResultId('');
        }}
        onSign={() => {
          setSignResultId(activeResult?.id || '');
          setActiveResultId('');
        }}
      />
      <ResultEditModal result={editResult} data={data} dispatch={dispatch} onClose={() => setEditResultId('')} />
      <VersionTimelineModal result={historyResult} onClose={() => setHistoryResultId('')} />
      <CompareChangesModal result={compareResult} onClose={() => setCompareResultId('')} />
      <SignatureModal result={signResult} data={data} dispatch={dispatch} onClose={() => setSignResultId('')} />
    </div>
  );
}
