const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    shopId: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    brand: { type: DataTypes.STRING, allowNull: true },
    productfrom: { type: DataTypes.STRING, allowNull: false },
    tag: { type: DataTypes.STRING, allowNull: true },
    previewurl: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.STRING, allowNull: false },
    // realeasedate: { type: DataTypes.TIME, allowNull: true },
  };

  return sequelize.define('Product', attributes);
}
