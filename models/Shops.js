const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    shopName: { type: DataTypes.STRING, allowNull: false },
    shopAddress: { type: DataTypes.STRING, allowNull: false },
    ownerId: { type: DataTypes.INTEGER, allowNull: false },
    shopTel: { type: DataTypes.STRING, allowNull: false },
    promptPayImg: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING, allowNull: false },
    IDcard: { type: DataTypes.STRING, allowNull: false },
    IDcardImage: { type: DataTypes.STRING, allowNull: false },
    shopstatus: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    LinkIDLine: { type: DataTypes.STRING, allowNull: false },
  };

  return sequelize.define('Shop', attributes);
}
