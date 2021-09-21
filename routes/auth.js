const express = require('express');
const router = express.Router();
const Joi = require('joi');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const transport = require("../mailtranport")
const validateRequest = require('../middlewares/validate-request');
const authorize = require('../middlewares/auth')
const userService = require('../services/user');
const shopService = require('../services/shop');
const CheckAuthorizeWithTable = require('../middlewares/checkRolePermission');

// routes

router.get('/refreshToken',refreshTK)
router.get('/activate/:id',activate)
router.post('/sendforgetpasswordemail',usernameschema,sendforgetpasswordemail)
router.put('/repassword',[authorize(),passwordschema],resetpassword)
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


function activate(req,res,next){
    userService.activate({id:req.params.id})
    .then(message => res.status(200).send(message))
    .catch(e=>next(e))
}


function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().email().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);

}
function usernameschema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().email().required(),
    });
    validateRequest(req, next, schema);
}
function passwordschema(req, res, next) {
    const schema = Joi.object({
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
        .then(async (user)=>{
            let info = await transport.sendMail({
                from: process.env.SENDEREMAIL, // อีเมลผู้ส่ง
                to: req.body.username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
                subject: 'Verification', // หัวข้ออีเมล
                text: 'Please click button to Verify Email', // plain text body
                html: `<form method="get" action="${process.env.CURRENTURL+"/api/user/activate/"+user.id}"> <button type="submit">Verify</button> </form>` // html body
                });
                console.log("send verify Email complete")
                return info
        })
        .then((user) => res.json({ message: 'Registration  successful' }))
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
    if(req.params.id != req.user.id) return res.json({message:'Unauthorized Failed to Update'})
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    if(req.params.id != req.user.id) return res.json({message:'Unauthorized Failed to Delete'})
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


function resendVerificationmail(req, res, next) {
    userService.reSendVerifyEmail({username:req.body.username})
        .then(async (user)=>{
            let info = await transport.sendMail({
                from: process.env.SENDEREMAIL, // อีเมลผู้ส่ง
                to: req.body.username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
                subject: 'Verification', // หัวข้ออีเมล
                text: 'Please click button to Verify Email', // plain text body
                html: `<p>Please click button to Verify Email<form method="get" action="${process.env.CURRENTURL+"/api/user/activate/"+user.id}"> <button type="submit">Verify</button> </form></p>` // html body
                });
                console.log("send verify Email complete")
                return info
        })
        .then((user) => res.json({message:"Resend Verification Email Successfully"}))
        .catch(next);
}





async function sendforgetpasswordemail(req,res,next){
    try{
    //check for username (email)
    const token = await userService.forgotpassword({username:req.body.username})
    let info = await transport.sendMail({
    from: process.env.SENDEREMAIL, // อีเมลผู้ส่ง
    to: req.body.username, // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
    subject: 'Reset Password', // หัวข้ออีเมล
    text: 'Please click button to Reset Password ', // plain text body
    html: `<p>Please click button to Reset Password</p>
    ${process.env.CORSURL+"/Repassword?token="+token}"` // html body
    });
    console.log("send Reset Password mail complete")
    return res.json({message:"Send Reset Password Mail Successful"})
    }catch(e){
        next(e)
    }
    //create token and send token


}
async function resetpassword(req,res,next){
    password = await bcrypt.hashSync(req.body.password, 10);
    userService.update(req.user.id, {password})
    .then(user => res.json(user))
    .catch(next);

}