import { DataTypes } from 'sequelize';

export const defineProveedor = (sequelize) => {
  const Proveedor = sequelize.define(
    'Proveedor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      razon_social: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      contacto: {
        type: DataTypes.STRING(255),
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
      tableName: 'proveedores',
    }
  );

  return Proveedor;
};
