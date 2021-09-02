// here we import the mariadb

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
    //customers and shop contact
    db.Contact = sequelize.define('contact');
    db.Shops.belongsToMany(db.User,{through:db.Contact});
    //user own only one shop
    db.User.hasOne(db.Shops,{foreignKey:"ownerId"});

    //create Role
    // await db.Role.create({roleName:"Customer"});
    // await db.Role.create({roleName:"ShopOwner"});
    // await db.Role.create({roleName:"Admin"});

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

    // sync all models with database
    await sequelize.sync({alter:true});
}



