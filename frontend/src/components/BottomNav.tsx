import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, Clock, BarChart3 } from 'lucide-react';

const items = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/movements', label: 'Movimientos', icon: ArrowRightLeft },
  { to: '/shifts', label: 'Turnos', icon: Clock },
  { to: '/reports', label: 'Reportes', icon: BarChart3 },
  { to: '/analytics', label: 'Análisis', icon: BarChart3 },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-slate-200 flex justify-around items-center py-1.5">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors',
              isActive ? 'text-white bg-navy-950' : 'text-ink-muted',
            ].join(' ')
          }
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
