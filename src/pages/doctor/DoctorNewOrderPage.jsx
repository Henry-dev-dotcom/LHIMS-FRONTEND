import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, Plus, Search, Send, Star, Trash2, X } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FormField, inputClass } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { calculateAge, findDuplicatePatients, patientMatchesSearch } from '../../utils/patientUtils';
import { computeExpectedCompletion } from '../../workflow/workflowEngine';
import { formatDateTime } from '../../utils/formatters';

const newPatientBlank = {
  fullName: '', dateOfBirth: '', gender: 'Female', phone: '', email: '', address: '', nationalId: '', insuranceProvider: '', policyNumber: '', emergencyContact: '', allergies: ''
};

const COMMON_TEST_IDS = ['t1', 't3', 't4', 't5', 't6', 't7', 't17', 't19'];

function catalogMatches(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.id, item.name, item.type, item.department, item.modality, item.searchText]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function isSameDay(a, b = new Date()) {
  const first = new Date(a);
  const second = new Date(b);
  if (Number.isNaN(first.getTime())) return false;
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
}

function CatalogSearchModal({ open, onClose, catalog, selectedItems, toggleItem, clearItems }) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const matches = catalog
    .filter((item) => (!department || item.department === department))
    .filter((item) => catalogMatches(item, query));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add test or scan"
      description="Search by test/scan name, catalog ID, department, modality, or common abbreviation. Prices remain hidden from doctors and clinicians."
      footer={(
        <>
          <div className="mr-auto text-sm font-black text-slate-500">{selectedItems.length} selected</div>
          <Button type="button" variant="secondary" onClick={clearItems}>Clear</Button>
          <Button type="button" onClick={onClose}>Done — Save Selected Tests</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FBC, t1, LFT, ultrasound, scan..." autoFocus />
          </div>
          <select className={inputClass} value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">Both departments</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Imaging">Scan / Radiology</option>
          </select>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Quick common requests</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_TEST_IDS.map((id) => catalog.find((item) => item.id === id)).filter(Boolean).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ring-1 transition ${selectedItems.includes(item.id) ? 'bg-clinical-600 text-white ring-clinical-600' : 'bg-white text-slate-700 ring-slate-200 hover:bg-clinical-50 hover:text-clinical-700'}`}
              >
                <Star className="h-3.5 w-3.5" /> {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Click items to add/remove them, then press Done to return to the order.</p>
          {matches.map((item) => {
            const selected = selectedItems.includes(item.id);
            return (
              <button key={item.id} type="button" onClick={() => toggleItem(item.id)} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${selected ? 'border-clinical-300 bg-clinical-50 ring-4 ring-clinical-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-950">{item.name}</p><StatusBadge status={item.type} /></div>
                  <p className="mt-1 text-sm text-slate-500">ID: {item.id} · {item.department === 'Imaging' ? 'Radiology / Scan' : item.department}{item.modality ? ` · ${item.modality}` : ''} · ETA {item.expectedHours}h</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${selected ? 'bg-clinical-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{selected ? 'Added' : 'Add'}</span>
              </button>
            );
          })}
          {matches.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No tests or scans match your search.</p>}
        </div>
      </div>
    </Modal>
  );
}

function ReviewOrderModal({ open, onClose, onConfirm, patient, newPatient, patientMode, doctor, hospital, items, urgency, clinicalNotes, expected, duplicateOrders }) {
  const patientName = patientMode === 'existing' ? patient?.fullName : newPatient.fullName;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review and submit order"
      description="Confirm the selected patient, tests/scans, urgency, and clinical notes before sending to reception."
      footer={<><Button variant="secondary" onClick={onClose}>Go Back</Button><Button onClick={onConfirm}><Send className="h-4 w-4" /> Submit to Reception</Button></>}
    >
      <div className="space-y-4">
        {duplicateOrders.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-2 font-black"><AlertTriangle className="h-5 w-5" /> Possible duplicate same-day order</div>
            <p className="mt-1">This patient already has {duplicateOrders.length} order(s) today containing one or more of the selected tests/scans.</p>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Patient</p>
            <p className="mt-1 font-black text-slate-950">{patientName || '—'}</p>
            <p className="text-sm text-slate-500">{patientMode === 'existing' ? patient?.id : 'New patient record will be created'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Doctor / Hospital</p>
            <p className="mt-1 font-black text-slate-950">{doctor?.name}</p>
            <p className="text-sm text-slate-500">{hospital?.name}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Urgency</p>
            <div className="mt-1"><StatusBadge status={urgency} /></div>
            <p className="mt-2 text-sm text-slate-500">Expected: {expected ? formatDateTime(expected) : '—'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Selected items</p>
            <p className="mt-1 font-black text-slate-950">{items.length} test/scan item(s)</p>
            <p className="text-sm text-slate-500">Prices hidden from clinicians.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Tests / Scans</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">{item.id} · {item.name}</span>)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Clinical notes</p>
          <p className="text-sm leading-6 text-slate-600">{clinicalNotes || 'No clinical notes entered.'}</p>
        </div>
      </div>
    </Modal>
  );
}

export function DoctorNewOrderPage() {
  const { state, dispatch } = useAppStore();
  const { data } = state;
  const doctor = data.doctors.find((item) => item.id === state.auth?.linkedDoctorId) || data.doctors[0];
  const hospital = data.hospitals.find((item) => item.id === doctor?.hospitalId) || data.hospitals[0];
  const [patientMode, setPatientMode] = useState('existing');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatient, setNewPatient] = useState(newPatientBlank);
  const [selectedItems, setSelectedItems] = useState([]);
  const [urgency, setUrgency] = useState('Routine');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const systemPatients = useMemo(() => data.patients || [], [data.patients]);
  const patientMatches = systemPatients.filter((patient) => patientMatchesSearch(patient, patientSearch));
  const duplicateCandidates = findDuplicatePatients(data.patients, newPatient);
  const chosenCatalogItems = selectedItems.map((id) => data.catalog.find((item) => item.id === id)).filter(Boolean);
  const expected = selectedItems.length ? computeExpectedCompletion(new Date().toISOString(), selectedItems, data.catalog, urgency) : '';
  const selectedPatient = data.patients.find((patient) => patient.id === selectedPatientId);
  const validationIssues = [
    patientMode === 'existing' && !selectedPatientId ? 'Select an existing patient.' : '',
    patientMode === 'new' && !newPatient.fullName.trim() ? 'Enter the new patient full name.' : '',
    selectedItems.length === 0 ? 'Add at least one test or scan.' : ''
  ].filter(Boolean);

  const sameDayDuplicates = useMemo(() => {
    const patientId = patientMode === 'existing' ? selectedPatientId : '';
    if (!patientId || selectedItems.length === 0) return [];
    return (data.orders || []).filter((order) => order.patientId === patientId && order.doctorId === doctor?.id && order.status !== 'Cancelled' && isSameDay(order.createdAt) && (order.itemIds || []).some((id) => selectedItems.includes(id)));
  }, [data.orders, doctor?.id, patientMode, selectedPatientId, selectedItems]);

  function toggleItem(id) {
    setSelectedItems((current) => current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]);
  }

  function removeItem(id) {
    setSelectedItems((current) => current.filter((itemId) => itemId !== id));
  }

  function openReview(event) {
    event.preventDefault();
    setAttemptedSubmit(true);
    if (validationIssues.length) return;
    setReviewOpen(true);
  }

  function confirmSubmitOrder() {
    dispatch({
      type: 'CREATE_DOCTOR_ORDER',
      payload: {
        patientMode,
        patientId: patientMode === 'existing' ? selectedPatientId : '',
        newPatient,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        itemIds: selectedItems,
        urgency,
        clinicalNotes
      }
    });
    setReviewOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Doctor Portal · New Order Form"
        title="Create Test / Scan Order"
        description="A guided ordering flow: choose a patient, add multiple investigations, review the request, then submit it to reception."
      />

      <form onSubmit={openReview} className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {attemptedSubmit && validationIssues.length > 0 && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p className="font-black">Complete the order before review:</p>
              <ul className="mt-2 list-disc pl-5">
                {validationIssues.map((issue) => <li key={issue}>{issue}</li>)}
              </ul>
            </div>
          )}

          <Card title="1. Patient Selection" subtitle="Search patients already on the system or create a new record.">
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <button type="button" onClick={() => setPatientMode('existing')} className={`rounded-2xl border p-4 text-left transition ${patientMode === 'existing' ? 'border-clinical-300 bg-clinical-50 ring-4 ring-clinical-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <p className="font-black text-slate-950">Existing Patient</p>
                <p className="text-sm text-slate-500">Search by patient name, ID, phone, email, or national ID.</p>
              </button>
              <button type="button" onClick={() => setPatientMode('new')} className={`rounded-2xl border p-4 text-left transition ${patientMode === 'new' ? 'border-clinical-300 bg-clinical-50 ring-4 ring-clinical-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <p className="font-black text-slate-950">New Patient</p>
                <p className="text-sm text-slate-500">Create a patient record during order submission.</p>
              </button>
            </div>

            {patientMode === 'existing' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input className={`${inputClass} pl-9`} value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} placeholder="Search patient name, ID, phone, email..." />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Matching existing patients</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500">{patientMatches.length} found</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                    {patientMatches.map((patient) => (
                      <button key={patient.id} type="button" onClick={() => setSelectedPatientId(patient.id)} className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 transition ${selectedPatientId === patient.id ? 'bg-clinical-50 ring-2 ring-inset ring-clinical-200' : 'hover:bg-slate-50'}`}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-slate-950">{patient.fullName}</p>
                          <p className="truncate text-xs font-semibold text-slate-500">{patient.id} · {patient.gender} · {calculateAge(patient.dateOfBirth)} yrs</p>
                        </div>
                        <div className="hidden min-w-[190px] text-right text-xs font-semibold text-slate-400 sm:block">
                          <p className="truncate">{patient.phone || 'No phone'}</p>
                          <p className="truncate">{patient.email || 'No email'}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${selectedPatientId === patient.id ? 'bg-clinical-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{selectedPatientId === patient.id ? 'Selected' : 'Select'}</span>
                      </button>
                    ))}
                    {patientMatches.length === 0 && <p className="p-4 text-sm font-semibold text-slate-500">No matching patients found.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Full Name"><input className={inputClass} value={newPatient.fullName} onChange={(event) => setNewPatient({ ...newPatient, fullName: event.target.value })} /></FormField>
                <FormField label="Date of Birth"><input className={inputClass} type="date" value={newPatient.dateOfBirth} onChange={(event) => setNewPatient({ ...newPatient, dateOfBirth: event.target.value })} /></FormField>
                <FormField label="Gender"><select className={inputClass} value={newPatient.gender} onChange={(event) => setNewPatient({ ...newPatient, gender: event.target.value })}><option>Female</option><option>Male</option><option>Other</option></select></FormField>
                <FormField label="Phone"><input className={inputClass} value={newPatient.phone} onChange={(event) => setNewPatient({ ...newPatient, phone: event.target.value })} /></FormField>
                <FormField label="Email"><input className={inputClass} value={newPatient.email} onChange={(event) => setNewPatient({ ...newPatient, email: event.target.value })} /></FormField>
                <FormField label="National ID / Passport"><input className={inputClass} value={newPatient.nationalId} onChange={(event) => setNewPatient({ ...newPatient, nationalId: event.target.value })} /></FormField>
                <FormField label="Address"><input className={inputClass} value={newPatient.address} onChange={(event) => setNewPatient({ ...newPatient, address: event.target.value })} /></FormField>
                <FormField label="Emergency Contact"><input className={inputClass} value={newPatient.emergencyContact} onChange={(event) => setNewPatient({ ...newPatient, emergencyContact: event.target.value })} /></FormField>
                <FormField label="Known allergies / conditions" className="md:col-span-2"><textarea className={inputClass} rows={3} value={newPatient.allergies} onChange={(event) => setNewPatient({ ...newPatient, allergies: event.target.value })} /></FormField>
                {duplicateCandidates.length > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 md:col-span-2">Possible duplicate patient found: {duplicateCandidates.map((p) => p.fullName).join(', ')}</div>}
              </div>
            )}
          </Card>

          <Card title="2. Tests / Scans" subtitle="Add multiple lab tests and scans for one patient. Doctors cannot see prices.">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-black text-slate-950">Selected investigations</p>
                <p className="text-sm text-slate-500">{chosenCatalogItems.length} item(s) selected · Expected completion {expected ? formatDateTime(expected) : '—'}</p>
              </div>
              <Button type="button" onClick={() => setCatalogOpen(true)}><Plus className="h-4 w-4" /> Add Test / Scan</Button>
            </div>

            {sameDayDuplicates.length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex gap-2 font-black"><AlertTriangle className="h-5 w-5" /> Same-day duplicate warning</div>
                <p className="mt-1">This patient has already been ordered for one or more of these selected investigations today. Review before submitting.</p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {chosenCatalogItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-950">{item.name}</p><StatusBadge status={item.type} /></div>
                    <p className="text-sm text-slate-500">{item.id} · {item.department === 'Imaging' ? 'Radiology / Scan' : item.department} · ETA {item.expectedHours}h</p>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {chosenCatalogItems.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">No tests or scans selected yet.</div>}
            </div>
          </Card>

          <Card title="3. Clinical Context" subtitle="Add urgency and notes for the receiving departments.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Urgency"><select className={inputClass} value={urgency} onChange={(event) => setUrgency(event.target.value)}><option>Routine</option><option>Urgent</option></select></FormField>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Expected completion</p><p className="mt-1 font-black text-slate-950">{expected ? formatDateTime(expected) : 'Select tests/scans first'}</p></div>
              <FormField label="Clinical Notes" className="md:col-span-2"><textarea className={inputClass} rows={4} value={clinicalNotes} onChange={(event) => setClinicalNotes(event.target.value)} placeholder="Clinical indication, patient history, and special instructions..." /></FormField>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Order Summary" subtitle="Review before submitting." compact>
            <div className="space-y-4 text-sm">
              <div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Patient</p><p className="font-black text-slate-950">{patientMode === 'existing' ? selectedPatient?.fullName || 'None selected' : newPatient.fullName || 'New patient'}</p></div>
              <div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Doctor</p><p className="font-black text-slate-950">{doctor?.name}</p><p className="text-slate-500">{hospital?.name}</p></div>
              <div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Items</p><p className="font-black text-slate-950">{chosenCatalogItems.length}</p><p className="text-slate-500">{chosenCatalogItems.map((item) => item.name).join(', ') || 'No items selected'}</p></div>
              <div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Urgency</p><StatusBadge status={urgency} /></div>
              <Button type="submit" className="w-full"><ClipboardList className="h-4 w-4" /> Review Order</Button>
            </div>
          </Card>

          <Card title="Backend-ready flow" subtitle="This frontend flow maps directly to future backend APIs." compact>
            <ol className="space-y-2 text-sm font-semibold text-slate-600">
              <li>1. Select patient</li><li>2. Add investigations</li><li>3. Confirm order</li><li>4. Reception routes to departments</li><li>5. Results return to doctor</li>
            </ol>
          </Card>

          <Card title="Price privacy" subtitle="Doctors and clinicians cannot view lab or scan prices." compact>
            <p className="text-sm leading-6 text-slate-600">Pricing is only visible to Finance and Reception. This order form shows clinical catalog details, expected completion time, and department routing only.</p>
          </Card>
        </aside>
      </form>

      <CatalogSearchModal open={catalogOpen} onClose={() => setCatalogOpen(false)} catalog={data.catalog || []} selectedItems={selectedItems} toggleItem={toggleItem} clearItems={() => setSelectedItems([])} />
      <ReviewOrderModal open={reviewOpen} onClose={() => setReviewOpen(false)} onConfirm={confirmSubmitOrder} patient={selectedPatient} newPatient={newPatient} patientMode={patientMode} doctor={doctor} hospital={hospital} items={chosenCatalogItems} urgency={urgency} clinicalNotes={clinicalNotes} expected={expected} duplicateOrders={sameDayDuplicates} />
    </div>
  );
}
