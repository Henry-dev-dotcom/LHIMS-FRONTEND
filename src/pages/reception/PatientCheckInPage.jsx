import { useMemo, useState } from 'react';
import { UserPlus, UsersRound, Search, ClipboardCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime, getById } from '../../utils/formatters';
import { findDuplicatePatients } from '../../utils/patientUtils';

const blankPatient = { fullName: '', dateOfBirth: '', gender: 'Female', phone: '', email: '', address: '', nationalId: '', insuranceProvider: '', policyNumber: '', emergencyContact: '', allergies: '' };

export function PatientCheckInPage() {
  const { state, dispatch } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [identityVerified, setIdentityVerified] = useState(true);
  const [notes, setNotes] = useState('Identity and order details verified at front desk.');
  const [walkIn, setWalkIn] = useState(blankPatient);

  const patients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.data.patients.slice(0, 8);
    return state.data.patients.filter((patient) => [patient.id, patient.fullName, patient.phone, patient.email, patient.nationalId].join(' ').toLowerCase().includes(q));
  }, [state.data.patients, query]);

  const selectedPatient = getById(state.data.patients, selectedPatientId);
  const patientOrders = state.data.orders.filter((order) => order.patientId === selectedPatientId && !['Final / Released','Cancelled'].includes(order.status));
  const duplicateCandidates = selectedPatient ? findDuplicatePatients(state.data.patients, selectedPatient) : [];

  function checkIn() {
    dispatch({ type: 'CHECK_IN_PATIENT', payload: { patientId: selectedPatientId, orderId: selectedOrderId, identityVerified, notes } });
  }

  function registerWalkIn(event) {
    event.preventDefault();
    dispatch({ type: 'CREATE_WALK_IN_PATIENT', payload: walkIn });
    setWalkIn(blankPatient);
  }

  return (
    <div>
      <PageHeader eyebrow="Section 6 — Reception" title="Patient Check-In & Walk-in Registration" description="Search patients, verify identity, connect visits to orders, register walk-ins, and flag duplicate records." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Patient records" value={state.data.patients.length} icon={UsersRound} tone="blue" />
        <MetricCard label="Today visits" value={(state.data.dailyVisits || []).length} icon={ClipboardCheck} tone="green" />
        <MetricCard label="Possible duplicates" value={(state.data.duplicateFlags || []).length} icon={Search} tone="yellow" />
        <MetricCard label="Walk-in ready" value="Enabled" icon={UserPlus} tone="purple" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card title="Patient search and check-in" subtitle="Reception can search the master patient index and add the patient to the daily visit log.">
          <div className="space-y-4">
            <FormField label="Search master patient index">
              <input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, Patient ID, phone, email, National ID" />
            </FormField>
            <FormField label="Select patient">
              <select className={inputClass} value={selectedPatientId} onChange={(event) => { setSelectedPatientId(event.target.value); setSelectedOrderId(''); }}>
                <option value="">Choose patient</option>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} — {patient.id}</option>)}
              </select>
            </FormField>
            <FormField label="Link active order">
              <select className={inputClass} value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)} disabled={!selectedPatientId}>
                <option value="">No linked order / walk-in visit</option>
                {patientOrders.map((order) => <option key={order.id} value={order.id}>{order.id} — {order.status}</option>)}
              </select>
            </FormField>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={identityVerified} onChange={(event) => setIdentityVerified(event.target.checked)} /> Identity verified
            </label>
            <FormField label="Check-in notes">
              <textarea className={inputClass} rows="4" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </FormField>
            <Button onClick={checkIn} disabled={!selectedPatientId}>Check In Patient</Button>
            {selectedPatient && duplicateCandidates.length > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="font-black text-amber-800">Possible duplicate records found</p><div className="mt-3 flex flex-wrap gap-2">{duplicateCandidates.map((patient) => <Button key={patient.id} variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => dispatch({ type: 'FLAG_DUPLICATE_PATIENT', payload: { patientId: selectedPatient.id, possibleDuplicateId: patient.id } })}>Flag {patient.id}</Button>)}</div></div>}
          </div>
        </Card>

        <Card title="Walk-in registration form" subtitle="Same core fields as the master Patient Record, optimized for front desk intake.">
          <form onSubmit={registerWalkIn} className="grid gap-4 md:grid-cols-2">
            <FormField label="Full name"><input className={inputClass} required value={walkIn.fullName} onChange={(e) => setWalkIn({ ...walkIn, fullName: e.target.value })} /></FormField>
            <FormField label="Date of birth"><input type="date" className={inputClass} value={walkIn.dateOfBirth} onChange={(e) => setWalkIn({ ...walkIn, dateOfBirth: e.target.value })} /></FormField>
            <FormField label="Gender"><select className={inputClass} value={walkIn.gender} onChange={(e) => setWalkIn({ ...walkIn, gender: e.target.value })}><option>Female</option><option>Male</option><option>Other</option></select></FormField>
            <FormField label="Phone"><input className={inputClass} value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} /></FormField>
            <FormField label="Email"><input className={inputClass} value={walkIn.email} onChange={(e) => setWalkIn({ ...walkIn, email: e.target.value })} /></FormField>
            <FormField label="National ID / Passport"><input className={inputClass} value={walkIn.nationalId} onChange={(e) => setWalkIn({ ...walkIn, nationalId: e.target.value })} /></FormField>
            <FormField label="Insurance Provider"><input className={inputClass} value={walkIn.insuranceProvider} onChange={(e) => setWalkIn({ ...walkIn, insuranceProvider: e.target.value })} /></FormField>
            <FormField label="Policy No."><input className={inputClass} value={walkIn.policyNumber} onChange={(e) => setWalkIn({ ...walkIn, policyNumber: e.target.value })} /></FormField>
            <div className="md:col-span-2"><FormField label="Address"><input className={inputClass} value={walkIn.address} onChange={(e) => setWalkIn({ ...walkIn, address: e.target.value })} /></FormField></div>
            <div className="md:col-span-2"><FormField label="Allergy / known conditions notes"><textarea className={inputClass} rows="3" value={walkIn.allergies} onChange={(e) => setWalkIn({ ...walkIn, allergies: e.target.value })} /></FormField></div>
            <div className="md:col-span-2"><Button type="submit"><UserPlus className="h-4 w-4" /> Register Walk-in</Button></div>
          </form>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Daily visit log" subtitle="Patients checked in today, including walk-ins and doctor-order visits.">
          <DataTable columns={[{ key: 'id', label: 'Visit ID' }, { key: 'patient', label: 'Patient', render: (row) => getById(state.data.patients, row.patientId)?.fullName || '—' }, { key: 'orderId', label: 'Order', render: (row) => row.orderId || '—' }, { key: 'identityVerified', label: 'Identity', render: (row) => <StatusBadge status={row.identityVerified ? 'Verified' : 'Not verified'} /> }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }, { key: 'checkedInAt', label: 'Checked In', render: (row) => formatDateTime(row.checkedInAt) }]} rows={state.data.dailyVisits || []} />
        </Card>
        <Card title="Duplicate resolution queue" subtitle="Reception can flag records for admin review before merge/deactivation.">
          <DataTable columns={[{ key: 'id', label: 'Flag' }, { key: 'patientId', label: 'Patient' }, { key: 'possibleDuplicateId', label: 'Possible Duplicate' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }, { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) }]} rows={state.data.duplicateFlags || []} emptyMessage="No duplicate flags yet." />
        </Card>
      </div>
    </div>
  );
}
