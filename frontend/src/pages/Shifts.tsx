import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sun,
  Moon,
  LogOut,
  Plus,
  Landmark,
  Wallet,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';
import Topbar from '../components/Topbar';
import type { AppOutletContext } from '../components/Layout';
import { turnosAPI } from '../api/turnos';
import { movimientosAPI } from '../api/movimientos';
import type { Turno, Movimiento } from '../types';
import {
  formatMoney,
  formatClock,
  formatDate,
  toNumber,
  SHIFT_LABELS,
} from '../lib/format';

interface Flow {
  in: number;
  out: number;
}

function computeFlow(movs: Movimiento[], cond: 'BLANCO' | 'EFECTIVO'): Flow {
  return movs
    .filter((m) => m.condicion_fiscal === cond)
    .reduce(
      (acc, m) => {
        const amt = toNumber(m.monto);
        if (m.tipo_movimiento === 'INGRESO') acc.in += amt;
        else acc.out += amt;
        return acc;
      },
      { in: 0, out: 0 }
    );
}

export default function Shifts() {
  const { turnoActivo, loadingTurno, refreshTurno } =
    useOutletContext<AppOutletContext>();

  const [movs, setMovs] = useState<Movimiento[]>([]);
  const [history, setHistory] = useState<Turno[]>([]);
  const [busy, setBusy] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
   const [filterStream, setFilterStream] = useState<'all' | 'blanco' | 'efectivo'>('all');
  const [filterShift, setFilterShift] = useState<'all' | 'MAÑANA' | 'TARDE'>('all');

  const loadData = useCallback(async () => {
    try {
      const turnos = await turnosAPI.listarTurnos();
      setHistory(turnos);
    } catch (err) {
      console.error(err);
    }
    if (turnoActivo) {
      try {
        const m = await movimientosAPI.obtenerMovimientosPorTurno(
          turnoActivo.id
        );
        setMovs(m);
      } catch (err) {
        console.error(err);
      }
    } else {
      setMovs([]);
    }
  }, [turnoActivo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleClose = async () => {
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
      await loadData();
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

   const blanco = computeFlow(movs, 'BLANCO');
   const efectivo = computeFlow(movs, 'EFECTIVO');
   const blancoBal = blanco.in - blanco.out;
   const efectivoBal = efectivo.in - efectivo.out;

  const shift = turnoActivo
    ? SHIFT_LABELS[turnoActivo.nombre_turno] ?? {
        label: turnoActivo.nombre_turno,
        range: '—',
      }
    : null;

  const isMorning = turnoActivo?.nombre_turno === 'MAÑANA';

  return (
    <>
      <Topbar title="Gestión de Turnos" />

       {/* Active shift hero */}
       {turnoActivo && shift ? (
         <div className="bg-navy-950 text-white rounded-2xl shadow-lg p-6 mb-5">
           <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
             {isMorning ? (
               <Sun className="w-4 h-4" />
             ) : (
               <Moon className="w-4 h-4" />
             )}
             Turno Activo Actual
           </div>
          <h2 className="text-3xl font-bold mb-1">{shift.label}</h2>
          <p className="text-white/60 text-sm mb-6 font-ledger">
            {shift.range}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex gap-8">
              <div>
                <p className="text-white/50 text-xs mb-0.5">Started at</p>
                <p className="font-semibold font-ledger">
                  {formatClock(turnoActivo.fecha_apertura)}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-0.5">Net Blanco</p>
                <p className="font-semibold font-ledger">
                  {formatMoney(blancoBal)}
                </p>
              </div>
               <div>
                 <p className="text-white/50 text-xs mb-0.5">Net Efectivo</p>
                 <p className="font-semibold font-ledger">
                   {formatMoney(efectivoBal)}
                 </p>
               </div>
            </div>
            <button
              onClick={handleClose}
              disabled={busy}
              className="bg-negative text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Turno
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-dashed border-slate-300 p-8 mb-5 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-navy-400" />
          </div>
          <p className="font-semibold text-navy-950">No active shift</p>
          <p className="text-sm text-ink-muted">
            Open a shift from the Dashboard to start logging movements.
          </p>
        </div>
      )}

      {/* Flow cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Blanco flow */}
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Digital / Blanco Flow
            </span>
            <Landmark className="w-4 h-4 text-navy-700" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-5">
            <div>
              <p className="text-xs text-ink-muted mb-1">Total In</p>
              <p className="font-bold text-mint-600 font-ledger">
                {formatMoney(blanco.in)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-1">Total Out</p>
              <p className="font-bold text-negative font-ledger">
                {formatMoney(blanco.out)}
              </p>
            </div>
            <div className="pl-2 border-l border-slate-200">
              <p className="text-xs text-ink-muted mb-1">Balance</p>
              <p className="font-bold text-navy-950 font-ledger">
                {formatMoney(blancoBal)}
              </p>
            </div>
          </div>
        </div>

        {/* Efectivo flow */}
        <div className="bg-navy-950 text-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-wide text-white/60">
              Cash / Efectivo Flow
            </span>
            <Wallet className="w-4 h-4 text-white/60" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-5">
            <div>
              <p className="text-xs text-white/50 mb-1">Total In</p>
              <p className="font-bold text-mint-400 font-ledger">
                {formatMoney(efectivo.in)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">Total Out</p>
              <p className="font-bold text-red-300 font-ledger">
                {formatMoney(efectivo.out)}
              </p>
            </div>
            <div className="pl-2 border-l border-white/15">
              <p className="text-xs text-white/50 mb-1">Balance</p>
              <p className="font-bold text-white font-ledger">
                {formatMoney(efectivoBal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-navy-950">Historial de Turnos</h3>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-ink-muted border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-10">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-navy-900 mb-2">
                    Flujo
                  </label>
                  <select
                    value={filterStream}
                    onChange={(e) => setFilterStream(e.target.value as 'all' | 'blanco' | 'efectivo')}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white"
                  >
                    <option value="all">Todos</option>
                    <option value="blanco">Blanco</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-2">
                    Jornada
                  </label>
                  <select
                    value={filterShift}
                    onChange={(e) => setFilterShift(e.target.value as 'all' | 'MAÑANA' | 'TARDE')}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white"
                  >
                    <option value="all">Todas</option>
                    <option value="MAÑANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-slate-200">
                <th className="py-2 px-3 font-semibold">Fecha y Período</th>
                <th className="py-2 px-3 font-semibold">Operador</th>
                <th className="py-2 px-3 font-semibold text-right">
                  Balance Total
                </th>
                <th className="py-2 px-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history
                  .filter((t) => {
                    if (filterShift !== 'all' && t.nombre_turno !== filterShift) return false;
                    return true;
                  })
                  .map((t) => {
                    const bal =
                      toNumber(t.efectivo_final_blanco_esperado) +
                      toNumber(t.efectivo_final_efectivo_esperado);
                    const closed = t.estado === 'CERRADO';
                    const sl = SHIFT_LABELS[t.nombre_turno];
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="py-3 px-3">
                          <p className="font-medium text-navy-950">
                            {formatDate(t.fecha_apertura)}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {sl ? sl.label : t.nombre_turno} ·{' '}
                            {sl ? sl.range : ''}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-navy-900">Gerente Tienda</td>
                        <td className="py-3 px-3 text-right font-bold text-navy-950 font-ledger">
                          {formatMoney(bal)}
                        </td>
                        <td className="py-3 px-3">
                          {closed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint-50 text-mint-700">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Validado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-navy-700">
                              <Clock className="w-3.5 h-3.5" />
                              Activo
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-muted">
                    Sin turnos registrados
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
