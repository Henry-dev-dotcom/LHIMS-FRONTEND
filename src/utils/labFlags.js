export function computeResultFlag(value, low, high, criticalLow, criticalHigh) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'No Range';

  const hasCriticalLow = criticalLow !== null && criticalLow !== undefined && criticalLow !== '' && Number.isFinite(Number(criticalLow));
  const hasCriticalHigh = criticalHigh !== null && criticalHigh !== undefined && criticalHigh !== '' && Number.isFinite(Number(criticalHigh));
  if (hasCriticalLow && numeric < Number(criticalLow)) return 'Critical';
  if (hasCriticalHigh && numeric > Number(criticalHigh)) return 'Critical';

  const hasLow = low !== null && low !== undefined && low !== '' && Number.isFinite(Number(low));
  const hasHigh = high !== null && high !== undefined && high !== '' && Number.isFinite(Number(high));
  if (!hasLow && !hasHigh) return 'No Range';
  if (hasLow && numeric < Number(low)) return 'Low';
  if (hasHigh && numeric > Number(high)) return 'High';
  return 'Normal';
}

export function buildParameterEntries(catalogItems = [], values = {}) {
  return catalogItems.flatMap((item) => (item.parameters || []).map((parameter) => {
    const key = `${item.id}::${parameter.name}`;
    const value = values[key] ?? values[parameter.name] ?? '';
    return {
      testId: item.id,
      testName: item.name,
      name: parameter.name,
      value,
      unit: parameter.unit,
      low: parameter.low ?? '',
      high: parameter.high ?? '',
      criticalLow: parameter.criticalLow ?? '',
      criticalHigh: parameter.criticalHigh ?? '',
      referenceRange: parameter.referenceRange,
      flag: value === '' ? 'Pending' : computeResultFlag(value, parameter.low, parameter.high, parameter.criticalLow, parameter.criticalHigh)
    };
  }));
}

export function hasAbnormalFlag(parameters = []) {
  return parameters.some((parameter) => ['High', 'Low', 'Critical'].includes(parameter.flag));
}
