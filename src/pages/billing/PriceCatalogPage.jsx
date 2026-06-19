import { useState } from 'react';
import { ClipboardList, DollarSign, FlaskConical, ScanLine } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { useAppStore } from '../../store/AppStore';
import { money } from '../../utils/formatters';

export function PriceCatalogPage() {
  const { state, dispatch } = useAppStore();
  const canEdit = ['billing', 'admin'].includes(state.auth?.role);
  const [itemId, setItemId] = useState(state.data.catalog[0]?.id || '');
  const item = state.data.catalog.find((entry) => entry.id === itemId);
  const [form, setForm] = useState({ price: item?.price || 0, expectedHours: item?.expectedHours || 4 });

  function selectItem(id) {
    const selected = state.data.catalog.find((entry) => entry.id === id);
    setItemId(id);
    setForm({ price: selected?.price || 0, expectedHours: selected?.expectedHours || 4 });
  }

  function submit(event) {
    event.preventDefault();
    if (!canEdit) return;
    dispatch({ type: 'UPDATE_CATALOG_PRICE', payload: { itemId, price: form.price, expectedHours: form.expectedHours } });
  }

  const labCount = state.data.catalog.filter((entry) => entry.type === 'Lab').length;
  const scanCount = state.data.catalog.filter((entry) => entry.type === 'Scan').length;
  const catalogValue = state.data.catalog.reduce((sum, entry) => sum + Number(entry.price || 0), 0);

  return (
    <div>
      <PageHeader eyebrow="Section 9 — Billing / Finance" title="Test / Scan Price Catalog" description="Finance and reception can view prices. Only Billing/Admin can edit catalog pricing and expected completion settings." />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Lab items" value={labCount} icon={FlaskConical} tone="green" />
        <MetricCard label="Scan items" value={scanCount} icon={ScanLine} tone="purple" />
        <MetricCard label="Catalog price sum" value={money(catalogValue)} icon={DollarSign} tone="blue" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card title={canEdit ? 'Edit catalog item' : 'Selected catalog item'} subtitle={canEdit ? 'Updates are audit-logged for finance/admin oversight.' : 'Reception has view-only access to prices for front-desk billing conversations.'}>
          <form onSubmit={submit} className="space-y-4">
            <FormField label="Catalog item"><select className={inputClass} value={itemId} onChange={(event) => selectItem(event.target.value)}>{state.data.catalog.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></FormField>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="font-black text-slate-900">{item?.name}</p><p className="mt-1 text-sm text-slate-500">{item?.type} • {item?.department} {item?.modality ? `• ${item.modality}` : ''}</p></div>
            <FormField label="Current price"><input type="number" step="0.01" className={inputClass} value={form.price} disabled={!canEdit} onChange={(event) => setForm({ ...form, price: event.target.value })} /></FormField>
            <FormField label="Expected hours"><input type="number" className={inputClass} value={form.expectedHours} disabled={!canEdit} onChange={(event) => setForm({ ...form, expectedHours: event.target.value })} /></FormField>
            {canEdit ? <Button type="submit"><ClipboardList className="h-4 w-4" /> Save Catalog Item</Button> : <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Reception can view pricing but cannot edit catalog values.</div>}
          </form>
        </Card>
        <Card title="Billable item list" subtitle="Grouped by department and used by doctor orders, invoices, lab queues and scan queues.">
          <DataTable columns={[{ key: 'id', label: 'Code' }, { key: 'name', label: 'Item' }, { key: 'type', label: 'Type', render: (row) => <StatusBadge status={row.type} /> }, { key: 'department', label: 'Department' }, { key: 'modality', label: 'Modality', render: (row) => row.modality || '—' }, { key: 'price', label: 'Price', render: (row) => money(row.price) }, { key: 'expectedHours', label: 'Expected Hours' }, { key: 'parameters', label: 'Parameters', render: (row) => row.parameters?.length || 0 }, { key: 'actions', label: 'Action', render: (row) => <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => selectItem(row.id)}>{canEdit ? 'Edit' : 'View'}</Button> }]} rows={state.data.catalog} />
        </Card>
      </div>
    </div>
  );
}
