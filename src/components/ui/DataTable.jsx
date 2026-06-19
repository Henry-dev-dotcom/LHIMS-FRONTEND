import clsx from 'clsx';
import { SearchX } from 'lucide-react';

function renderCell(column, row) {
  return column.render ? column.render(row) : row[column.key];
}

export function DataTable({ columns, rows, emptyMessage = 'No records found.', dense = false, caption }) {
  const baseMobileColumns = columns.filter((column) => !column.mobileHidden && !column.mobileActions).slice(0, 5);
  const actionColumn = columns.find((column) => column.mobileActions || String(column.key).toLowerCase().includes('action') || String(column.label).toLowerCase().includes('action'));
  const visibleMobileColumns = actionColumn && !baseMobileColumns.includes(actionColumn) ? [...baseMobileColumns, actionColumn] : baseMobileColumns;
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-sm">
      {caption && <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500">{caption}</div>}

      <div className="block divide-y divide-slate-100 md:hidden">
        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-400"><SearchX className="h-5 w-5" /></span>
              <span className="font-semibold">{emptyMessage}</span>
            </div>
          </div>
        ) : rows.map((row, index) => (
          <article key={row.id || index} className="bg-white p-3.5 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Record {index + 1}</p>
              {row.id && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">{row.id}</span>}
            </div>
            <dl className="grid gap-2">
              {visibleMobileColumns.map((column) => (
                <div key={column.key} className={clsx('rounded-2xl bg-slate-50 px-3 py-2', (column.mobileActions || String(column.key).toLowerCase().includes('action') || String(column.label).toLowerCase().includes('action')) && 'bg-clinical-50/70')}>
                  <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{column.label}</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-800 [&_button]:mb-1 [&_button]:mr-1 [&_button]:min-h-10">{renderCell(column, row) ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/90">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-400"><SearchX className="h-5 w-5" /></span>
                    <span className="font-semibold">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : rows.map((row, index) => (
              <tr key={row.id || index} className="transition hover:bg-clinical-50/60">
                {columns.map((column) => (
                  <td key={column.key} className={clsx('whitespace-nowrap px-4 align-middle text-slate-700', dense ? 'py-2.5' : 'py-3.5')}>
                    {renderCell(column, row) ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
