import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  Landmark,
  Plus,
  Minus,
  Lock,
  Sun,
  CalendarPlus,
  BarChart3,
} from 'lucide-react';
import Topbar from '../components/Topbar';
import type { AppOutletContext } from '../components/Layout';
import { movimientosAPI } from '../api/movimientos';
import { turnosAPI } from '../api/turnos';
import type { Movimiento } from '../types';
import {
  formatMoney,
  formatSignedMoney,
  formatTime,
  toNumber,
  SHIFT_LABELS,
} from '../lib/format';

export default function Dashboard() {
  const { turnoActivo, loadingTurno, refreshTurno } =
    useOutletContext<AppOutletContext>();
  const navigate = useNavigate();

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [busy, setBusy] = useState(false);
  const [nombreTurno, setNombreTurno] = useState('MAÑANA');

  const cargarMovimientos = useCallback(async () => {
    if (!turnoActivo) {
      setMovimientos([]);
      return;
    }
    try {
      const movs = await movimientosAPI.obtenerMovimientosPorTurno(
        turnoActivo.id
      );
      setMovimientos(movs);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
    }
  }, [turnoActivo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarMovimientos();
  }, [cargarMovimientos]);

  const handleAbrirTurno = async () => {
    try {
      setBusy(true);
      await turnosAPI.abrirTurno({ nombre_turno: nombreTurno });
      await refreshTurno();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleCerrarTurno = async () => {
    if (!turnoActivo) return;
    try {
      setBusy(true);
      await turnosAPI.cerrarTurno({
        turno_id: turnoActivo.id,
        efectivo_final_blanco_declarado: toNumber(
          turnoActivo.efectivo_final_blanco_esperado
        ),
        efectivo_final_efectivo_declarado: toNumber(
          turnoActivo.efectivo_final_efectivo_esperado
        ),
      });
      await refreshTurno();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  if (loadingTurno) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-ink-muted">
        Cargando…
      </div>
    );
  }

  // ---- No active shift state ----
  if (!turnoActivo) {
    return (
      <>
        <Topbar title="Panel de Control" />
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center min-h-[24rem] text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
            <CalendarPlus className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="text-xl font-bold text-navy-950 mb-1">
            No hay turno activo
          </h3>
          <p className="text-ink-muted mb-6">
            Abre un turno para comenzar a registrar movimientos
          </p>
          <div className="flex items-center gap-3">
            <select
              value={nombreTurno}
              onChange={(e) => setNombreTurno(e.target.value)}
              className="px-4 py-3 rounded-lg border border-slate-300 text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-300"
            >
              <option value="MAÑANA">Mañana</option>
              <option value="TARDE">Tarde</option>
            </select>
            <button
              onClick={handleAbrirTurno}
              disabled={busy}
              className="bg-navy-950 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-900 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              <Plus className="w-5 h-5" />
              Abrir Turno
            </button>
          </div>
        </div>
      </>
    );
  }

  // ---- Computed totals from movements ----
   const blancoIngresos = movimientos
     .filter((m) => m.condicion_fiscal === 'BLANCO' && m.tipo_movimiento === 'INGRESO')
     .reduce((sum, m) => sum + toNumber(m.monto), 0);
   const blancoEgresos = movimientos
     .filter((m) => m.condicion_fiscal === 'BLANCO' && m.tipo_movimiento === 'EGRESO')
     .reduce((sum, m) => sum + toNumber(m.monto), 0);
    const efectivoBlancoIngresos = movimientos
     .filter((m) => m.condicion_fiscal === 'EFECTIVO_BLANCO' && m.tipo_movimiento === 'INGRESO')
     .reduce((sum, m) => sum + toNumber(m.monto), 0);
   const efectivoBlancoEgresos = movimientos
     .filter((m) => m.condicion_fiscal === 'EFECTIVO_BLANCO' && m.tipo_movimiento === 'EGRESO')
     .reduce((sum, m) => sum + toNumber(m.monto), 0);
   const efectivoNegroIngresos = movimientos
     .filter((m) => m.condicion_fiscal === 'EFECTIVO_NEGRO' && m.tipo_movimiento === 'INGRESO')
     .reduce((sum, m) => sum + toNumber(m.monto), 0);
   const efectivoNegroEgresos = movimientos
     .filter((m) => m.condicion_fiscal === 'EFECTIVO_NEGRO' && m.tipo_movimiento === 'EGRESO')
     .reduce((sum, m) => sum + toNumber(m.monto), 0);

   const totalBlanco = blancoIngresos - blancoEgresos;
   const totalEfectivoBlanco = efectivoBlancoIngresos - efectivoBlancoEgresos;
   const totalEfectivoNegro = efectivoNegroIngresos - efectivoNegroEgresos;
   const posicionNeta = totalBlanco + totalEfectivoBlanco + totalEfectivoNegro;
   const total = Math.abs(posicionNeta) || 1;
   const pctBlanco = posicionNeta !== 0 ? Math.round((Math.abs(totalBlanco) / total) * 100) : 0;
   const pctEfectivoBlanco = posicionNeta !== 0 ? Math.round((Math.abs(totalEfectivoBlanco) / total) * 100) : 0;
   const pctEfectivoNegro = 100 - pctBlanco - pctEfectivoBlanco;

  const shift = SHIFT_LABELS[turnoActivo.nombre_turno] ?? {
    label: turnoActivo.nombre_turno,
    range: '—',
  };

  const quickActions = [
    { label: 'Ingreso (Blanco)', icon: Plus, tone: 'mint', stream: 'blanco', type: 'income' },
    { label: 'Ingreso (Efectivo)', icon: Plus, tone: 'slate', stream: 'efectivo', type: 'income' },
    { label: 'Egreso (Blanco)', icon: Minus, tone: 'red', stream: 'blanco', type: 'expense' },
    { label: 'Egreso (Efectivo)', icon: Minus, tone: 'red', stream: 'efectivo', type: 'expense' },
  ] as const;

  const toneClasses: Record<string, string> = {
    mint: 'bg-mint-50 text-mint-600',
    slate: 'bg-slate-100 text-navy-700',
    red: 'bg-red-50 text-negative',
  };

  return (
    <>
      <Topbar title="Panel de Control" />

      {/* Net Position */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Posición Neta
        </p>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="text-4xl md:text-5xl font-extrabold text-navy-950 font-ledger">
            {formatMoney(posicionNeta)}
          </h2>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-mint-600">
            <TrendingUp className="w-4 h-4" />
            +2.4% vs turno anterior
          </span>
        </div>
      </div>

      {/* Blanco / Negro cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Blanco */}
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-ink-muted">
              <CheckCircle className="w-4 h-4 text-mint-500" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Blanco (Fiscal)
              </span>
            </div>
            <CheckCircle className="w-7 h-7 text-slate-200" />
          </div>
          <p className="text-3xl font-extrabold text-navy-950 mt-3 mb-4 font-ledger">
            {formatMoney(totalBlanco)}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-mint-500 rounded-full"
                style={{ width: `${pctBlanco}%` }}
              />
            </div>
            <span className="text-xs text-ink-muted whitespace-nowrap">
              {pctBlanco}% of total
            </span>
          </div>
        </div>

        {/* Efectivo */}
        <div className="bg-surface rounded-2xl border-2 border-navy-950 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-ink-muted">
              <Landmark className="w-4 h-4 text-navy-700" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Efectivo (Blanco)
              </span>
            </div>
            <Landmark className="w-7 h-7 text-slate-200" />
          </div>
          <p className="text-3xl font-extrabold text-navy-950 mt-3 mb-4 font-ledger">
            {formatMoney(totalEfectivoBlanco)}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-navy-800 rounded-full"
                style={{ width: `${pctEfectivoBlanco}%` }}
              />
            </div>
            <span className="text-xs text-ink-muted whitespace-nowrap">
              {pctEfectivoBlanco}% of total
            </span>
          </div>
        </div>
      </div>

      {/* Shift card + quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {/* Shift card */}
        <div className="col-span-2 lg:col-span-1 bg-navy-950 text-white rounded-2xl shadow-lg p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded">
              {turnoActivo.nombre_turno}
            </span>
            <Sun className="w-5 h-5 text-white/70" />
          </div>
          <p className="text-xs text-white/60 mb-0.5">Activo</p>
          <p className="text-xl font-bold mb-4">{shift.range}</p>
          <button
            onClick={handleCerrarTurno}
            disabled={busy}
            className="mt-auto w-full bg-white text-navy-950 py-2.5 rounded-lg font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            Cerrar Caja
          </button>
        </div>

        {/* Quick actions */}
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate('/movements')}
            className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span
              className={`w-11 h-11 rounded-full flex items-center justify-center ${toneClasses[a.tone]}`}
            >
              <a.icon className="w-5 h-5" strokeWidth={2.4} />
            </span>
            <span
              className={`text-xs font-semibold text-center leading-tight ${
                a.tone === 'red' ? 'text-negative' : 'text-navy-900'
              }`}
            >
              {a.label}
            </span>
          </button>
        ))}
      </div>

      {/* Recent movements */}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy-950">Movimientos Recientes</h3>
          <button
            onClick={() => navigate('/reports')}
            className="text-sm font-semibold text-navy-700 hover:underline flex items-center gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            Ver Todo
          </button>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-slate-200">
                <th className="py-2 px-3 font-semibold">Time</th>
                <th className="py-2 px-3 font-semibold">Description</th>
                <th className="py-2 px-3 font-semibold">Type</th>
                <th className="py-2 px-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length > 0 ? (
                movimientos.slice(0, 5).map((mov) => {
                  const isIncome = mov.tipo_movimiento === 'INGRESO';
                  return (
                    <tr
                      key={mov.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-3 px-3 text-ink-muted font-ledger">
                        {formatTime(mov.fecha_hora)}
                      </td>
                      <td className="py-3 px-3 text-navy-900">
                        {mov.descripcion || mov.categoria}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            mov.condicion_fiscal === 'BLANCO'
                              ? 'bg-slate-100 text-navy-700'
                              : 'bg-navy-100/60 bg-slate-200 text-navy-800'
                          }`}
                        >
                          {mov.condicion_fiscal}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold font-ledger ${
                          isIncome ? 'text-mint-600' : 'text-negative'
                        }`}
                      >
                        {formatSignedMoney(mov.monto, isIncome)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-muted">
                    No movements recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
