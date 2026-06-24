import { LineChart } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { PatientTrendsPanel } from '../../components/ui/PatientTrendsPanel';
import { getDoctorContextFromState } from './doctorUtils';

export function DoctorPatientTrendsPage() {
  const { state } = useAppStore();
  const { data, doctorPatients } = getDoctorContextFromState(state);
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Clinician Portal"
        title="Patient Trends"
        description="Search a referred patient, select a repeated test, then view a line chart showing the patient's progress across multiple visits."
        actions={<LineChart className="h-5 w-5 text-clinical-600" />}
      />
      <PatientTrendsPanel
        data={data}
        allowedPatientIds={doctorPatients.map((patient) => patient.id)}
        title="Repeated Test Progress Chart"
        subtitle="Select a patient and repeated test to view all parameter charts at once, then open any chart in a large popup."
      />
    </div>
  );
}
