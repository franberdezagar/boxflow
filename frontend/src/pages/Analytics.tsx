import { useEffect, useState } from 'react';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import Topbar from '../components/Topbar';
import { turnosAPI } from '../api/turnos';
import { movimientosAPI } from '../api/movimientos';
import type { Movimiento } from '../types';
import { formatMoney, toNumber } from '../lib/format';

interface DayAnalysis {
  date: string;
  dayName: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  morningBalance: number;
  afternoonBalance: number;
  transactionCount: number;
}

interface ShiftAnalysis {
  shift: 'MAÑANA' | 'TARDE';
  avgIncome: number;
  avgExpense: number;
  avgBalance: number;
  totalDays: number;
}

export default function Analytics() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [dayAnalysis, setDayAnalysis] = useState<DayAnalysis[]>([]);
  const [shiftAnalysis, setShiftAnalysis] = useState<ShiftAnalysis[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const turnosData = await turnosAPI.listarTurnos();

        // Get all movements
        const allMovs: Movimiento[] = [];
        for (const turno of turnosData) {
          try {
            const movs = await movimientosAPI.obtenerMovimientosPorTurno(turno.id);
            allMovs.push(...movs);
          } catch (err) {
            console.error(`Error loading movements for turno ${turno.id}:`, err);
          }
        }
        setMovimientos(allMovs);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (movimientos.length === 0) return;

    // Calculate day analysis
    const dayMap = new Map<string, DayAnalysis>();
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    movimientos.forEach((mov) => {
      const movDate = new Date(mov.fecha_hora);
      if (movDate < cutoffDate) return;

      const dateStr = movDate.toISOString().split('T')[0];
      const dayName = movDate.toLocaleDateString('es-AR', { weekday: 'long' });

      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, {
          date: dateStr,
          dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          morningBalance: 0,
          afternoonBalance: 0,
          transactionCount: 0,
        });
      }

      const day = dayMap.get(dateStr)!;
      const amount = toNumber(mov.monto);
      const isIncome = mov.tipo_movimiento === 'INGRESO';

      if (isIncome) {
        day.totalIncome += amount;
      } else {
        day.totalExpense += amount;
      }

      day.netBalance = day.totalIncome - day.totalExpense;
      day.transactionCount += 1;

      // Determine shift (morning: 08:00-16:00, afternoon: 16:00-00:00)
      const hour = movDate.getHours();
      const shiftAmount = isIncome ? amount : -amount;
      if (hour >= 8 && hour < 16) {
        day.morningBalance += shiftAmount;
      } else {
        day.afternoonBalance += shiftAmount;
      }
    });

    const daysArray = Array.from(dayMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate shift analysis
    const shiftMap = new Map<string, { income: number; expense: number; count: number }>();

    movimientos.forEach((mov) => {
      const movDate = new Date(mov.fecha_hora);
      if (movDate < cutoffDate) return;

      const shift = mov.turno_id ? 'MAÑANA' : 'TARDE'; // Simplified - would need turno data
      const amount = toNumber(mov.monto);
      const isIncome = mov.tipo_movimiento === 'INGRESO';

      if (!shiftMap.has(shift)) {
        shiftMap.set(shift, { income: 0, expense: 0, count: 0 });
      }

      const data = shiftMap.get(shift)!;
      if (isIncome) {
        data.income += amount;
      } else {
        data.expense += amount;
      }
      data.count += 1;
    });

    const shiftsArray: ShiftAnalysis[] = [];
    shiftMap.forEach((data, shift) => {
      shiftsArray.push({
        shift: shift as 'MAÑANA' | 'TARDE',
        avgIncome: data.income / Math.max(1, daysArray.length),
        avgExpense: data.expense / Math.max(1, daysArray.length),
        avgBalance: (data.income - data.expense) / Math.max(1, daysArray.length),
        totalDays: daysArray.length,
      });
    });

    setDayAnalysis(daysArray);
    setShiftAnalysis(shiftsArray);
  }, [movimientos, days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-ink-muted">
        Cargando…
      </div>
    );
  }

  const bestDay = dayAnalysis.reduce((best, current) =>
    current.netBalance > best.netBalance ? current : best,
    dayAnalysis[0] || { netBalance: 0 }
  );

  const bestShift = shiftAnalysis.reduce((best, current) =>
    current.avgBalance > best.avgBalance ? current : best,
    shiftAnalysis[0] || { avgBalance: 0 }
  );

  const avgDailyBalance =
    dayAnalysis.length > 0
      ? dayAnalysis.reduce((sum, day) => sum + day.netBalance, 0) / dayAnalysis.length
      : 0;

  return (
    <>
      <Topbar title="Análisis" />

      {/* Period selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-semibold text-navy-900">Período:</label>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Balance Promedio Diario
            </span>
            <TrendingUp className="w-4 h-4 text-mint-600" />
          </div>
          <p className="text-3xl font-extrabold text-navy-950 font-ledger">
            {formatMoney(avgDailyBalance)}
          </p>
          <p className="text-xs text-ink-muted mt-2">
            Basado en {dayAnalysis.length} días
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Mejor Día
            </span>
            <Calendar className="w-4 h-4 text-navy-700" />
          </div>
          <p className="text-3xl font-extrabold text-navy-950 font-ledger">
            {formatMoney(bestDay.netBalance || 0)}
          </p>
          <p className="text-xs text-ink-muted mt-2">
            {bestDay.dayName || 'N/A'} ({bestDay.date || 'N/A'})
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Turno Más Productivo
            </span>
            <BarChart3 className="w-4 h-4 text-navy-700" />
          </div>
          <p className="text-3xl font-extrabold text-navy-950 font-ledger">
            {formatMoney(bestShift.avgBalance || 0)}
          </p>
          <p className="text-xs text-ink-muted mt-2">
            {bestShift.shift || 'N/A'} (promedio)
          </p>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily analysis table */}
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-navy-950 mb-4">Análisis Diario</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-slate-200">
                  <th className="py-2 px-2 font-semibold">Fecha</th>
                  <th className="py-2 px-2 font-semibold text-right">Ingresos</th>
                  <th className="py-2 px-2 font-semibold text-right">Egresos</th>
                  <th className="py-2 px-2 font-semibold text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                {dayAnalysis.slice(0, 10).map((day) => (
                  <tr
                    key={day.date}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 px-2">
                      <p className="font-medium text-navy-950">{day.date}</p>
                      <p className="text-xs text-ink-muted">{day.dayName}</p>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-mint-600 font-ledger">
                      {formatMoney(day.totalIncome)}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-negative font-ledger">
                      {formatMoney(day.totalExpense)}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-navy-950 font-ledger">
                      {formatMoney(day.netBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shift comparison */}
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-navy-950 mb-4">Comparativa de Turnos</h3>
          <div className="space-y-4">
            {shiftAnalysis.map((shift) => (
              <div key={shift.shift} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-navy-900">{shift.shift}</span>
                  <span className="text-xs text-ink-muted">
                    Promedio ({shift.totalDays} días)
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Ingresos promedio</span>
                    <span className="font-semibold text-mint-600 font-ledger">
                      {formatMoney(shift.avgIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Egresos promedio</span>
                    <span className="font-semibold text-negative font-ledger">
                      {formatMoney(shift.avgExpense)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-navy-900 font-medium">Balance promedio</span>
                    <span className="font-bold text-navy-950 font-ledger">
                      {formatMoney(shift.avgBalance)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day of week analysis */}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-bold text-navy-950 mb-4">Análisis por Día de la Semana</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-slate-200">
                <th className="py-2 px-3 font-semibold">Día</th>
                <th className="py-2 px-3 font-semibold text-right">Veces</th>
                <th className="py-2 px-3 font-semibold text-right">Ingresos Total</th>
                <th className="py-2 px-3 font-semibold text-right">Egresos Total</th>
                <th className="py-2 px-3 font-semibold text-right">Balance Total</th>
                <th className="py-2 px-3 font-semibold text-right">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(
                dayAnalysis.reduce((map, day) => {
                  const key = day.dayName;
                  if (!map.has(key)) {
                    map.set(key, {
                      dayName: key,
                      count: 0,
                      totalIncome: 0,
                      totalExpense: 0,
                      netBalance: 0,
                    });
                  }
                  const data = map.get(key)!;
                  data.count += 1;
                  data.totalIncome += day.totalIncome;
                  data.totalExpense += day.totalExpense;
                  data.netBalance += day.netBalance;
                  return map;
                }, new Map<string, { dayName: string; count: number; totalIncome: number; totalExpense: number; netBalance: number }>())
              ).map(([, data]) => (
                <tr
                  key={data.dayName}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-3 px-3 font-medium text-navy-950">{data.dayName}</td>
                  <td className="py-3 px-3 text-right text-ink-muted">{data.count}</td>
                  <td className="py-3 px-3 text-right font-semibold text-mint-600 font-ledger">
                    {formatMoney(data.totalIncome)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-negative font-ledger">
                    {formatMoney(data.totalExpense)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-navy-950 font-ledger">
                    {formatMoney(data.netBalance)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-navy-700 font-ledger">
                    {formatMoney(data.netBalance / data.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
