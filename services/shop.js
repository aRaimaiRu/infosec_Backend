const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

module.exports = {
    create,
    contactShop,
    getShop,
    getOwnShop,
    getShopisContact,
    changeShopStatus
  
};
const secret = process.env.SECRET;
async function create(params) {
    // validate
    if (await db.Shops.findOne({ where: { ownerId: params.ownerId } })) {
        throw 'User ID "' + params.sub + '" is already create a shop';
    }

    await db.Shops.create(params);
    return "successful create a shop"

}

async function contactShop({ShopId,UserId}) {
    // validate

    if (await db.Contact.findOne({ where: { ShopId,UserId } })) {
        throw 'User ID "' + UserId + '" is already create a shop ShopId';
    }

    await db.Contact.create({ShopId,UserId});
    return "successful contact shop"

}

async function getShop(shopId) {
    let shop = await db.Shops.findByPk(shopId)
    return shop.toJSON()


}

async function getOwnShop(ownerId){

    let shop = await db.Shops.findOne({where:{ownerId}})

    let contact = await db.Contact.findAll({where:{shopId:shop.id}})
    
    return {...shop.toJSON(),contact}
    

}
async function getShopisContact({UserId,ShopId}){

    let shop = await db.Shops.findByPk(ShopId)
    let isAlreadyContact;
    if(!shop) throw "shop not found";
    let contact = await db.Contact.findOne({where:{UserId,ShopId}})
    if(contact){
        isAlreadyContact = 1;
    }

    return {...shop.toJSON(),isAlreadyContact}

}

async function changeShopStatus({shopId,status}){
    let shop = await db.Shops.findByPk(shopId);
    if(!shop) return "can't find specifify shop";
    shop.status = status

    await shop.save();
    return `successful change status ${shop.name} to ${status} `


}


