// here we import the mariadb
const mariadb = require('mariadb');
require('dotenv').config();
// here we create a new connection pool
const pool = mariadb.createPool({
  host: process.env.HOST, 
  user: process.env.USER, 
  password: process.env.PASSWORD,
  database: process.env.DB
});

// here we are exposing the ability to creating new connections
module.exports={
    getConnection: function(){
      return new Promise(function(resolve,reject){
        pool.getConnection().then(function(connection){
          resolve(connection);
        }).catch(function(error){
          reject(error);
        });
      });
    }
  }