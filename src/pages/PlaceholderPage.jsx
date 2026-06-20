import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';

export function PlaceholderPage({ title, description, section, requirements = [] }) {
  return (
    <div>
      <PageHeader eyebrow={section || 'Module'} title={title} description={description} />
      <Card title="Module overview" subtitle="This workspace is available in the navigation structure and will display the selected operational requirements.">
        <div className="mb-5"><StatusBadge status="Foundation Ready" /></div>
        {requirements.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {requirements.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">{item}</p>
                <p className="mt-1 text-xs text-slate-500">Will be implemented in its dedicated build section.</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
