import { computeExpectedCompletion, getOrderDepartments } from '../workflow/workflowEngine';

const createdOne = '2026-06-17T10:15:00Z';
const createdTwo = '2026-06-17T11:30:00Z';
const createdThree = '2026-06-17T07:45:00Z';
const createdFour = '2026-06-16T13:00:00Z';

const catalog = [
  { id: 't1', type: 'Lab', name: 'Full Blood Count (FBC)', department: 'Laboratory', modality: '', price: 80, expectedHours: 6, searchText: 'FBC CBC Full Blood Count', parameters: [
    { name: 'WBC', unit: 'x10^9/L', referenceRange: '4.0 - 11.0', low: 4.0, high: 11.0 },
    { name: 'RBC', unit: 'x10^12/L', referenceRange: 'Male 4.5 - 6.5 / Female 3.8 - 5.8', low: 3.8, high: 6.5 },
    { name: 'Hemoglobin', unit: 'g/dL', referenceRange: 'Male 13.0 - 17.5 / Female 12.0 - 15.5', low: 12.0, high: 17.5 },
    { name: 'Hematocrit', unit: '%', referenceRange: 'Male 38 - 50 / Female 36 - 44', low: 36.0, high: 50.0 },
    { name: 'Platelets', unit: 'x10^9/L', referenceRange: '150 - 400', low: 150, high: 400 },
    { name: 'MCV', unit: 'fL', referenceRange: '80 - 100', low: 80, high: 100 },
    { name: 'MCH', unit: 'pg', referenceRange: '27 - 33', low: 27, high: 33 }
  ] },
  { id: 't2', type: 'Lab', name: 'Urinalysis', department: 'Laboratory', modality: '', price: 50, expectedHours: 4, searchText: 'Urine Dipstick Urinalysis', parameters: [
    { name: 'pH', unit: '', referenceRange: '4.5 - 8.0', low: 4.5, high: 8.0 },
    { name: 'Specific Gravity', unit: '', referenceRange: '1.005 - 1.030', low: 1.005, high: 1.030 }
  ] },
  { id: 't3', type: 'Lab', name: 'Liver Function Test (LFT)', department: 'Laboratory', modality: '', price: 120, expectedHours: 8, searchText: 'LFT Liver Function ALT AST Bilirubin Albumin', parameters: [
    { name: 'ALT (SGPT)', unit: 'U/L', referenceRange: '7 - 56', low: 7, high: 56 },
    { name: 'AST (SGOT)', unit: 'U/L', referenceRange: '10 - 40', low: 10, high: 40 },
    { name: 'ALP', unit: 'U/L', referenceRange: '44 - 147', low: 44, high: 147 },
    { name: 'Total Bilirubin', unit: 'mg/dL', referenceRange: '0.1 - 1.2', low: 0.1, high: 1.2 },
    { name: 'Albumin', unit: 'g/dL', referenceRange: '3.5 - 5.5', low: 3.5, high: 5.5 }
  ] },
  { id: 't4', type: 'Lab', name: 'Renal Function Test (RFT)', department: 'Laboratory', modality: '', price: 120, expectedHours: 8, searchText: 'RFT Renal Kidney Urea Creatinine eGFR', parameters: [
    { name: 'Creatinine', unit: 'mg/dL', referenceRange: 'Male 0.7 - 1.3 / Female 0.6 - 1.1', low: 0.6, high: 1.3 },
    { name: 'BUN/Urea', unit: 'mg/dL', referenceRange: '7 - 20', low: 7, high: 20 },
    { name: 'eGFR', unit: 'mL/min', referenceRange: '90 - 120', low: 90, high: 120 }
  ] },
  { id: 't5', type: 'Lab', name: 'Lipid Profile', department: 'Laboratory', modality: '', price: 100, expectedHours: 8, searchText: 'Lipid Cholesterol HDL LDL Triglycerides', parameters: [
    { name: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '< 200', low: 0, high: 200 },
    { name: 'HDL', unit: 'mg/dL', referenceRange: 'Male > 40 / Female > 50', low: 40, high: 200 },
    { name: 'LDL', unit: 'mg/dL', referenceRange: '< 100', low: 0, high: 100 },
    { name: 'Triglycerides', unit: 'mg/dL', referenceRange: '< 150', low: 0, high: 150 }
  ] },
  { id: 't6', type: 'Lab', name: 'Blood Glucose (FBS/RBS)', department: 'Laboratory', modality: '', price: 40, expectedHours: 4, searchText: 'Glucose FBS RBS Blood Sugar', parameters: [{ name: 'Blood Glucose', unit: 'mmol/L', referenceRange: '3.9 - 5.6', low: 3.9, high: 5.6 }] },
  { id: 't7', type: 'Lab', name: 'Malaria Test (RDT/Film)', department: 'Laboratory', modality: '', price: 30, expectedHours: 3, searchText: 'Malaria RDT Film Parasite', parameters: [{ name: 'Malaria Parasite', unit: '', referenceRange: 'Negative', low: null, high: null }] },
  { id: 't8', type: 'Lab', name: 'Widal Test', department: 'Laboratory', modality: '', price: 60, expectedHours: 4, searchText: 'Widal Typhoid', parameters: [{ name: 'Widal Titre', unit: '', referenceRange: 'Non-significant titre', low: null, high: null }] },
  { id: 't9', type: 'Lab', name: 'Hepatitis B Screening', department: 'Laboratory', modality: '', price: 80, expectedHours: 4, searchText: 'HBsAg Hepatitis B Screening', parameters: [{ name: 'HBsAg', unit: '', referenceRange: 'Negative', low: null, high: null }] },
  { id: 't10', type: 'Lab', name: 'HIV Screening', department: 'Laboratory', modality: '', price: 60, expectedHours: 4, searchText: 'HIV Screening', parameters: [{ name: 'HIV 1/2', unit: '', referenceRange: 'Negative', low: null, high: null }] },
  { id: 't11', type: 'Lab', name: 'Semen Analysis', department: 'Laboratory', modality: '', price: 100, expectedHours: 10, searchText: 'Semen Analysis Fertility', parameters: [
    { name: 'Volume', unit: 'mL', referenceRange: '1.5 - 6.0', low: 1.5, high: 6.0 },
    { name: 'Sperm Count', unit: 'million/mL', referenceRange: '> 15', low: 15, high: null },
    { name: 'Motility', unit: '%', referenceRange: '> 40', low: 40, high: null }
  ] },
  { id: 't12', type: 'Lab', name: 'Pregnancy Test (HCG)', department: 'Laboratory', modality: '', price: 30, expectedHours: 2, searchText: 'Pregnancy HCG', parameters: [{ name: 'HCG', unit: '', referenceRange: 'Negative / Positive', low: null, high: null }] },
  { id: 't13', type: 'Lab', name: 'Thyroid Function Test', department: 'Laboratory', modality: '', price: 150, expectedHours: 12, searchText: 'TFT Thyroid TSH T3 T4', parameters: [
    { name: 'TSH', unit: 'mIU/L', referenceRange: '0.4 - 4.0', low: 0.4, high: 4.0 },
    { name: 'Free T4', unit: 'ng/dL', referenceRange: '0.8 - 1.8', low: 0.8, high: 1.8 },
    { name: 'Free T3', unit: 'pg/mL', referenceRange: '2.3 - 4.2', low: 2.3, high: 4.2 }
  ] },
  { id: 't14', type: 'Scan', name: 'CT Scan - Head', department: 'Imaging', modality: 'CT', price: 800, expectedHours: 18, searchText: 'CT Head Brain Radiology', parameters: [] },
  { id: 't15', type: 'Scan', name: 'CT Scan - Chest', department: 'Imaging', modality: 'CT', price: 900, expectedHours: 18, searchText: 'CT Chest Radiology', parameters: [] },
  { id: 't16', type: 'Scan', name: 'CT Scan - Abdomen', department: 'Imaging', modality: 'CT', price: 1000, expectedHours: 24, searchText: 'CT Abdomen Radiology', parameters: [] },
  { id: 't17', type: 'Scan', name: 'X-Ray - Chest', department: 'Imaging', modality: 'X-Ray', price: 150, expectedHours: 12, searchText: 'Chest Xray X-Ray Radiology', parameters: [] },
  { id: 't18', type: 'Scan', name: 'X-Ray - Spine', department: 'Imaging', modality: 'X-Ray', price: 200, expectedHours: 12, searchText: 'Spine Xray X-Ray Radiology', parameters: [] },
  { id: 't19', type: 'Scan', name: 'Ultrasound - Abdomen', department: 'Imaging', modality: 'Ultrasound', price: 250, expectedHours: 24, searchText: 'Abdominal Ultrasound Scan Radiology', parameters: [] },
  { id: 't20', type: 'Scan', name: 'Ultrasound - Pelvic', department: 'Imaging', modality: 'Ultrasound', price: 250, expectedHours: 24, searchText: 'Pelvic Ultrasound Scan Radiology', parameters: [] },
  { id: 't21', type: 'Scan', name: 'Ultrasound - Obstetric', department: 'Imaging', modality: 'Ultrasound', price: 300, expectedHours: 24, searchText: 'Obstetric Ultrasound Pregnancy Scan Radiology', parameters: [] },
  { id: 't22', type: 'Scan', name: 'Echocardiography', department: 'Imaging', modality: 'Echo', price: 500, expectedHours: 24, searchText: 'Echo Echocardiography Cardiac Ultrasound', parameters: [] }
];

