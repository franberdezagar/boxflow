import { Outlet } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { turnosAPI } from '../api/turnos';
import type { Turno } from '../types';

export interface AppOutletContext {
  turnoActivo: Turno | null;
  loadingTurno: boolean;
  refreshTurno: () => Promise<void>;
}

export default function Layout() {
  const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);
  const [loadingTurno, setLoadingTurno] = useState(true);

  const refreshTurno = useCallback(async () => {
    try {
      const turno = await turnosAPI.obtenerTurnoActivo();
      setTurnoActivo(turno);
    } catch {
      setTurnoActivo(null);
    } finally {
      setLoadingTurno(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshTurno();
  }, [refreshTurno]);

  const context: AppOutletContext = {
    turnoActivo,
    loadingTurno,
    refreshTurno,
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar shiftActive={!!turnoActivo} />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 pb-24 md:pb-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Outlet context={context} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
