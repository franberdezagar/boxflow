import { DataTypes } from 'sequelize';

export const defineEmpleado = (sequelize) => {
  const Empleado = sequelize.define(
    'Empleado',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre_completo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM('CAJERO', 'GERENTE', 'ADMIN'),
        allowNull: false,
        defaultValue: 'CAJERO',
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: 'empleados',
    }
  );

  return Empleado;
};