const baseOrders = [
  {
    id: 'ORD-2026-0001',
    patientId: 'PAT-0001',
    doctorId: 'DOC-001',
    hospitalId: 'HOSP-001',
    itemIds: ['t1','t6'],
    urgency: 'Routine',
    clinicalNotes: 'Fever and fatigue. Rule out infection and glucose abnormality.',
    status: 'Submitted',
    billingStatus: 'Payment Pending',
    createdAt: createdOne,
    updatedAt: createdOne,
    expectedCompletionAt: computeExpectedCompletion(createdOne, ['t1','t6'], catalog, 'Routine'),
    routedDepartments: getOrderDepartments({ itemIds: ['t1','t6'] }, catalog),
    timeline: [{ status: 'Submitted', actor: 'Dr. Abena Mensah', role: 'doctor', timestamp: createdOne }]
  },
  {
    id: 'ORD-2026-0002',
    patientId: 'PAT-0002',
    doctorId: 'DOC-001',
    hospitalId: 'HOSP-001',
    itemIds: ['t17'],
    urgency: 'Urgent',
    clinicalNotes: 'Persistent cough, urgent chest imaging requested.',
    status: 'Confirmed',
    billingStatus: 'Paid',
    createdAt: createdTwo,
    updatedAt: '2026-06-17T11:45:00Z',
    expectedCompletionAt: computeExpectedCompletion(createdTwo, ['t17'], catalog, 'Urgent'),
    routedDepartments: getOrderDepartments({ itemIds: ['t17'] }, catalog),
    timeline: [
      { status: 'Submitted', actor: 'Dr. Abena Mensah', role: 'doctor', timestamp: createdTwo },
      { status: 'Confirmed', actor: 'Grace Osei', role: 'receptionist', timestamp: '2026-06-17T11:45:00Z' }
    ]
  },
  {
    id: 'ORD-2026-0003',
    patientId: 'PAT-0003',
    doctorId: 'DOC-002',
    hospitalId: 'HOSP-002',
    itemIds: ['t3','t19'],
    urgency: 'Routine',
    clinicalNotes: 'Abdominal discomfort and jaundice history. Request LFT and ultrasound.',
    status: 'Pending Review',
    billingStatus: 'Insurance Pending',
    createdAt: createdThree,
    updatedAt: '2026-06-17T12:20:00Z',
    expectedCompletionAt: computeExpectedCompletion(createdThree, ['t3','t19'], catalog, 'Routine'),
    routedDepartments: getOrderDepartments({ itemIds: ['t3','t19'] }, catalog),
    timeline: [
      { status: 'Submitted', actor: 'Dr. Michael Nortey', role: 'doctor', timestamp: createdThree },
      { status: 'Confirmed', actor: 'Grace Osei', role: 'receptionist', timestamp: '2026-06-17T08:10:00Z' },
      { status: 'In Progress', actor: 'Kwame Adu', role: 'lab', timestamp: '2026-06-17T09:05:00Z' },
      { status: 'Pending Review', actor: 'Ama Boateng', role: 'scan', timestamp: '2026-06-17T12:20:00Z' }
    ]
  },
  {
    id: 'ORD-2026-0004',
    patientId: 'PAT-0001',
    doctorId: 'DOC-001',
    hospitalId: 'HOSP-001',
    itemIds: ['t1'],
    urgency: 'Routine',
    clinicalNotes: 'Follow-up CBC after treatment. Release result to referring doctor.',
    status: 'Final / Released',
    billingStatus: 'Paid',
    createdAt: createdFour,
    updatedAt: '2026-06-16T18:30:00Z',
    expectedCompletionAt: computeExpectedCompletion(createdFour, ['t1'], catalog, 'Routine'),
    routedDepartments: getOrderDepartments({ itemIds: ['t1'] }, catalog),
    timeline: [
      { status: 'Submitted', actor: 'Dr. Abena Mensah', role: 'doctor', timestamp: createdFour },
      { status: 'Confirmed', actor: 'Grace Osei', role: 'receptionist', timestamp: '2026-06-16T13:20:00Z' },
      { status: 'In Progress', actor: 'Kwame Adu', role: 'lab', timestamp: '2026-06-16T14:00:00Z' },
      { status: 'Pending Review', actor: 'Senior Lab Tech', role: 'lab', timestamp: '2026-06-16T17:40:00Z' },
      { status: 'Final / Released', actor: 'Dr. Pathologist', role: 'lab', timestamp: '2026-06-16T18:30:00Z' }
    ]
  },
  {
    id: 'ORD-2026-0005',
    patientId: 'PAT-0001',
    doctorId: 'DOC-001',
    hospitalId: 'HOSP-001',
    itemIds: ['t1'],
    urgency: 'Routine',
    clinicalNotes: 'Earlier CBC baseline for progress trend.',
    status: 'Final / Released',
    billingStatus: 'Paid',
    createdAt: '2026-05-22T09:00:00Z',
    updatedAt: '2026-05-22T14:10:00Z',
    expectedCompletionAt: computeExpectedCompletion('2026-05-22T09:00:00Z', ['t1'], catalog, 'Routine'),
    routedDepartments: getOrderDepartments({ itemIds: ['t1'] }, catalog),
    timeline: [
      { status: 'Submitted', actor: 'Dr. Abena Mensah', role: 'doctor', timestamp: '2026-05-22T09:00:00Z' },
      { status: 'Final / Released', actor: 'Dr. Pathologist', role: 'lab', timestamp: '2026-05-22T14:10:00Z' }
    ]
  },
  {
    id: 'ORD-2026-0006',
    patientId: 'PAT-0001',
    doctorId: 'DOC-001',
    hospitalId: 'HOSP-001',
    itemIds: ['t1'],
    urgency: 'Routine',
    clinicalNotes: 'Second CBC follow-up for line chart progress.',
    status: 'Final / Released',
    billingStatus: 'Paid',
    createdAt: '2026-06-03T10:00:00Z',
    updatedAt: '2026-06-03T15:30:00Z',
    expectedCompletionAt: computeExpectedCompletion('2026-06-03T10:00:00Z', ['t1'], catalog, 'Routine'),
    routedDepartments: getOrderDepartments({ itemIds: ['t1'] }, catalog),
    timeline: [
      { status: 'Submitted', actor: 'Dr. Abena Mensah', role: 'doctor', timestamp: '2026-06-03T10:00:00Z' },
      { status: 'Final / Released', actor: 'Dr. Pathologist', role: 'lab', timestamp: '2026-06-03T15:30:00Z' }
    ]
  }
];

