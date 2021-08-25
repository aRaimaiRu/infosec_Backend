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
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.User = require('./models/Users')(sequelize);

    // sync all models with database
    await sequelize.sync();
}



