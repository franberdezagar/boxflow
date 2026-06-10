import { DataTypes } from 'sequelize';

export const defineMovimiento = (sequelize) => {
  const Movimiento = sequelize.define(
    'Movimiento',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      turno_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      tipo_movimiento: {
        type: DataTypes.ENUM('INGRESO', 'EGRESO'),
        allowNull: false,
      },
      categoria: {
        type: DataTypes.ENUM('VENTA', 'PROVEEDOR', 'SUELDO', 'VARIOS'),
        allowNull: false,
      },
       condicion_fiscal: {
         type: DataTypes.ENUM('BLANCO', 'EFECTIVO_BLANCO', 'EFECTIVO_NEGRO'),
         allowNull: false,
       },
      monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      proveedor_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      empleado_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      comprobante: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'movimientos',
      indexes: [
        {
          fields: ['turno_id', 'fecha_hora'],
        },
        {
          fields: ['condicion_fiscal', 'tipo_movimiento'],
        },
      ],
    }
  );

  return Movimiento;
};
