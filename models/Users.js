const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        username: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        isVerify: { type: DataTypes.BOOLEAN,allowNull:false,defaultValue:false}
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['password'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('User', attributes, options);
}


// The defaultScope configures the model to exclude the password hash from query results by default.
//  The withHash scope can be used to query users and include the password hash field in results.



// CREATE TABLE users (
//     id int(10) unsigned NOT NULL AUTO_INCREMENT,
//     name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
//     surname varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
//     email varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
//     password varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,

//     PRIMARY KEY (id),
//     UNIQUE KEY email (email)
//    ) ENGINE=InnoDB COLLATE=utf8mb4_unicode_ci;