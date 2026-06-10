import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Building } from 'lucide-react';
import { proveedoresApi, type Proveedor, type CrearProveedorData } from '../api/proveedores';
import { empleadosApi, type Empleado, type CrearEmpleadoData } from '../api/empleados';

type TabType = 'proveedores' | 'empleados';

interface ProveedorFormData {
  razon_social: string;
  telefono: string;
  email: string;
  contacto: string;
}

interface EmpleadoFormData {
  nombre_completo: string;
  rol: 'CAJERO' | 'GERENTE' | 'ADMIN';
  email: string;
  telefono: string;
}

export default function Categories() {
  const [activeTab, setActiveTab] = useState<TabType>('proveedores');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Proveedor | Empleado | null>(null);
  
  const [proveedorForm, setProveedorForm] = useState<ProveedorFormData>({
    razon_social: '',
    telefono: '',
    email: '',
    contacto: ''
  });

  const [empleadoForm, setEmpleadoForm] = useState<EmpleadoFormData>({
    nombre_completo: '',
    rol: 'CAJERO',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'proveedores') {
        const data = await proveedoresApi.listar({ activo: true });
        setProveedores(data);
      } else {
        const data = await empleadosApi.listar({ activo: true });
        setEmpleados(data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'proveedores') {
        const data: CrearProveedorData = {
          razon_social: proveedorForm.razon_social,
          telefono: proveedorForm.telefono || undefined,
          email: proveedorForm.email || undefined,
          contacto: proveedorForm.contacto || undefined,
        };

        if (editingItem) {
          await proveedoresApi.actualizar(editingItem.id, data);
        } else {
          await proveedoresApi.crear(data);
        }
      } else {
        const data: CrearEmpleadoData = {
          nombre_completo: empleadoForm.nombre_completo,
          rol: empleadoForm.rol,
          email: empleadoForm.email || undefined,
          telefono: empleadoForm.telefono || undefined,
        };

        if (editingItem) {
          await empleadosApi.actualizar(editingItem.id, data);
        } else {
          await empleadosApi.crear(data);
        }
      }

      setShowModal(false);
      setEditingItem(null);
      resetForms();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Proveedor | Empleado) => {
    setEditingItem(item);
    
    if (activeTab === 'proveedores') {
      const proveedor = item as Proveedor;
      setProveedorForm({
        razon_social: proveedor.razon_social,
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        contacto: proveedor.contacto || ''
      });
    } else {
      const empleado = item as Empleado;
      setEmpleadoForm({
        nombre_completo: empleado.nombre_completo,
        rol: empleado.rol,
        email: empleado.email || '',
        telefono: empleado.telefono || ''
      });
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar este elemento?')) return;

    try {
      if (activeTab === 'proveedores') {
        await proveedoresApi.eliminar(id);
      } else {
        await empleadosApi.eliminar(id);
      }
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const resetForms = () => {
    setProveedorForm({
      razon_social: '',
      telefono: '',
      email: '',
      contacto: ''
    });
    setEmpleadoForm({
      nombre_completo: '',
      rol: 'CAJERO',
      email: '',
      telefono: ''
    });
  };

  const openModal = () => {
    setEditingItem(null);
    resetForms();
    setShowModal(true);
  };

  const filteredProveedores = proveedores.filter(p =>
    p.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmpleados = empleados.filter(e =>
    e.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar {activeTab === 'proveedores' ? 'Proveedor' : 'Empleado'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('proveedores')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'proveedores'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building className="w-4 h-4" />
            Proveedores
          </button>
          <button
            onClick={() => setActiveTab('empleados')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'empleados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Empleados
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={`Buscar ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'proveedores' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Razón Social
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'proveedores'
                  ? filteredProveedores.map((proveedor) => (
                      <tr key={proveedor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {proveedor.razon_social}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proveedor.contacto || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proveedor.telefono || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proveedor.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(proveedor)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(proveedor.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  : filteredEmpleados.map((empleado) => (
                      <tr key={empleado.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {empleado.nombre_completo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            empleado.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            empleado.rol === 'GERENTE' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {empleado.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {empleado.telefono || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {empleado.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(empleado)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(empleado.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingItem ? 'Editar' : 'Agregar'} {activeTab === 'proveedores' ? 'Proveedor' : 'Empleado'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'proveedores' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={proveedorForm.razon_social}
                      onChange={(e) => setProveedorForm({...proveedorForm, razon_social: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto
                    </label>
                    <input
                      type="text"
                      value={proveedorForm.contacto}
                      onChange={(e) => setProveedorForm({...proveedorForm, contacto: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={proveedorForm.telefono}
                      onChange={(e) => setProveedorForm({...proveedorForm, telefono: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={proveedorForm.email}
                      onChange={(e) => setProveedorForm({...proveedorForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={empleadoForm.nombre_completo}
                      onChange={(e) => setEmpleadoForm({...empleadoForm, nombre_completo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      value={empleadoForm.rol}
                      onChange={(e) => setEmpleadoForm({...empleadoForm, rol: e.target.value as 'CAJERO' | 'GERENTE' | 'ADMIN'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CAJERO">Cajero</option>
                      <option value="GERENTE">Gerente</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={empleadoForm.telefono}
                      onChange={(e) => setEmpleadoForm({...empleadoForm, telefono: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={empleadoForm.email}
                      onChange={(e) => setEmpleadoForm({...empleadoForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}