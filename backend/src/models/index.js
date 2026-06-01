import { defineTurno } from './Turno.js';
import { defineProveedor } from './Proveedor.js';
import { defineEmpleado } from './Empleado.js';
import { defineMovimiento } from './Movimiento.js';

export const initializeModels = (sequelize) => {
  const Turno = defineTurno(sequelize);
  const Proveedor = defineProveedor(sequelize);
  const Empleado = defineEmpleado(sequelize);
  const Movimiento = defineMovimiento(sequelize);

  // Relaciones
  Movimiento.belongsTo(Turno, {
    foreignKey: 'turno_id',
    as: 'turno',
  });

  Movimiento.belongsTo(Proveedor, {
    foreignKey: 'proveedor_id',
    as: 'proveedor',
    allowNull: true,
  });

  Movimiento.belongsTo(Empleado, {
    foreignKey: 'empleado_id',
    as: 'empleado',
    allowNull: true,
  });

  Turno.hasMany(Movimiento, {
    foreignKey: 'turno_id',
    as: 'movimientos',
  });

  Proveedor.hasMany(Movimiento, {
    foreignKey: 'proveedor_id',
    as: 'movimientos',
  });

  Empleado.hasMany(Movimiento, {
    foreignKey: 'empleado_id',
    as: 'movimientos',
  });

  return {
    Turno,
    Proveedor,
    Empleado,
    Movimiento,
  };
};
