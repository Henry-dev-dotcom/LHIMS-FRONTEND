import { useMemo, useState } from 'react';
import { ClipboardCheck, FileSearch, Search, UserPlus, UsersRound } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { useAppStore } from '../../store/AppStore';
import { formatDateTime, getById } from '../../utils/formatters';
import { ReceptionPageTabs } from './ReceptionPageTabs';

const blankPatient = { fullName: '', dateOfBirth: '', gender: 'Female', phone: '', email: '', address: '', nationalId: '', insuranceProvider: '', policyNumber: '', emergencyContact: '', allergies: '' };

export function ReceptionWalkInsPage() {
  const { state, dispatch } = useAppStore();
  const [section, setSection] = useState('register');
  const [walkIn, setWalkIn] = useState(blankPatient);
  const [query, setQuery] = useState('');

  const walkInVisits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (state.data.dailyVisits || [])
      .filter((visit) => visit.status === 'Walk-in Registered' || !visit.orderId)
      .map((visit) => ({ ...visit, patient: getById(state.data.patients, visit.patientId) }))
      .filter((visit) => !q || [visit.id, visit.patient?.fullName, visit.patient?.phone, visit.patient?.id, visit.status].filter(Boolean).join(' ').toLowerCase().includes(q))
      .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt));
  }, [state.data, query]);

  const pageSections = [
    { id: 'summary', label: 'Summary', helper: 'Walk-in counts', icon: ClipboardCheck, tone: 'blue', count: walkInVisits.length },
    { id: 'register', label: 'Register', helper: 'New patient intake', icon: UserPlus, tone: 'purple', count: 'New' },
    { id: 'walkins', label: 'Walk-in List', helper: 'Today’s records', icon: UsersRound, tone: 'emerald', count: walkInVisits.length },
    { id: 'duplicates', label: 'Duplicates', helper: 'Flagged matches', icon: FileSearch, tone: 'amber', count: (state.data.duplicateFlags || []).length }
  ];

  function registerWalkIn(event) {
    event.preventDefault();
    dispatch({ type: 'CREATE_WALK_IN_PATIENT', payload: walkIn });
    setWalkIn(blankPatient);
    setSection('walkins');
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Reception" title="Walk-In Registration" description="New front-desk patient intake, walk-in visit tracking, and duplicate review." />
      <ReceptionPageTabs label="Walk-in sections" sections={pageSections} active={section} onChange={setSection} />

      {section === 'summary' && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Walk-in visits" value={walkInVisits.length} icon={UserPlus} tone="purple" />
        <MetricCard label="Patient records" value={state.data.patients.length} icon={UsersRound} tone="blue" />
        <MetricCard label="Duplicate flags" value={(state.data.duplicateFlags || []).length} icon={Search} tone="yellow" />
        <MetricCard label="Registration" value="Ready" icon={ClipboardCheck} tone="green" />
      </div>}

      {section === 'register' && <Card title="Walk-in registration form" subtitle="Create a new patient record and add them to today’s reception visit register." compact>
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
      </Card>}

      {section === 'walkins' && <Card title="Registered walk-ins" subtitle="Walk-ins are separated from normal check-in so the reception workflow is easier to follow." compact actions={<input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search walk-in patient or visit ID" />}>
        <DataTable
          columns={[
            { key: 'id', label: 'Visit ID', render: (row) => <span className="font-black text-slate-950">{row.id}</span> },
            { key: 'patient', label: 'Patient', render: (row) => <div><p className="font-bold text-slate-950">{row.patient?.fullName || '—'}</p><p className="text-xs text-slate-500">{row.patient?.id} · {row.patient?.phone || 'No phone'}</p></div> },
            { key: 'identityVerified', label: 'Identity', render: (row) => <StatusBadge status={row.identityVerified ? 'Verified' : 'Not verified'} /> },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'checkedInAt', label: 'Registered', render: (row) => formatDateTime(row.checkedInAt) }
          ]}
          rows={walkInVisits}
          emptyMessage="No walk-ins match this filter."
        />
      </Card>}

      {section === 'duplicates' && <Card title="Duplicate resolution queue" subtitle="Flagged records remain visible here for reception and admin review." compact>
        <DataTable
          columns={[
            { key: 'id', label: 'Flag' },
            { key: 'patientId', label: 'Patient' },
            { key: 'possibleDuplicateId', label: 'Possible Duplicate' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) }
          ]}
          rows={state.data.duplicateFlags || []}
          emptyMessage="No duplicate flags yet."
        />
      </Card>}
    </div>
  );
}
