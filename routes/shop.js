const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middlewares/validate-request');
const authorize = require('../middlewares/auth')
const userService = require('../services/user');
const shopService = require('../services/shop');


// routes
router.post('/contact/:shopid', authorize(),contactShop);
router.get('/:shopid', authorize(),contactShop);

function contactShop(req,res,next){
    console.log(req.user)
    shopService.contactShop({ShopId:parseInt(req.params.shopid),UserId:req.user.id})
    .then(message=>res.json(message))
    .catch(next)

}



module.exports = router;

