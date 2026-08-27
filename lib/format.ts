export function formatINR(value: number): string {
  const rounded = Math.round(value);
  return '₹' + rounded.toLocaleString('en-IN');
}

export function formatINRDecimal(value: number): string {
  return '₹' + value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

export function formatKm(value: number): string {
  return value.toFixed(1) + ' km';
}
