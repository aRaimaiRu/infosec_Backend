const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    pictureurl: { type: DataTypes.STRING, allowNull: false },
    reportId: { type: DataTypes.INTEGER, allowNull: false },
  };

  return sequelize.define('Shop', attributes);
}
