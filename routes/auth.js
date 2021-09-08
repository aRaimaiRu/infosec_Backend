const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middlewares/validate-request');
const authorize = require('../middlewares/auth')
const userService = require('../services/user');
const shopService = require('../services/shop');
const CheckAuthorizeWithTable = require('../middlewares/checkRolePermission');
// routes
router.get('/refreshToken',refreshTK)
router.post('/logout', logout);
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/register/shop', [authorize(),CheckAuthorizeWithTable("shops",1,1),registerShopSchema], registerShop);//FE ->register as User -> login ->register as shop
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

const options = {
    maxAge: 1000 * 60 * 60*24 , // would expire after 1day
    httpOnly: true,
    signed: true
}


function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);

}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => {
            let {refreshtoken,...userobj} = user
            res.cookie('refreshToken', refreshtoken, options)
            res.json(userobj)
        })
        .catch(next);
}

function refreshTK(req,res,next){

    //Get the refresh token from cookie
    if(!req.signedCookies.refreshToken)
    return res.status(401).json({message:"need refresh Token"})
    userService.refreshJWT(req.signedCookies.refreshToken)
    .then(user => {

        let {refreshtoken,...userobj} = user

        res.cookie('refreshToken', refreshtoken, options)
        res.json(userobj)
    })
    .catch(next);

}



function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema);
}
function registerShopSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}


function register(req, res, next) {
    userService.create({...req.body,RoleId:1})
        .then(() => res.json({ message: 'Registration Shop successful' }))
        .catch(next);
}



async function registerShop(req, res, next) {
    let shop = {
        name:req.body.name,
        address:req.body.address,
        ownerId:req.user.id,
        status:"pending"
    }
    await userService.ChangeRole({userId:req.user.id,roleId:2});
    shopService.create(shop)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        username: Joi.string().empty(''),
        password: Joi.string().min(6).empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    if(req.params.id != req.user.sub) return res.json({message:'Unauthorized Failed to Update'})
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    if(req.params.id != req.user.sub) return res.json({message:'Unauthorized Failed to Delete'})
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}

function logout(req,res,next){
    try{
        res.clearCookie('refreshToken');
        res.json({message:"logout success"})

    }catch(e){
        next(e)
    }




}