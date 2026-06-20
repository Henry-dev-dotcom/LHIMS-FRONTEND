import { useMemo, useState } from 'react';
import { Building2, Plus, Search, Stethoscope } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { MetricCard } from '../../components/ui/MetricCard';
import { Modal } from '../../components/ui/Modal';
import { FormField, inputClass } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store/AppStore';

const blankHospital = { id: '', name: '', billingContact: '', accountStatus: 'Active', phone: '', address: '' };
const blankDoctor = { id: '', name: '', specialty: '', hospitalId: '', licenseNumber: '', email: '', phone: '', notificationPreferences: { email: true, sms: true } };

export function HospitalsPage() {
  const { state, dispatch } = useAppStore();
  const { hospitals = [], doctors = [] } = state.data;
  const [query, setQuery] = useState('');
  const [hospitalModal, setHospitalModal] = useState(false);
  const [doctorModal, setDoctorModal] = useState(false);
  const [hospitalForm, setHospitalForm] = useState(blankHospital);
  const [doctorForm, setDoctorForm] = useState(blankDoctor);

  const filteredHospitals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hospitals.filter((hospital) => !q || [hospital.id, hospital.name, hospital.billingContact, hospital.accountStatus, hospital.phone].some((value) => String(value || '').toLowerCase().includes(q)));
  }, [hospitals, query]);

  const openHospital = (hospital = blankHospital) => {
    setHospitalForm({ ...blankHospital, ...hospital });
    setHospitalModal(true);
  };
  const openDoctor = (doctor = blankDoctor) => {
    setDoctorForm({ ...blankDoctor, ...doctor, hospitalId: doctor.hospitalId || hospitals[0]?.id || '' });
    setDoctorModal(true);
  };
  const saveHospital = (event) => {
    event.preventDefault();
    dispatch({ type: hospitalForm.id ? 'ADMIN_UPDATE_HOSPITAL' : 'ADMIN_CREATE_HOSPITAL', hospitalId: hospitalForm.id, payload: hospitalForm });
    setHospitalModal(false);
  };
  const saveDoctor = (event) => {
    event.preventDefault();
    dispatch({ type: doctorForm.id ? 'ADMIN_UPDATE_DOCTOR' : 'ADMIN_CREATE_DOCTOR', doctorId: doctorForm.id, payload: doctorForm });
    setDoctorModal(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Hospital / partner management"
        description="Register partner hospitals, maintain billing contacts, manage account status and affiliated doctors."
        actions={<><Button variant="secondary" onClick={() => openDoctor()}><Stethoscope className="h-4 w-4" /> Add doctor</Button><Button onClick={() => openHospital()}><Plus className="h-4 w-4" /> Add hospital</Button></>}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="Hospitals" value={hospitals.length} icon={Building2} tone="blue" />
        <MetricCard label="Active Accounts" value={hospitals.filter((item) => item.accountStatus === 'Active').length} icon={Building2} tone="green" />
        <MetricCard label="Affiliated Doctors" value={doctors.length} icon={Stethoscope} tone="purple" />
        <MetricCard label="Suspended / On Hold" value={hospitals.filter((item) => item.accountStatus !== 'Active').length} icon={Building2} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Registered hospitals" subtitle="Each doctor order inherits hospital affiliation and billing context.">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-10`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search hospital, billing contact, phone or status" />
          </div>
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Hospital' },
              { key: 'billingContact', label: 'Billing Contact' },
              { key: 'accountStatus', label: 'Status', render: (row) => <StatusBadge status={row.accountStatus} /> },
              { key: 'doctors', label: 'Doctors', render: (row) => doctors.filter((doctor) => doctor.hospitalId === row.id).length },
              { key: 'actions', label: 'Actions', render: (row) => <Button variant="secondary" onClick={() => openHospital(row)}>Edit</Button> }
            ]}
            rows={filteredHospitals}
          />
        </Card>

        <Card title="Affiliated doctors" subtitle="Doctors are linked to hospitals and can submit external orders.">
          <DataTable
            columns={[
              { key: 'name', label: 'Doctor' },
              { key: 'specialty', label: 'Specialty' },
              { key: 'hospitalId', label: 'Hospital', render: (row) => hospitals.find((hospital) => hospital.id === row.hospitalId)?.name || '—' },
              { key: 'actions', label: 'Actions', render: (row) => <Button variant="secondary" onClick={() => openDoctor(row)}>Edit</Button> }
            ]}
            rows={doctors}
          />
        </Card>
      </div>

      <Modal open={hospitalModal} title={hospitalForm.id ? 'Edit hospital' : 'Add hospital'} onClose={() => setHospitalModal(false)} footer={<><Button variant="secondary" onClick={() => setHospitalModal(false)}>Cancel</Button><Button type="submit" form="hospital-form">Save hospital</Button></>}>
        <form id="hospital-form" onSubmit={saveHospital} className="grid gap-4 md:grid-cols-2">
          <FormField label="Hospital name"><input required className={inputClass} value={hospitalForm.name} onChange={(event) => setHospitalForm({ ...hospitalForm, name: event.target.value })} /></FormField>
          <FormField label="Billing contact"><input required className={inputClass} value={hospitalForm.billingContact} onChange={(event) => setHospitalForm({ ...hospitalForm, billingContact: event.target.value })} /></FormField>
          <FormField label="Account status"><select className={inputClass} value={hospitalForm.accountStatus} onChange={(event) => setHospitalForm({ ...hospitalForm, accountStatus: event.target.value })}><option>Active</option><option>On Hold</option><option>Suspended</option></select></FormField>
          <FormField label="Phone"><input className={inputClass} value={hospitalForm.phone} onChange={(event) => setHospitalForm({ ...hospitalForm, phone: event.target.value })} /></FormField>
          <FormField label="Address"><input className={inputClass} value={hospitalForm.address} onChange={(event) => setHospitalForm({ ...hospitalForm, address: event.target.value })} /></FormField>
        </form>
      </Modal>

      <Modal open={doctorModal} title={doctorForm.id ? 'Edit affiliated doctor' : 'Add affiliated doctor'} onClose={() => setDoctorModal(false)} footer={<><Button variant="secondary" onClick={() => setDoctorModal(false)}>Cancel</Button><Button type="submit" form="doctor-form">Save doctor</Button></>}>
        <form id="doctor-form" onSubmit={saveDoctor} className="grid gap-4 md:grid-cols-2">
          <FormField label="Doctor name"><input required className={inputClass} value={doctorForm.name} onChange={(event) => setDoctorForm({ ...doctorForm, name: event.target.value })} /></FormField>
          <FormField label="Specialty"><input required className={inputClass} value={doctorForm.specialty} onChange={(event) => setDoctorForm({ ...doctorForm, specialty: event.target.value })} /></FormField>
          <FormField label="Hospital"><select className={inputClass} value={doctorForm.hospitalId} onChange={(event) => setDoctorForm({ ...doctorForm, hospitalId: event.target.value })}>{hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}</select></FormField>
          <FormField label="License number"><input className={inputClass} value={doctorForm.licenseNumber} onChange={(event) => setDoctorForm({ ...doctorForm, licenseNumber: event.target.value })} /></FormField>
          <FormField label="Email"><input type="email" className={inputClass} value={doctorForm.email} onChange={(event) => setDoctorForm({ ...doctorForm, email: event.target.value })} /></FormField>
          <FormField label="Phone"><input className={inputClass} value={doctorForm.phone} onChange={(event) => setDoctorForm({ ...doctorForm, phone: event.target.value })} /></FormField>
        </form>
      </Modal>
    </div>
  );
}
