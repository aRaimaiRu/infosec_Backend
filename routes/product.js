const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middlewares/validate-request');
const authorize = require('../middlewares/auth');
const userService = require('../services/user');
const shopService = require('../services/shop');
const productService = require('../services/product');
const CheckAuthorizeWithTable = require('../middlewares/checkRolePermission');
const util = require('util');

const multer = require('multer');
// const upload = multer({ dest: 'public/uploads/' });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
  },
});

const upload = multer({ storage: storage });
const registerUpload = upload.fields([{ name: 'previewurl', maxCount: 1 }]);

// routes
router.post('/add', [authorize(), registerUpload], addProduct);
router.get('/all', getAll);
// router.post(
//   '/approve',
//   [authorize(), CheckAuthorizeWithTable('shops', 2, 2)],
//   changeShopStatus
// );
// router.get('/contact/:shopid', authorize(), getShopisContact);
// router.post('/contact/:shopid', authorize(), contactShop);
// router.get('/OwnShop', authorize(), getOwnShop);
// router.get('/:shopid', getShop);
// router.post('/Register', [authorize(), registerUpload], registerShop);

async function addProduct(req, res, next) {
  try {
    console.log('add Product');
    console.log(req.user);
    console.log(req.body);
    console.log(req.files['previewurl'][0]);
    productService.create({
      ...req.body,
      previewurl:
        process.env.CURRENTURL +
        '/uploads/' +
        req.files['previewurl'][0].filename,
      allsize: JSON.parse(req.body.allsize),
      ownerId: req.user.id,
    });
  } catch (e) {
    next(e);
  }
}
async function getAll(req, res, next) {
  const data = await productService.getall();
  res.json(data);
}
module.exports = router;
