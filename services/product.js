const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

module.exports = {
  create,
  getall,
  getProduct,
  searchProduct,
};
const secret = process.env.SECRET;
async function create(params) {
  console.log('create product params = ', params);
  let shop = await db.Shops.findOne({ where: { ownerId: params.ownerId } });
  let { allsize, ...noallsize } = params;
  let product = await db.Product.create({ shopId: shop.id, ...noallsize });
  params.allsize.map((c) => {
    db.SizeStock.create({ productId: product.id, ...c });
  });

  // validate
  //   if (await db.Products.findOne({ where: { shopId: params.ownerId } })) {
  //     throw 'User ID "' + params.ownerId + '" is already create a shop';
  //   }

  return 'successful create a product';
}

async function getall() {
  return await db.Product.findAll();
}

async function getProduct(id) {
  const product = await db.Product.findOne({ where: { id } });
  if (!product) throw 'cannot find prodct';
  console.log('get a product =', product);
  let myproduct = product.toJSON();
  const sizestocks = await db.SizeStock.findAll({
    where: { productId: product.id },
  });
  return { ...myproduct, sizestocks };
  // const sizestock = await db.SizeStock.findByPk
}

async function searchProduct(attr) {
  const product = await db.Product.findAll({
    where: { ...attr },
  });
  if (!product) throw 'cannot find prodct';
  console.log('get a product =', product);
  // const sizestocks = await db.SizeStock.findAll({
  //   where: { productId: product.id },
  // });
  return [...product];
  // const sizestock = await db.SizeStock.findByPk
}