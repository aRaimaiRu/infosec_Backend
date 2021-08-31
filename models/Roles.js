const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        roleName: { type: DataTypes.STRING, allowNull: false },
    };



    return sequelize.define('Role', attributes);
}