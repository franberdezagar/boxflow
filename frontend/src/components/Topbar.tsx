import { Search, Settings, Bell } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  showBell?: boolean;
}

export default function Topbar({ title, subtitle, showBell }: TopbarProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy-950 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-ink-muted hover:bg-white transition-colors">
          <Search className="w-5 h-5" />
        </button>
        {showBell && (
          <button className="p-2 rounded-lg text-ink-muted hover:bg-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        )}
        <button className="p-2 rounded-lg text-ink-muted hover:bg-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
