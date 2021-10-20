const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    shopid: { type: DataTypes.INTEGER, allowNull: false },
    bookbanknumber: { type: DataTypes.STRING, allowNull: false },
    bookbankname: { type: DataTypes.STRING, allowNull: false },
  };

  return sequelize.define('Shop', attributes);
}
