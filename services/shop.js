const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

module.exports = {
    create,
    contactShop
  
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
    console.log({ShopId,UserId});
    if (await db.Contact.findOne({ where: { ShopId,UserId } })) {
        throw 'User ID "' + UserId + '" is already create a shop ShopId';
    }

    await db.Contact.create({ShopId,UserId});
    return "successful contact shop"

}


