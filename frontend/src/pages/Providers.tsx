import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Provider {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  createdAt: string;
}

export default function Providers() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('providers');
    if (stored) {
      setProviders(JSON.parse(stored));
    }
  }, []);

  const saveProviders = (updatedProviders: Provider[]) => {
    localStorage.setItem('providers', JSON.stringify(updatedProviders));
    setProviders(updatedProviders);
  };

  const handleAddOrUpdate = () => {
    if (!formData.nombre.trim()) {
      alert('El nombre del proveedor es requerido');
      return;
    }

    if (editingId) {
      // Update existing
      const updated = providers.map((p) =>
        p.id === editingId
          ? { ...p, ...formData }
          : p
      );
      saveProviders(updated);
      setEditingId(null);
    } else {
      // Add new
      const newProvider: Provider = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      saveProviders([...providers, newProvider]);
    }

    setFormData({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
    });
    setShowForm(false);
  };

  const handleEdit = (provider: Provider) => {
    setFormData({
      nombre: provider.nombre,
      contacto: provider.contacto || '',
      telefono: provider.telefono || '',
      email: provider.email || '',
      direccion: provider.direccion || '',
    });
    setEditingId(provider.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      saveProviders(providers.filter((p) => p.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
    });
  };

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
            Gestión de Proveedores
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-navy-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-navy-900 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Proveedor
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-navy-950 mb-4">
            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                placeholder="Nombre del proveedor"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">
                Contacto
              </label>
              <input
                type="text"
                value={formData.contacto}
                onChange={(e) =>
                  setFormData({ ...formData, contacto: e.target.value })
                }
                placeholder="Nombre del contacto"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            </div>
            <div>
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
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                placeholder="Dirección"
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

      {/* Providers List */}
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {providers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-4 font-semibold">Nombre</th>
                  <th className="py-3 px-4 font-semibold">Contacto</th>
                  <th className="py-3 px-4 font-semibold">Teléfono</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Dirección</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr
                    key={provider.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-medium text-navy-950">
                      {provider.nombre}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {provider.contacto || '—'}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {provider.telefono || '—'}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {provider.email || '—'}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {provider.direccion || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(provider)}
                          className="p-1.5 rounded-lg text-navy-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(provider.id)}
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
            <p className="text-ink-muted">No hay proveedores registrados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-navy-950 font-semibold hover:underline"
            >
              Crear el primer proveedor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
