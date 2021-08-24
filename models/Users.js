const Joi = require("joi");
const pool = require("../db")
const express = require("express");





exports.register = async function register(email,password,name,surname){
    con = await pool.getConnection();
    const [rows] = await con.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    console.log("rows =",email)
    if (rows) {
        throw Error("This email already in use.");
    }

    const row = await con.query(
        "INSERT INTO users (name,surname,email,password) VALUES(?,?,?,?)",
        [name,surname,email,password]
    );
    console.log(row);
    if (row.affectedRows !== 1) {
        throw Error("Your registration has failed.");
    }
    const [regis] = await con.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return regis
    
}

exports.getAllUsers = async ()=>{
    con = await pool.getConnection();
    const rows = await con.query(
        "select * from users"
    );
    return rows
    
}
exports.deleteUsers = async (id)=>{
    con = await pool.getConnection();
    const row = await con.query(
        "delete from users where id=? LIMIT 1"
        ,[id]
    );
    if(row.affectedRows !==1){
        throw Error("Failed to Delete");
    } 
    return row

}
exports.updateUsers = async(id,data)=>{
    con = await pool.getConnection();
    const row = await con.query("UPDATE users SET email = ? , password = ? , name = ?, surname = ?   WHERE id = ?",[data.email,data.password,data.name,data.surname,id]);
    console.log(row);
    if(row.affectedRows !==1){
        throw Error("Failed to update");
    } 
    const updatedRow = await con.query("select * from users where id=?",[id]);
    return updatedRow

}






// CREATE TABLE users (
//     id int(10) unsigned NOT NULL AUTO_INCREMENT,
//     name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
//     surname varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
//     email varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
//     password varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,

//     PRIMARY KEY (id),
//     UNIQUE KEY email (email)
//    ) ENGINE=InnoDB COLLATE=utf8mb4_unicode_ci;