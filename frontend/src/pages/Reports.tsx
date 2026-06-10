import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Sheet,
  Printer,
  TrendingUp,
  BarChart3,
  CalendarRange,
  Landmark,
  EyeOff,
} from 'lucide-react';
import { reportesAPI } from '../api/reportes';
import type { ResumenReporte } from '../types';
import { formatMoney } from '../lib/format';

const EMPTY: ResumenReporte = {
  blanco: { ingresos: 0, egresos: 0, neto: 0 },
  efectivo: { ingresos: 0, egresos: 0, neto: 0 },
  total_movimientos: 0,
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function weekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Reports() {
  const now = new Date();
  const periodLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const [daily, setDaily] = useState<ResumenReporte>(EMPTY);
  const [weekly, setWeekly] = useState<ResumenReporte>(EMPTY);
  const [monthly, setMonthly] = useState<ResumenReporte>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [wStart, wEnd] = weekRange();
    try {
      const d = await reportesAPI.obtenerReporteDiario(todayISO());
      setDaily(d.resumen ?? EMPTY);
    } catch {
      setDaily(EMPTY);
    }
    try {
      const w = await reportesAPI.obtenerReporteSemanal(wStart, wEnd);
      setWeekly(w.resumen ?? EMPTY);
    } catch {
      setWeekly(EMPTY);
    }
    try {
      const m = await reportesAPI.obtenerReporteMensual(
        now.getFullYear(),
        now.getMonth() + 1
      );
      setMonthly(m.resumen ?? EMPTY);
    } catch {
      setMonthly(EMPTY);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const sumNeto = (r: ResumenReporte) => r.blanco.neto + r.efectivo.neto;
  const sumIngresos = (r: ResumenReporte) =>
    r.blanco.ingresos + r.efectivo.ingresos;
  const sumEgresos = (r: ResumenReporte) => r.blanco.egresos + r.efectivo.egresos;

  const totalBalance = sumNeto(monthly);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-950 tracking-tight">
            Reportes Financieros
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Análisis integral de reconciliación y flujo de caja para el período:{' '}
            <span className="font-semibold text-navy-900">{periodLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm font-medium text-navy-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-white">
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium text-navy-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-white">
            <Sheet className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-navy-950 rounded-lg px-3 py-2 hover:bg-navy-900"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          badge="HOY"
          icon={<TrendingUp className="w-4 h-4 text-mint-600" />}
          title="Neto Diario"
          value={formatMoney(sumNeto(daily))}
          sub={`${formatMoney(sumIngresos(daily))} entrada · ${formatMoney(sumEgresos(daily))} salida`}
          loading={loading}
        />
        <SummaryCard
          badge="SEMANAL"
          icon={<BarChart3 className="w-4 h-4 text-navy-700" />}
          title="Neto Semanal"
          value={formatMoney(sumNeto(weekly))}
          sub={`${weekly.total_movimientos} movimientos`}
          loading={loading}
        />
        <SummaryCard
          badge={periodLabel.toUpperCase()}
          icon={<CalendarRange className="w-4 h-4 text-navy-700" />}
          title="Neto Mensual"
          value={formatMoney(sumNeto(monthly))}
          sub={`${monthly.total_movimientos} movimientos`}
          loading={loading}
          highlight
        />
      </div>

      {/* Reconciliation + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reconciliation */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Landmark className="w-5 h-5 text-navy-700" />
            <h3 className="text-base font-bold text-navy-950">
              Reconciliación de Caja ({periodLabel})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReconRow
              title="Blanco (Fiscal)"
              icon={<Landmark className="w-4 h-4 text-navy-700" />}
              ingresos={monthly.blanco.ingresos}
              egresos={monthly.blanco.egresos}
              neto={monthly.blanco.neto}
            />
            <ReconRow
              title="Efectivo (Blanco)"
              icon={<EyeOff className="w-4 h-4 text-navy-700" />}
              ingresos={monthly.efectivo.ingresos}
              egresos={monthly.efectivo.egresos}
              neto={monthly.efectivo.neto}
            />
          </div>

          <div className="mt-5 rounded-xl bg-navy-950 text-white px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wide">
                Posición Neta (Calculada)
              </p>
              <p className="text-xs text-white/60">
                Total movimientos: {monthly.total_movimientos}
              </p>
            </div>
            <p className="text-2xl font-extrabold font-ledger">
              {formatMoney(totalBalance)}
            </p>
          </div>
        </div>

        {/* Breakdown by stream */}
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-navy-950 mb-4">
            Desglose por Flujo
          </h3>
          <ul className="space-y-3">
            <BreakdownItem
              label="Ingreso Blanco"
              value={formatMoney(monthly.blanco.ingresos)}
              icon={<Landmark className="w-4 h-4 text-navy-700" />}
            />
            <BreakdownItem
              label="Egreso Blanco"
              value={formatMoney(monthly.blanco.egresos)}
              icon={<Landmark className="w-4 h-4 text-navy-700" />}
            />
            <BreakdownItem
              label="Ingreso Efectivo"
              value={formatMoney(monthly.efectivo.ingresos)}
              icon={<EyeOff className="w-4 h-4 text-navy-700" />}
            />
            <BreakdownItem
              label="Egreso Efectivo"
              value={formatMoney(monthly.efectivo.egresos)}
              icon={<EyeOff className="w-4 h-4 text-navy-700" />}
            />
          </ul>
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  badge,
  icon,
  title,
  value,
  sub,
  loading,
  highlight,
}: {
  badge: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 ${
        highlight
          ? 'bg-navy-950 text-white border-navy-950'
          : 'bg-surface border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded ${
            highlight ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-ink-muted'
          }`}
        >
          {badge}
        </span>
        {icon}
      </div>
      <p
        className={`text-sm mb-1 ${highlight ? 'text-white/60' : 'text-ink-muted'}`}
      >
        {title}
      </p>
      <p
        className={`text-3xl font-extrabold font-ledger ${
          highlight ? 'text-white' : 'text-navy-950'
        }`}
      >
        {loading ? '—' : value}
      </p>
      <p
        className={`text-xs mt-2 ${highlight ? 'text-white/50' : 'text-ink-muted'}`}
      >
        {loading ? 'Cargando…' : sub}
      </p>
    </div>
  );
}

function ReconRow({
  title,
  icon,
  ingresos,
  egresos,
  neto,
}: {
  title: string;
  icon: React.ReactNode;
  ingresos: number;
  egresos: number;
  neto: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-semibold text-navy-900">{title}</span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">Ingreso</span>
          <span className="font-semibold text-mint-600 font-ledger">
            {formatMoney(ingresos)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Egreso</span>
          <span className="font-semibold text-negative font-ledger">
            {formatMoney(egresos)}
          </span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-slate-200">
          <span className="text-navy-900 font-medium">Neto</span>
          <span className="font-bold text-navy-950 font-ledger">
            {formatMoney(neto)}
          </span>
        </div>
      </div>
    </div>
  );
}

function BreakdownItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-ink-muted">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-navy-950 font-ledger">{value}</span>
    </li>
  );
}
