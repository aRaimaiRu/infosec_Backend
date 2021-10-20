// here we import the mariadb

const { includes } = require('lodash');
const mysql = require('mariadb');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const sha256 = require('sha256');
const host = process.env.HOST;
const username = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DB;
const port = process.env.DBPORT;

console.log(host, username, password, database);

// const pool = mysql.createPool({
//   host,
//   port,
//   username ,
//   password,
//   database
// });

module.exports = db = {};

// function startcon(){
//   return new Promise(function(resolve,reject){
//     pool.getConnection().then(function(connection){
//       resolve(connection);
//     }).catch(function(error){
//       reject(error);
//     });
//   });
// }

initialize();

async function initialize() {
  // create db if it doesn't already exist
  try {
    // const connection = await startcon();
    // await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database||process.env.database}\`;`);
    console.log('success connect ?');
    // connect to db
    const sequelize = await new Sequelize(database, username, password, {
      host: '159.138.252.91',
      dialect: 'mariadb',
    }); //host = database service name dev locahost or prod mysql

    // init models and add them to the exported db object
    db.User = require('./models/Users')(sequelize); //return sequelize.models.User
    db.Shops = require('./models/Shops')(sequelize);
    db.Role = require('./models/Roles')(sequelize);
    //User and Role relation
    db.Role.hasMany(db.User);
    db.User.belongsTo(db.Role);
    //customers and shop contact
    db.Contact = sequelize.define('contact');
    db.Shops.belongsToMany(db.User, { through: db.Contact });
    //user own only one shop
    db.User.hasOne(db.Shops, { foreignKey: 'ownerId' });
    // sync all models with database
    await sequelize.sync({ alter: true });
    //create Role
    if (!(await db.Role.findOne({ where: { roleName: 'Customer' } }))) {
      await db.Role.create({
        roleName: 'Customer',
        users: '1111',
        shops: '1211',
        contacts: '1111',
        roles: '0100',
      });
      await db.Role.create({
        roleName: 'ShopOwner',
        users: '1111',
        shops: '1211',
        contacts: '1111',
        roles: '0100',
      });
      await db.Role.create({
        roleName: 'Admin',
        users: '0222',
        shops: '0222',
        contacts: '0222',
        roles: '2222',
      });
    }
    //update Role
    // let customerRole = {id:1,users:"1111",shops:"1211",contacts:"1111",roles:"0100"}
    // let shopOwner = {id:2,users:"1111",shops:"1211",contacts:"1111",roles:"0100"}
    // let updateRoleAdmin = {id:3,users:"0222",shops:"0222",contacts:"0222",roles:"2222"}

    // await db.Role.update(updateRoleAdmin, {
    //   where: {
    //     id: updateRoleAdmin.id
    //   }
    // });
    // await db.Role.update(shopOwner, {
    //   where: {
    //     id: shopOwner.id
    //   }
    // });
    // await db.Role.update(customerRole, {
    //   where: {
    //     id: customerRole.id
    //   }
    // });

    //create Admin
    let admin = await db.User.findOne({
      where: { username: process.env.ADMINUSERNAME },
    });

    if (!admin) {
      bcrypt.hash(process.env.ADMINPASSWORD, 10, async function (err, hash) {
        try {
          await db.User.create({
            firstName: process.env.ADMINFIRSTNAME,
            lastName: process.env.ADMINLASTNAME,
            username: process.env.ADMINUSERNAME,
            password: hash,
            RoleId: process.env.ADMINROLEID,
          });
        } catch (e) {
          console.log('e =', e);
        }
      });
    }
  } catch (e) {
    console.log('e =', e);
  }

  // let testQU = await db.User.findAll({include:[{model:db.Role}]});
  // console.log("testQU =",JSON.stringify(testQU,null,1))
}
