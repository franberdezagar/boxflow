import { NavLink } from 'react-router-dom';
import {
  Wallet,
  LayoutDashboard,
  ArrowRightLeft,
  Clock,
  BarChart3,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  shiftActive: boolean;
}

const navItems = [
  { to: '/', label: 'Panel de Control', icon: LayoutDashboard, end: true },
  { to: '/movements', label: 'Movimientos', icon: ArrowRightLeft },
  { to: '/shifts', label: 'Turnos', icon: Clock },
  { to: '/reports', label: 'Reportes', icon: FileText },
  { to: '/analytics', label: 'Análisis', icon: BarChart3 },
];

export default function Sidebar({ shiftActive }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col justify-between bg-surface border-r border-slate-200 px-5 py-6">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <Wallet className="w-6 h-6 text-navy-950" strokeWidth={2.2} />
          <span className="text-lg font-bold text-navy-950 tracking-tight">
            CashFlow Pro
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 px-2 pb-6 mb-2 border-b border-slate-200">
          <div className="w-11 h-11 rounded-full bg-navy-950 flex items-center justify-center text-white font-bold text-lg">
            P.A
          </div>
          <div className="min-w-0">
            <p className="font-bold text-navy-950 leading-tight">Panaderia Astorina</p>
            <p className="text-xs text-ink-muted">
              HQ-01{shiftActive ? ' • Activo' : ''}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1 mt-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-navy-950'
                    : 'text-ink-muted hover:bg-slate-50 hover:text-navy-900',
                ].join(' ')
              }
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
            Estado
          </p>
          <div className="flex items-center gap-2">
            <span
              className={[
                'w-2 h-2 rounded-full',
                shiftActive ? 'bg-mint-500 animate-pulse' : 'bg-slate-300',
              ].join(' ')}
            />
            <span className="text-sm text-navy-900 font-medium">
              {shiftActive ? 'Turno Activo' : 'Sin Turno Activo'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
