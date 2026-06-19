export const MODEL_FIELDS = {
  Patient: [
    'id','fullName','dateOfBirth','gender','phone','email','address','nationalId',
    'referringHospitalId','referringDoctorId','insuranceProvider','policyNumber',
    'emergencyContact','allergies','createdAt','updatedAt'
  ],
  Doctor: ['id','name','specialty','hospitalId','licenseNumber','email','phone','notificationPreferences'],
  Hospital: ['id','name','billingContact','accountStatus','phone'],
  Order: [
    'id','patientId','doctorId','hospitalId','itemIds','urgency','clinicalNotes','status',
    'billingStatus','createdAt','updatedAt','expectedCompletionAt','routedDepartments','timeline','cancellationReason'
  ],
  Result: ['id','orderId','department','status','parameters','reportText','approvedBy','approvedAt','createdAt'],
  Invoice: ['id','orderId','amount','tax','discount','status','method','insuranceReference','transactions','createdAt','updatedAt'],
  AuditLog: ['id','actor','role','action','module','entityId','timestamp','details'],
  Notification: ['id','title','body','audience','channel','status','read','createdAt','entityId']
};
