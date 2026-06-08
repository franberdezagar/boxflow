import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../lib/format';

interface Employee {
  id: string;
  nombre: string;
  puesto?: string;
  salario: number;
  email?: string;
  telefono?: string;
  createdAt: string;
}

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    puesto: '',
    salario: '',
    email: '',
    telefono: '',
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const stored = localStorage.getItem('employees');
    if (stored) {
      setEmployees(JSON.parse(stored));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveEmployees = (updatedEmployees: Employee[]) => {
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    setEmployees(updatedEmployees);
  };

  const handleAddOrUpdate = () => {
    if (!formData.nombre.trim()) {
      alert('El nombre del empleado es requerido');
      return;
    }

    const salario = parseFloat(formData.salario) || 0;
    if (salario <= 0) {
      alert('El salario debe ser mayor a 0');
      return;
    }

    if (editingId) {
      // Update existing
      const updated = employees.map((e) =>
        e.id === editingId
          ? { ...e, nombre: formData.nombre, puesto: formData.puesto, salario, email: formData.email, telefono: formData.telefono }
          : e
      );
      saveEmployees(updated);
      setEditingId(null);
    } else {
      // Add new
      const newEmployee: Employee = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        puesto: formData.puesto,
        salario,
        email: formData.email,
        telefono: formData.telefono,
        createdAt: new Date().toISOString(),
      };
      saveEmployees([...employees, newEmployee]);
    }

    setFormData({
      nombre: '',
      puesto: '',
      salario: '',
      email: '',
      telefono: '',
    });
    setShowForm(false);
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      nombre: employee.nombre,
      puesto: employee.puesto || '',
      salario: employee.salario.toString(),
      email: employee.email || '',
      telefono: employee.telefono || '',
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      saveEmployees(employees.filter((e) => e.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      puesto: '',
      salario: '',
      email: '',
      telefono: '',
    });
  };

  const totalSalarios = employees.reduce((sum, e) => sum + e.salario, 0);

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
            Gestión de Empleados
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-navy-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-navy-900 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Empleado
          </button>
        )}
      </div>

      {/* Summary */}
      {employees.length > 0 && (
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                Total de Empleados
              </p>
              <p className="text-2xl font-bold text-navy-950">
                {employees.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                Salario Promedio
              </p>
              <p className="text-2xl font-bold text-navy-950">
                {formatMoney(totalSalarios / employees.length)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                Total de Nómina
              </p>
              <p className="text-2xl font-bold text-negative">
                {formatMoney(totalSalarios)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-navy-950 mb-4">
            {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Nombre del empleado"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                Puesto
              </label>
              <input
                type="text"
                value={formData.puesto}
                onChange={(e) =>
                  setFormData({ ...formData, puesto: e.target.value })
                }
                placeholder="Puesto o cargo"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                Salario Mensual (ARS) *
              </label>
              <input
                type="number"
                value={formData.salario}
                onChange={(e) =>
                  setFormData({ ...formData, salario: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Correo electrónico"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="Número de teléfono"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddOrUpdate}
              className="flex-1 bg-navy-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-navy-900 transition-colors"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-slate-200 text-navy-950 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Employees List */}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 font-semibold">Nombre</th>
                  <th className="py-3 px-4 font-semibold">Puesto</th>
                  <th className="py-3 px-4 font-semibold text-right">Salario Mensual</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Teléfono</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-medium text-navy-950">
                      {employee.nombre}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {employee.puesto || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-navy-950">
                      {formatMoney(employee.salario)}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {employee.email || '—'}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {employee.telefono || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-1.5 rounded-lg text-navy-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-1.5 rounded-lg text-negative hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-ink-muted">No hay empleados registrados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-navy-950 font-semibold hover:underline"
            >
              Crear el primer empleado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
