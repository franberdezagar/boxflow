/** Formatting helpers used across the app */

export function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

const currency = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $1.234,50 (Argentine Pesos) */
export function formatMoney(value: unknown): string {
  return `$${currency.format(toNumber(value))}`;
}

/** +$1.234,50 / -$1.234,50 (sign included) */
export function formatSignedMoney(value: unknown, isIncome: boolean): string {
  const amount = currency.format(Math.abs(toNumber(value)));
  return `${isIncome ? '+' : '-'}$${amount}`;
}

/** 14:22:10 */
export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '--:--:--';
  }
}

/** 24 oct 2023 */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** 08:02 */
export function formatClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export const SHIFT_LABELS: Record<string, { label: string; range: string }> = {
  MAÑANA: { label: 'Mañana (Morning)', range: '08:00 — 16:00' },
  TARDE: { label: 'Tarde (Afternoon)', range: '16:00 — 00:00' },
};