export const seedData = {
  hospitals: [
    {
      id: 'HOSP-001',
      name: 'St. Raphael Hospital',
      billingContact: 'accounts@straphael.example',
      accountStatus: 'Active',
      phone: '+233 20 000 1001',
      address: 'Airport Residential Area, Accra'
    },
    {
      id: 'HOSP-002',
      name: 'North Ridge Medical Centre',
      billingContact: 'finance@northridge.example',
      accountStatus: 'Active',
      phone: '+233 20 000 1002',
      address: 'North Ridge, Accra'
    }
  ],
  doctors: [
    {
      id: 'DOC-001',
      name: 'Dr. Abena Mensah',
      specialty: 'Internal Medicine',
      hospitalId: 'HOSP-001',
      licenseNumber: 'MDC/RN/2024/18492',
      email: 'abena.mensah@straphael.example',
      phone: '+233 24 555 0101',
      notificationPreferences: { email: true, sms: true }
    },
    {
      id: 'DOC-002',
      name: 'Dr. Michael Nortey',
      specialty: 'Gastroenterology',
      hospitalId: 'HOSP-002',
      licenseNumber: 'MDC/RN/2023/11002',
      email: 'michael.nortey@northridge.example',
      phone: '+233 24 555 0102',
      notificationPreferences: { email: true, sms: false }
    }
  ],
  users: [
    { id: 'USR-001', name: 'Dr. Abena Mensah', role: 'doctor', status: 'Active', linkedDoctorId: 'DOC-001' },
    { id: 'USR-002', name: 'Grace Osei', role: 'receptionist', status: 'Active' },
    { id: 'USR-003', name: 'Kwame Adu', role: 'lab', status: 'Active' },
    { id: 'USR-004', name: 'Ama Boateng', role: 'scan', status: 'Active' },
    { id: 'USR-005', name: 'Kofi Danquah', role: 'billing', status: 'Active' },
    { id: 'USR-006', name: 'System Admin', role: 'admin', status: 'Active' }
  ],
  departments: [
    { id: 'DEP-001', name: 'Reception', type: 'Front Desk', lead: 'Grace Osei' },
    { id: 'DEP-002', name: 'Laboratory', type: 'Clinical Lab', lead: 'Kwame Adu' },
    { id: 'DEP-003', name: 'Imaging', type: 'Scan Unit', lead: 'Ama Boateng' },
    { id: 'DEP-004', name: 'Billing', type: 'Finance', lead: 'Kofi Danquah' }
  ],
  patients: [
    {
      id: 'PAT-0001',
      fullName: 'Ama Serwaa Boateng',
      dateOfBirth: '1988-04-11',
      gender: 'Female',
      phone: '+233 24 111 2233',
      email: 'ama.serwaa@example.com',
      address: 'East Legon, Accra',
      nationalId: 'GHA-123456789-0',
      referringHospitalId: 'HOSP-001',
      referringDoctorId: 'DOC-001',
      insuranceProvider: 'Premier Health',
      policyNumber: 'PH-49201',
      emergencyContact: 'Yaw Boateng — +233 24 998 8877',
      allergies: 'No known drug allergies',
      createdAt: '2026-06-17T08:00:00Z',
      updatedAt: '2026-06-17T08:00:00Z'
    },
    {
      id: 'PAT-0002',
      fullName: 'Kojo Nyarko',
      dateOfBirth: '1979-09-22',
      gender: 'Male',
      phone: '+233 20 333 4455',
      email: 'kojo.nyarko@example.com',
      address: 'Osu, Accra',
      nationalId: 'GHA-992233111-2',
      referringHospitalId: 'HOSP-001',
      referringDoctorId: 'DOC-001',
      insuranceProvider: '',
      policyNumber: '',
      emergencyContact: 'Akua Nyarko — +233 20 222 1133',
      allergies: 'Hypertension history',
      createdAt: '2026-06-17T09:00:00Z',
      updatedAt: '2026-06-17T09:00:00Z'
    },
    {
      id: 'PAT-0003',
      fullName: 'Nana Yaa Prempeh',
      dateOfBirth: '1994-01-05',
      gender: 'Female',
      phone: '+233 26 777 8899',
      email: 'nana.prempeh@example.com',
      address: 'Adenta, Accra',
      nationalId: 'GHA-202222333-4',
      referringHospitalId: 'HOSP-002',
      referringDoctorId: 'DOC-002',
      insuranceProvider: 'CorporateCare',
      policyNumber: 'CC-7822',
      emergencyContact: 'Kwaku Prempeh — +233 26 888 9900',
      allergies: 'Penicillin allergy',
      createdAt: '2026-06-17T07:30:00Z',
      updatedAt: '2026-06-17T07:30:00Z'
    }
  ],
  catalog,
  orders: baseOrders,
  results: [
    {
      id: 'RES-0003',
      orderId: 'ORD-2026-0004',
      department: 'Laboratory',
      status: 'Final / Released',
      parameters: [
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'Hemoglobin', value: '13.4', unit: 'g/dL', referenceRange: 'Male 13.0 - 17.5 / Female 12.0 - 15.5', flag: 'Normal' },
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'WBC', value: '10.8', unit: 'x10^9/L', referenceRange: '4.0 - 11.0', flag: 'Normal' },
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'Platelets', value: '471', unit: 'x10^9/L', referenceRange: '150 - 400', flag: 'High' }
      ],
      reportText: 'CBC largely stable. Mild thrombocytosis; correlate clinically.',
      approvedBy: 'Dr. Pathologist',
      approvedAt: '2026-06-16T18:30:00Z',
      createdAt: '2026-06-16T17:40:00Z'
    },
    {
      id: 'RES-0005',
      orderId: 'ORD-2026-0005',
      department: 'Laboratory',
      status: 'Final / Released',
      parameters: [
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'Hemoglobin', value: '12.1', unit: 'g/dL', referenceRange: 'Male 13.0 - 17.5 / Female 12.0 - 15.5', low: 12, high: 17.5, flag: 'Normal' },
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'WBC', value: '15.2', unit: 'x10^9/L', referenceRange: '4.0 - 11.0', low: 4, high: 11, flag: 'High' },
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'Platelets', value: '388', unit: 'x10^9/L', referenceRange: '150 - 400', low: 150, high: 400, flag: 'Normal' }
      ],
      reportText: 'Baseline CBC before treatment. Leukocytosis noted.',
      approvedBy: 'Dr. Pathologist',
      approvedAt: '2026-05-22T14:10:00Z',
      createdAt: '2026-05-22T13:50:00Z'
    },
    {
      id: 'RES-0006',
      orderId: 'ORD-2026-0006',
      department: 'Laboratory',
      status: 'Final / Released',
      parameters: [
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'Hemoglobin', value: '12.8', unit: 'g/dL', referenceRange: 'Male 13.0 - 17.5 / Female 12.0 - 15.5', low: 12, high: 17.5, flag: 'Normal' },
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'WBC', value: '12.4', unit: 'x10^9/L', referenceRange: '4.0 - 11.0', low: 4, high: 11, flag: 'High' },
        { testId: 't1', testName: 'Full Blood Count (FBC)', name: 'Platelets', value: '425', unit: 'x10^9/L', referenceRange: '150 - 400', low: 150, high: 400, flag: 'High' }
      ],
      reportText: 'Second CBC follow-up. WBC improving; platelets mildly elevated.',
      approvedBy: 'Dr. Pathologist',
      approvedAt: '2026-06-03T15:30:00Z',
      createdAt: '2026-06-03T15:10:00Z'
    },
    {
      id: 'RES-0001',
      orderId: 'ORD-2026-0003',
      department: 'Laboratory',
      status: 'Pending Review',
      parameters: [
        { testId: 't3', testName: 'Liver Function Test (LFT)', name: 'ALT (SGPT)', value: '72', unit: 'U/L', referenceRange: '7 - 56', flag: 'High' },
        { testId: 't3', testName: 'Liver Function Test (LFT)', name: 'AST (SGOT)', value: '38', unit: 'U/L', referenceRange: '10 - 40', flag: 'Normal' },
        { testId: 't3', testName: 'Liver Function Test (LFT)', name: 'Total Bilirubin', value: '1.6', unit: 'mg/dL', referenceRange: '0.1 - 1.2', flag: 'High' }
      ],
      reportText: 'Elevated ALT and bilirubin. Correlate clinically.',
      approvedBy: '',
      approvedAt: '',
      createdAt: '2026-06-17T12:10:00Z'
    },
    {
      id: 'RES-0002',
      orderId: 'ORD-2026-0003',
      department: 'Imaging',
      status: 'Pending Review',
      parameters: [],
      reportText: 'Abdominal ultrasound shows mild fatty infiltration. No focal lesion seen.',
      approvedBy: '',
      approvedAt: '',
      createdAt: '2026-06-17T12:20:00Z'
    }
  ],
  resultReports: [
    { id: 'RPT-0001', orderId: 'ORD-2026-0004', doctorId: 'DOC-001', hospitalId: 'HOSP-001', status: 'Ready', secureToken: 'seed-final-0004', generatedAt: '2026-06-16T18:31:00Z', generatedBy: 'Dr. Pathologist', downloadedAt: '', downloadedBy: '' },
    { id: 'RPT-0005', orderId: 'ORD-2026-0005', doctorId: 'DOC-001', hospitalId: 'HOSP-001', status: 'Ready', secureToken: 'seed-final-0005', generatedAt: '2026-05-22T14:11:00Z', generatedBy: 'Dr. Pathologist', downloadedAt: '', downloadedBy: '' },
    { id: 'RPT-0006', orderId: 'ORD-2026-0006', doctorId: 'DOC-001', hospitalId: 'HOSP-001', status: 'Ready', secureToken: 'seed-final-0006', generatedAt: '2026-06-03T15:31:00Z', generatedBy: 'Dr. Pathologist', downloadedAt: '', downloadedBy: '' }
  ],
  invoices: [
    { id: 'INV-0004', orderId: 'ORD-2026-0004', amount: 80, tax: 0, discount: 0, status: 'Paid', method: 'Card', insuranceReference: '', transactions: [{ id: 'TXN-0002', amount: 80, method: 'Card', status: 'Paid', shiftId: 'SHIFT-SEED-001', staff: 'Kofi Danquah', createdAt: '2026-06-16T13:30:00Z' }], createdAt: '2026-06-16T13:30:00Z', updatedAt: '2026-06-16T13:30:00Z' },
    { id: 'INV-0005', orderId: 'ORD-2026-0005', amount: 80, tax: 0, discount: 0, status: 'Paid', method: 'Cash', insuranceReference: '', transactions: [{ id: 'TXN-0005', amount: 80, method: 'Cash', status: 'Paid', shiftId: 'SHIFT-SEED-001', staff: 'Kofi Danquah', createdAt: '2026-05-22T09:10:00Z' }], createdAt: '2026-05-22T09:10:00Z', updatedAt: '2026-05-22T09:10:00Z' },
    { id: 'INV-0006', orderId: 'ORD-2026-0006', amount: 80, tax: 0, discount: 0, status: 'Paid', method: 'Mobile Money', insuranceReference: '', transactions: [{ id: 'TXN-0006', amount: 80, method: 'Mobile Money', status: 'Paid', shiftId: 'SHIFT-SEED-001', staff: 'Kofi Danquah', createdAt: '2026-06-03T10:10:00Z' }], createdAt: '2026-06-03T10:10:00Z', updatedAt: '2026-06-03T10:10:00Z' },
    { id: 'INV-0001', orderId: 'ORD-2026-0001', amount: 120, tax: 0, discount: 0, status: 'Pending', method: '', insuranceReference: '', transactions: [], createdAt: '2026-06-17T10:18:00Z', updatedAt: '2026-06-17T10:18:00Z' },
    { id: 'INV-0002', orderId: 'ORD-2026-0002', amount: 150, tax: 0, discount: 0, status: 'Paid', method: 'Transfer', insuranceReference: '', transactions: [{ id: 'TXN-0001', amount: 250, method: 'Transfer', status: 'Paid', shiftId: 'SHIFT-SEED-001', staff: 'Kofi Danquah', createdAt: '2026-06-17T11:40:00Z' }], createdAt: '2026-06-17T11:40:00Z', updatedAt: '2026-06-17T11:40:00Z' },
    { id: 'INV-0003', orderId: 'ORD-2026-0003', amount: 370, tax: 0, discount: 0, status: 'Insurance Pending', method: 'Insurance', insuranceReference: 'CC-CLAIM-001', transactions: [], createdAt: '2026-06-17T08:20:00Z', updatedAt: '2026-06-17T08:20:00Z' }
  ],
  labAnalyzers: ['Sysmex XN-550', 'Cobas c111', 'Mindray BS-240', 'Manual microscopy bench'],
  scanEquipment: [
    { id: 'EQ-XR-01', room: 'X-Ray Room 1', machine: 'Digital X-Ray DRX-1', modality: 'X-ray', status: 'Available' },
    { id: 'EQ-US-01', room: 'Ultrasound Room', machine: 'SonoAce X8', modality: 'Ultrasound', status: 'Available' },
    { id: 'EQ-CT-01', room: 'CT Suite', machine: 'Somatom Go.Now', modality: 'CT', status: 'In Use' },
    { id: 'EQ-MR-01', room: 'MRI Suite', machine: 'Magnetom 1.5T', modality: 'MRI', status: 'Maintenance' }
  ],
  sampleLogs: [
    { id: 'SMP-0001', orderId: 'ORD-2026-0003', sampleType: 'Blood', collectedBy: 'Kwame Adu', collectedAt: '2026-06-17T08:55:00Z', status: 'Accepted', rejectionReason: '' }
  ],
  scanBookings: [
    { id: 'BOOK-0001', orderId: 'ORD-2026-0003', modality: 'Ultrasound', room: 'US Room 1', machine: 'SonoAce X8', bookedAt: '2026-06-17T10:30:00Z', status: 'Accepted', acceptedAt: '2026-06-17T10:30:00Z', acceptedBy: 'Ama Boateng', technicianNotes: 'Patient prepared and scanned without complication.' }
  ],
  scanRejections: [],
  appointments: [
    { id: 'APT-0001', patientId: 'PAT-0002', orderId: 'ORD-2026-0002', scheduledAt: '2026-06-17T14:00:00Z', purpose: 'Chest X-ray visit', room: 'X-Ray Room 1', status: 'Scheduled', notes: 'Urgent imaging slot.', createdAt: '2026-06-17T11:50:00Z', updatedAt: '2026-06-17T11:50:00Z' }
  ],
  dailyVisits: [
    { id: 'VIS-0001', patientId: 'PAT-0003', orderId: 'ORD-2026-0003', checkedInAt: '2026-06-17T08:30:00Z', checkedInBy: 'Grace Osei', identityVerified: true, status: 'Checked In', notes: 'Insurance details verified.' }
  ],
  duplicateFlags: [],
  adjustments: [],
  floatAdjustments: [
    { id: 'FLT-0001', type: 'In', method: 'Cash', amount: 50, description: 'Opening petty cash top-up', staff: 'Kofi Danquah', shiftId: 'SHIFT-SEED-001', createdAt: '2026-06-17T08:05:00Z' }
  ],
  expenses: [
    { id: 'EXP-0001', description: 'CBC reagent purchase', category: 'Purchase Cost', amount: 650, amountPaid: 650, method: 'Bank Transfer', vendor: 'Sysmex GH', reference: 'RCPT-2201', notes: '', status: 'Paid', createdBy: 'Kofi Danquah', createdAt: '2026-06-12T09:10:00Z', updatedAt: '2026-06-12T09:10:00Z', payments: [{ id: 'EXPPAY-0001', amount: 650, method: 'Bank Transfer', staff: 'Kofi Danquah', createdAt: '2026-06-12T09:10:00Z' }] },
    { id: 'EXP-0002', description: 'Courier fees for external samples', category: 'Courier Fees', amount: 180, amountPaid: 80, method: 'Cash', vendor: 'QuickRun Courier', reference: 'CR-904', notes: 'Balance pending', status: 'Partial', createdBy: 'Kofi Danquah', createdAt: '2026-06-15T15:40:00Z', updatedAt: '2026-06-15T15:40:00Z', payments: [{ id: 'EXPPAY-0002', amount: 80, method: 'Cash', staff: 'Kofi Danquah', createdAt: '2026-06-15T15:40:00Z' }] },
    { id: 'EXP-0003', description: 'Software subscription arrears', category: 'Subscription', amount: 240, amountPaid: 0, method: 'Card', vendor: 'Cloud Diagnostics', reference: '', notes: '', status: 'Unpaid', createdBy: 'Kofi Danquah', createdAt: '2026-06-16T12:15:00Z', updatedAt: '2026-06-16T12:15:00Z', payments: [] },
    { id: 'EXP-0004', description: 'Expired consumables written off', category: 'Other', amount: 95, amountPaid: 0, method: 'Cash', vendor: 'Internal', reference: '', notes: '', status: 'Written Off', writeOffReason: 'Expired stock disposal', createdBy: 'Kofi Danquah', createdAt: '2026-06-10T10:00:00Z', updatedAt: '2026-06-10T10:00:00Z', payments: [] }
  ],
  financeShifts: [
    { id: 'SHIFT-SEED-001', startedBy: 'Kofi Danquah', role: 'billing', shiftType: 'Full Day', openingFloat: 300, status: 'Closed', startedAt: '2026-06-17T08:00:00Z', closedAt: '2026-06-17T17:30:00Z', closedBy: 'Kofi Danquah', actualCash: 430, expectedCash: 430, variance: 0, cashTotal: 130, mobileMoneyTotal: 80, cardTotal: 80, transferTotal: 250, insuranceTotal: 0, denominations: { n100: 4, n20: 1, n10: 1 }, notes: 'Seeded closed shift for float review.' }
  ],
  auditLogs: [
    { id: 'AUD-001', actor: 'System', role: 'system', action: 'Seeded section 2 workflow data', module: 'Workflow Engine', entityId: '', timestamp: '2026-06-17T12:00:00Z', details: 'Data model and workflow engine ready.' }
  ],
  notifications: [
    { id: 'NOT-001', title: 'Incoming doctor order', body: 'ORD-2026-0001 is awaiting reception confirmation.', audience: 'receptionist', channel: 'In-platform', status: 'Delivered', read: false, createdAt: '2026-06-17T10:15:00Z', entityId: 'ORD-2026-0001' },
    { id: 'NOT-002', title: 'Review required', body: 'ORD-2026-0003 has results awaiting sign-off.', audience: 'admin', channel: 'In-platform', status: 'Delivered', read: false, createdAt: '2026-06-17T12:20:00Z', entityId: 'ORD-2026-0003' },
    { id: 'NOT-003', title: 'Result released', body: 'ORD-2026-0004 has been finalized. Log in to view the report.', audience: 'doctor', channel: 'In-platform', status: 'Delivered', deliveryType: 'Result Release', read: false, retryCount: 0, maxRetries: 3, createdAt: '2026-06-16T18:31:00Z', deliveredAt: '2026-06-16T18:31:00Z', lastAttemptAt: '2026-06-16T18:31:00Z', entityId: 'ORD-2026-0004' },
    { id: 'NOT-004', title: 'Email result notification queued', body: 'Result ORD-2026-0004 is ready. Log in to view the finalized report.', audience: 'doctor', channel: 'Email', status: 'Delivered', deliveryType: 'Result Release', read: false, retryCount: 0, maxRetries: 3, target: 'abena.mensah@straphael.example', createdAt: '2026-06-16T18:31:00Z', deliveredAt: '2026-06-16T18:32:00Z', lastAttemptAt: '2026-06-16T18:32:00Z', entityId: 'ORD-2026-0004' },
    { id: 'NOT-005', title: 'SMS result alert queued', body: 'A diagnosis center result is ready for order ORD-2026-0004. Please log in to view the finalized report.', audience: 'doctor', channel: 'SMS', status: 'Queued', deliveryType: 'Result Release', read: false, retryCount: 0, maxRetries: 3, target: '+233 24 555 0101', privacyChecked: true, createdAt: '2026-06-16T18:31:00Z', deliveredAt: '', lastAttemptAt: '2026-06-16T18:31:00Z', entityId: 'ORD-2026-0004' }
  ],
  securityEvents: [
    { id: 'SEC-0001', type: 'Security Baseline', actor: 'System', role: 'system', target: 'Security', severity: 'Low', details: 'Security, audit and reliability layer initialized.', acknowledged: true, createdAt: '2026-06-17T12:30:00Z' }
  ],
  backupExports: []
};
