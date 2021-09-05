const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        roleName: { type: DataTypes.STRING, allowNull: false },
        users:{ type: DataTypes.STRING, allowNull: false },
        shops:{ type: DataTypes.STRING, allowNull: false },
        contacts:{ type: DataTypes.STRING, allowNull: false },
        roles:{ type: DataTypes.STRING, allowNull: false }

    };



    return sequelize.define('Role', attributes);
}