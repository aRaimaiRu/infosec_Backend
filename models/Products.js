const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    shopId: { type: DataTypes.INTEGER, allowNull: false },
    productname: { type: DataTypes.STRING, allowNull: false },
    previewurl: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.STRING, allowNull: false },
    realeasedate: { type: DataTypes.TIME, allowNull: true },
    tag: { type: DataTypes.STRING, allowNull: true },
  };

  return sequelize.define('Shop', attributes);
}
