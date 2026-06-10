import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Minus,
  Plus,
  Landmark,
  EyeOff,
  Delete,
  CheckCircle,
} from 'lucide-react';
import type { AppOutletContext } from '../components/Layout';
import { movimientosAPI } from '../api/movimientos';

type TxType = 'expense' | 'income';
type Stream = 'blanco' | 'efectivo_registrado' | 'efectivo_no_registrado';

const CATEGORIES = [
  { value: 'VENTA', label: 'Ventas Diarias' },
  { value: 'PROVEEDOR', label: 'Proveedor / Stock' },
  { value: 'SUELDO', label: 'Sueldos' },
  { value: 'VARIOS', label: 'General / Varios' },
];

export default function Movements() {
  const { turnoActivo, refreshTurno } = useOutletContext<AppOutletContext>();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('0');
  const [type, setType] = useState<TxType>('income');
  const [stream, setStream] = useState<Stream>('blanco');
  const [category, setCategory] = useState('');
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const pressKey = (key: string) => {
    setAmount((prev) => {
      if (key === 'back') return prev.slice(0, -1) || '0';
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      if (prev === '0') return key;
      // limit 2 decimals
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      return prev + key;
    });
  };

  const numericAmount = parseFloat(amount) || 0;
  const isValid = numericAmount > 0 && category !== '' && !!turnoActivo;

  const handleConfirm = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      setError(null);
       const getCondicionFiscal = () => {
         if (stream === 'blanco') return 'BLANCO';
         if (stream === 'efectivo_registrado') return 'EFECTIVO_BLANCO';
         return 'EFECTIVO_NEGRO';
       };

       await movimientosAPI.crearMovimiento({
         tipo_movimiento: type === 'income' ? 'INGRESO' : 'EGRESO',
         condicion_fiscal: getCondicionFiscal(),
         categoria: category,
         monto: numericAmount,
         descripcion: concept || category,
       });
      setAmount('0');
      setCategory('');
      setConcept('');
      setSuccess(true);
      await refreshTurno();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear movimiento');
    } finally {
      setLoading(false);
    }
  };

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'back'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-ink-muted hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Nueva Transacción
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isValid ? 'bg-mint-500' : 'bg-negative animate-pulse'
            }`}
          />
          <button className="p-2 rounded-lg text-ink-muted hover:bg-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!turnoActivo && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
          No hay turno activo. Abre un turno desde el Dashboard para registrar
          movimientos.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-mint-50 border border-mint-100 text-mint-700 px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Transacción registrada exitosamente.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: form */}
        <div className="space-y-4">
          {/* Transaction type */}
          <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
              Tipo de Transacción
            </p>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  type === 'expense'
                    ? 'bg-navy-950 text-white shadow'
                    : 'text-ink-muted hover:text-navy-900'
                }`}
              >
                <Minus className="w-4 h-4" />
                Egreso
              </button>
              <button
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  type === 'income'
                    ? 'bg-navy-950 text-white shadow'
                    : 'text-ink-muted hover:text-navy-900'
                }`}
              >
                <Plus className="w-4 h-4" />
                Ingreso
              </button>
            </div>
          </div>

          {/* Accounting stream */}
          <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-2">
              Flujo Contable
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setStream('blanco')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  stream === 'blanco'
                    ? 'border-navy-950 bg-blue-50'
                    : 'border-transparent bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Landmark className="w-5 h-5 text-navy-800" />
                <span className="text-xs font-semibold text-navy-900">Blanco</span>
                <span className="text-[9px] text-ink-muted uppercase tracking-wide">
                  Fiscal
                </span>
              </button>
              <button
                onClick={() => setStream('efectivo_registrado')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  stream === 'efectivo_registrado'
                    ? 'border-navy-950 bg-blue-50'
                    : 'border-transparent bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Plus className="w-5 h-5 text-navy-800" />
                <span className="text-xs font-semibold text-navy-900">Efectivo</span>
                <span className="text-[9px] text-ink-muted uppercase tracking-wide">
                  Registrado
                </span>
              </button>
              <button
                onClick={() => setStream('efectivo_no_registrado')}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${
                  stream === 'efectivo_no_registrado'
                    ? 'border-navy-950 bg-blue-50'
                    : 'border-transparent bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <EyeOff className="w-5 h-5 text-navy-800" />
                <span className="text-xs font-semibold text-navy-900">Efectivo</span>
                <span className="text-[9px] text-ink-muted uppercase tracking-wide">
                  No Registrado
                </span>
              </button>
            </div>
          </div>

          {/* Category & concept */}
          <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              >
                <option value="">Seleccionar Categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
                Concepto / Referencia
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ej. Entrega semanal de verduras..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
          </div>
        </div>

        {/* Right column: amount + keypad */}
        <div className="space-y-4">
          {/* Amount display */}
          <div className="bg-navy-950 text-white rounded-2xl shadow-lg p-6 flex flex-col items-end justify-center min-h-[140px]">
            <span className="text-[11px] uppercase tracking-wide text-white/50 mb-1">
              Monto (ARS)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white/40">$</span>
              <span className="text-5xl font-black font-ledger leading-none">
                {amount}
              </span>
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 bg-surface rounded-2xl border border-slate-200 shadow-sm p-2">
            {keys.map((k) => (
              <button
                key={k}
                onClick={() => pressKey(k)}
                className={`h-16 rounded-xl text-xl font-bold flex items-center justify-center transition-colors active:scale-95 ${
                  k === 'back'
                    ? 'bg-slate-100 text-ink-muted hover:bg-red-50 hover:text-negative'
                    : 'bg-slate-100 text-navy-950 hover:bg-slate-200'
                }`}
              >
                {k === 'back' ? <Delete className="w-5 h-5" /> : k}
              </button>
            ))}
          </div>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className={`w-full h-16 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
              isValid && !loading
                ? 'bg-navy-950 text-white shadow-lg hover:bg-navy-900 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Procesando…' : 'Confirmar Transacción'}
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
