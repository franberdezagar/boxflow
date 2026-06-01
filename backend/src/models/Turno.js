import { DataTypes } from 'sequelize';

export const defineTurno = (sequelize) => {
  const Turno = sequelize.define(
    'Turno',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre_turno: {
        type: DataTypes.ENUM('MAÑANA', 'TARDE'),
        allowNull: false,
      },
      fecha_apertura: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      fecha_cierre: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('ABIERTO', 'CERRADO'),
        allowNull: false,
        defaultValue: 'ABIERTO',
      },
      efectivo_inicial_blanco: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      efectivo_inicial_negro: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      efectivo_final_blanco_esperado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      efectivo_final_negro_esperado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      efectivo_final_blanco_declarado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      efectivo_final_negro_declarado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      notas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'turnos',
      indexes: [
        {
          fields: ['estado', 'fecha_apertura'],
        },
      ],
    }
  );

  return Turno;
};
