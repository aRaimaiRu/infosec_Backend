const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    ownerId: { type: DataTypes.INTEGER, allowNull: false },
    shoptel: { type: DataTypes.STRING, allowNull: false },
    qrcodeline: { type: DataTypes.STRING, allowNull: true },
    Logo: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.STRING, allowNull: true },
  };

  return sequelize.define('Shop', attributes);
}
