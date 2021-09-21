const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const _ = require('lodash')

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    ChangeRole,
    refreshJWT,
    activate,
    reSendVerifyEmail,
    forgotpassword
};
const secret = process.env.SECRET
async function authenticate({ username, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { username },include:[db.Role] });
    // if (user.password !== password){
    //     throw 'Username or password is incorrect';
    // }
    if (!user || !(bcrypt.compareSync(password, user.password)))
        throw 'Username or password is incorrect';
    if(user.isVerify != true) throw "You need to Verify Email"

    // authentication successful
    const token = jwt.sign({ ...omitHash(user.get()),Role:user.Role.get().roleName }, secret, { expiresIn: '10m' });
    const refreshtoken = jwt.sign({ ...omitHash(user.get()),Role:user.Role.get().roleName }, secret, { expiresIn: '1h' });
    return { ...omitHash(user.get()),Role:user.Role.get().roleName, token,refreshtoken };
}

async function refreshJWT(rftoken){
    try{
    let decoded = jwt.verify(rftoken, secret);
    const user = await db.User.scope('withHash').findOne({ where: { username:decoded.username },include:[db.Role] });
    if(!user)throw "UnauthorizedError"
    const token = jwt.sign({ ...omitHash(user.get()),Role:user.Role.get().roleName }, secret, { expiresIn: '10m' });
    const refreshtoken = jwt.sign({ ...omitHash(user.get()),Role:user.Role.get().roleName }, secret, { expiresIn: '1h' });
    // console.log("Refresh JWT = ",user.get())
    return { ...omitHash(user.get()),Role:user.Role.get().roleName, token,refreshtoken };
    }catch(e){
        throw e
    }
    
}


async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.password = bcrypt.hashSync(params.password, 10);
    }
    // save user
    await db.User.create(params);
    return await db.User.findOne({ where: { username: params.username } });
}

async function update(id, params) {
    const user = await getUser(id);
    console.log("id =",id)
    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.User.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    // if (params.password) {
    //     params.hash = await bcrypt.hash(params.password, 10);
    // }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    console.log("id === ",id)
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { password, ...userWithoutHash } = user;
    return userWithoutHash;
}
async function ChangeRole({userId,roleId}) {
    const user = await db.User.findByPk(userId);
    user.RoleId = roleId;
    user.save();
    return "sucessful change user Role"
}

async function activate({id}){
    console.log("activate id:",id)
    const user = await db.User.findByPk(id)
    if(!user)throw "no User"
    if(omitHash(user.get()).isVerify == true) throw "already have this user"
    user.isVerify = true;
    user.save();
    return "activate user Successful"

}

async function forgotpassword({username}){
    const user = await db.User.findOne({ where: { username } })
    if(!user)throw "no User" 
    const token = jwt.sign({id:user.id}, secret, { expiresIn: '1d' });
    return token



}
    // const token = jwt.sign({ ...omitHash(user.get()),Role:user.Role.get().roleName }, secret, { expiresIn: '10m' });
    // const refreshtoken = jwt.sign({ ...omitHash(user.get()),Role:user.Role.get().roleName }, secret, { expiresIn: '1h' });
async function reSendVerifyEmail({username}) {
    const user = await db.User.findOne({ where: { username } })
    if(user.isVerify) throw "Already Verify Email"
    return user
    
}
