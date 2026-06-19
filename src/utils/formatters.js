export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function money(value) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(Number(value || 0));
}

export function getById(list, id) {
  return list.find((item) => item.id === id);
}
