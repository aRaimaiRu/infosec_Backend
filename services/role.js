const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
// const { where } = require('sequelize/types');
const secret = process.env.SECRET;




module.exports = {
    createRole,
    retrieveRole,
    updateRole,
    deleteRole,
    retrieveAllRole
  
};
async function createRole(roledata){
    let role = await db.Role.findOne({where:{roleName:roledata.roleName}})
    if(role) throw `Role ${roledata.roleName} is already exists`
    return await db.Role.create(roledata)
}

async function retrieveRole(roledata){
    return await db.Role.findOne({where:{
        [OP.or]:[
            {id:roledata.id},
            {roleName:roledata.roleName}
        ]
    }})

    
}
async function retrieveAllRole(roledata){
    return await db.Role.findAll()

    
}

async function updateRole(roledata){
    await db.Role.update(roledata, {
        where: {
          id: roledata.id
        }
      });
    return "update role success"

}
async function deleteRole(roledata){
    return await User.destroy({
        where: {
          id: roledata.id
        }
      });

}