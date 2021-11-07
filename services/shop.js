const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

module.exports = {
  create,
  contactShop,
  getShop,
  getOwnShop,
  getShopisContact,
  changeShopStatus,
  getShopStatus,
  update,
  getReportShop,
};
const secret = process.env.SECRET;
async function create(params) {
  console.log('create shop params = ', params);
  // validate
  if (await db.Shops.findOne({ where: { ownerId: params.ownerId } })) {
    throw 'User ID "' + params.ownerId + '" is already create a shop';
  }

  await db.Shops.create(params);
  return 'successful create a shop';
}

async function contactShop({ ShopId, UserId, like }) {
  // validate
  let userlikeshop = await db.Contact.findOne({ where: { ShopId, UserId } });
  if (userlikeshop) {
    userlikeshop.like = like;
    await userlikeshop.save();
    // throw 'User ID "' + UserId + '" is already create a shop ShopId';
  } else {
    await db.Contact.create({ ShopId, UserId, like });
  }

  return 'successful contact shop';
}

async function getShop(id) {
  let shop = await db.Shops.findOne({ where: { id }, include: [db.User] });
  if (!shop) throw 'cant find shop';
  return shop.toJSON();
}

async function getOwnShop(ownerId) {
  let shop = await db.Shops.findOne({ where: { ownerId } });

  let contact = await db.Contact.findAll({ where: { shopId: shop.id } });

  return { ...shop.toJSON(), contact };
}
async function getShopisContact({ UserId, ShopId }) {
  let shop = await db.Shops.findByPk(ShopId);
  let isAlreadyContact;
  if (!shop) throw 'shop not found';
  let contact = await db.Contact.findOne({ where: { UserId, ShopId } });
  if (contact) {
    isAlreadyContact = 1;
  }

  return { ...shop.toJSON(), isAlreadyContact };
}

async function changeShopStatus({ shopId, status }) {
  let shop = await db.Shops.findByPk(shopId);
  console.log('change shop status shop =', shop);
  if (!shop) return "can't find specifify shop";
  shop.shopstatus = status;

  await shop.save();
  return `successful change status ${shop.name} to ${status} `;
}
async function getShopStatus(shopstatus) {
  return await db.Shops.findAll({ where: { shopstatus } });
}

async function update(id, params) {
  console.log('id =', id);
  let shop = await db.Shops.findByPk(id);

  // copy params to user and save
  Object.assign(shop, params);
  await shop.save();

  return shop.get();
}

async function getReportShop() {
  let shops = await db.Shops.findAll({
    where: { shopstatus: 'opened' },
    include: [db.User],
  });
  return [...shops];
}
