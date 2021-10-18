const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    comment: { type: DataTypes.STRING, allowNull: false },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    shopId: { type: DataTypes.INTEGER, allowNull: false },
  };

  return sequelize.define('Shop', attributes);
}
