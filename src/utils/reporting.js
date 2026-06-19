import { formatDateTime, money } from './formatters';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

export function openReportPrintWindow(input) {
  const order = input.order || input;
  const patient = input.patient || order.patient;
  const doctor = input.doctor || order.doctor;
  const hospital = input.hospital || order.hospital;
  const items = input.items || order.items || [];
  const results = input.results || order.results || [];
  const invoice = input.invoice || order.invoice;
  const resultReport = input.resultReport || order.resultReport;

  const rows = results.flatMap((result) => {
    if (result.parameters?.length) {
      return result.parameters.map((parameter) => `
        <tr>
          <td>${escapeHtml(result.department)}</td>
          <td>${escapeHtml(parameter.name)}</td>
          <td>${escapeHtml(parameter.value)} ${escapeHtml(parameter.unit)}</td>
          <td>${escapeHtml(parameter.referenceRange)}</td>
          <td class="${parameter.flag === 'Normal' ? 'normal' : 'abnormal'}">${escapeHtml(parameter.flag || '—')}</td>
        </tr>`);
    }
    return [`
      <tr>
        <td>${escapeHtml(result.department)}</td>
        <td colspan="3">${escapeHtml(result.reportText || 'Report attached')}</td>
        <td class="normal">Final</td>
      </tr>`];
  }).join('');

  const html = `<!doctype html>
  <html><head><title>${escapeHtml(order.id)} Report</title><style>
  body{font-family:Inter,Arial,sans-serif;margin:40px;color:#0f172a}.letterhead{border-bottom:4px solid #0ea5e9;padding-bottom:18px;margin-bottom:24px}.brand{font-size:28px;font-weight:900;color:#0369a1}.muted{color:#64748b;font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}.box{border:1px solid #e2e8f0;border-radius:16px;padding:14px}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border-bottom:1px solid #e2e8f0;padding:10px;text-align:left;font-size:13px}th{background:#f8fafc;text-transform:uppercase;font-size:11px;color:#64748b}.abnormal{color:#dc2626;font-weight:800}.normal{color:#059669;font-weight:800}.footer{margin-top:32px;font-size:12px;color:#64748b}@media print{button{display:none}body{margin:24px}}</style></head>
  <body>
    <button onclick="window.print()" style="float:right;padding:10px 16px;border:0;border-radius:12px;background:#0284c7;color:white;font-weight:800">Print / Save as PDF</button>
    <div class="letterhead"><div class="brand">Diagnosis Center</div><div class="muted">Final diagnostic report · ${escapeHtml(order.id)}${resultReport?.id ? ` · Report ${escapeHtml(resultReport.id)}` : ''}</div></div>
    <div class="grid">
      <div class="box"><strong>Patient</strong><br>${escapeHtml(patient?.fullName)}<br><span class="muted">${escapeHtml(patient?.id)} · ${escapeHtml(patient?.gender)} · DOB ${escapeHtml(patient?.dateOfBirth)}</span></div>
      <div class="box"><strong>Referring Doctor</strong><br>${escapeHtml(doctor?.name)}<br><span class="muted">${escapeHtml(doctor?.specialty)} · License ${escapeHtml(doctor?.licenseNumber)}</span></div>
      <div class="box"><strong>Hospital</strong><br>${escapeHtml(hospital?.name)}<br><span class="muted">Billing: ${escapeHtml(hospital?.billingContact)}</span></div>
      <div class="box"><strong>Order Details</strong><br>${escapeHtml(items.map((item) => item.name).join(', '))}<br><span class="muted">Released: ${escapeHtml(formatDateTime(order.updatedAt))} · Invoice: ${escapeHtml(money(invoice?.amount || 0))}</span></div>
    </div>
    <h2>Results</h2>
    <table><thead><tr><th>Department</th><th>Parameter / Report</th><th>Value</th><th>Reference Range</th><th>Flag</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No final result parameters available.</td></tr>'}</tbody></table>
    <div class="footer">Generated from the Diagnosis Center Platform.${resultReport?.secureToken ? ` Secure report token: ${escapeHtml(resultReport.secureToken)}.` : ''} SMS notifications must not include patient-identifying clinical data.</div>
  </body></html>`;
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
