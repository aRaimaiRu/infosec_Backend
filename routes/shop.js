const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middlewares/validate-request');
const authorize = require('../middlewares/auth')
const userService = require('../services/user');
const shopService = require('../services/shop');


// routes
router.get('/contact/:shopid', authorize(),getShopisContact);
router.post('/contact/:shopid', authorize(),contactShop);
router.get('/OwnShop',authorize(),getOwnShop);
router.get('/:shopid',getShop);



function getShop(req,res,next){
    shopService.getShop(req.params.shopid)
    .then(shop=>res.json({...shop}))
    .catch(next)
    

}
function getShopisContact(req,res,next){
    shopService.getShopisContact({ShopId:req.params.shopid,UserId:req.user.id})
    .then(shop=>res.json({...shop}))
    .catch(next)
    

}



function contactShop(req,res,next){
    shopService.contactShop({ShopId:parseInt(req.params.shopid),UserId:req.user.id})
    .then(message=>res.json(message))
    .catch(next)

}

function getOwnShop(req,res,next){
    shopService.getOwnShop(req.user.id)
    .then(message=>res.json(message))
    .catch(next)

}


module.exports = router;

