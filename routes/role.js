const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middlewares/validate-request');
const authorize = require('../middlewares/auth')
const rolesSrvice = require('../services/role');
const CheckAuthorizeWithTable = require('../middlewares/checkRolePermission');
const { route } = require('./auth');

//operation CRUD 1234
// routes
// router.get('/')
// router.post('/create')
router.put('/update',[authorize(),CheckAuthorizeWithTable("roles",2,2)],updateRole)//middleware check user permission need to be Admin
// CheckAuthorizeWithTable(tablename,authorizationlevel,operation)
// router.delete('/delete')




function updateRole(req,res,next){
    rolesSrvice.updateRole(req.body)
    .then(message=>res.json(message))
    .catch(e=>next(e))
    

}

module.exports = router;

