// here we import the mariadb

const { includes } = require('lodash');
const mysql = require('mariadb');
const { Sequelize } = require('sequelize');


const host = process.env.HOST;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DB;

const pool = mysql.createPool({
  host,
  user ,
  password,
  database
});

module.exports = db = {};

function startcon(){
  return new Promise(function(resolve,reject){
    pool.getConnection().then(function(connection){
      resolve(connection);
    }).catch(function(error){
      reject(error);
    });
  });
}




initialize();




async function initialize() {
    // create db if it doesn't already exist
    const connection = await startcon();
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mariadb' });

    // init models and add them to the exported db object
    db.User = require('./models/Users')(sequelize);//return sequelize.models.User
    db.Shops = require('./models/Shops')(sequelize);
    db.Role = require('./models/Roles')(sequelize);
    //User and Role relation
    db.Role.hasMany(db.User);
    db.User.belongsTo(db.Role);
    //customers and shop contact
    db.Contact = sequelize.define('contact');
    db.Shops.belongsToMany(db.User,{through:db.Contact});
    //user own only one shop
    db.User.hasOne(db.Shops,{foreignKey:"ownerId"});

    // sync all models with database
    await sequelize.sync({alter:true});
    //create Role
    // await db.Role.create({roleName:"Customer"});
    // await db.Role.create({roleName:"ShopOwner"});
    // await db.Role.create({roleName:"Admin"});

    //update Role
    // let updateRoleAdmin = {id:3,users:"0222",shops:"0222",contacts:"0222",roles:"2222"}
    // try{
    //   await db.Role.update(updateRoleAdmin, {
    //     where: {
    //       id: updateRoleAdmin.id
    //     }
    //   });
    // }catch(e){
    //   console.log("e =",e)
    // }
    

    //create Admin
    let admin = await db.User.findOne({where:{username:process.env.ADMINUSERNAME}})
    if(!admin){
      db.User.create({
        firstName: process.env.ADMINFIRSTNAME,
        lastName: process.env.ADMINLASTNAME,
        username: process.env.ADMINUSERNAME,
        password: process.env.ADMINPASSWORD,
        RoleId: process.env.ADMINROLEID
      })
    }


    // let testQU = await db.User.findAll({include:[{model:db.Role}]});
    // console.log("testQU =",JSON.stringify(testQU,null,1))
}



