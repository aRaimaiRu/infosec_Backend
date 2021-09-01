const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middlewares/validate-request');
const authorizeForRoleId = require('../middlewares/authorizeForId');
const authorize = require('../middlewares/auth')
const userService = require('../services/user');
const shopService = require('../services/shop');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/register/shop', [authorize(),authorizeForRoleId(1),registerShopSchema], registerShop);//FE ->register as User -> login ->register as shop
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);

}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => res.json(user))
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
// function authorizeForRoleId(Role){
//     return (req,res,next)=>{
//         if (req.user.RoleId != Role){
//             return res.json({message:'Permission mismatch'})
//         }
//         next()
    
//     }

// }

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