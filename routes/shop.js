const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middlewares/validate-request');
const authorize = require('../middlewares/auth');
const userService = require('../services/user');
const shopService = require('../services/shop');
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
const registerUpload = upload.fields([
  { name: 'promptPayImg', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'IDcardImage', maxCount: 1 },
]);

// routes
router.post(
  '/approve',
  [authorize(), CheckAuthorizeWithTable('shops', 2, 2)],
  changeShopStatus
);
router.get('/getShopStatus/:shopstatus', [authorize()], getShopStatus);
router.get('/contact/:shopid', authorize(), getShopisContact);
router.post('/contact/:shopid', authorize(), contactShop);
router.get('/OwnShop', authorize(), getOwnShop);
router.get('/:shopid', getShop);
router.post('/Register', [authorize(), registerUpload], registerShop);

function registerShopSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    shoptel: Joi.string().required(),
    qrcodelink: Joi.required(),
    logo: Joi.required(),
    description: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

async function registerShop(req, res, next) {
  console.log('register shop');
  console.log(req.user);
  console.log(req.files['logo'][0]);
  shopService
    .create({
      ...req.body,
      ownerId: req.user.id,
      logo:
        process.env.CURRENTURL + '/uploads/' + req.files['logo'][0].filename,
      promptPayImg:
        process.env.CURRENTURL +
        '/uploads/' +
        req.files['promptPayImg'][0].filename,
      IDcardImage:
        process.env.CURRENTURL +
        '/uploads/' +
        req.files['IDcardImage'][0].filename,
      shopstatus: 'pending',
    })
    .then(() => {
      userService.ChangeRole({ userId: req.user.id, roleId: 2 });
    })
    .then(() => res.json({ message: 'Registration successful' }))

    .catch(next);
}

function getShop(req, res, next) {
  shopService
    .getShop(req.params.shopid)
    .then((shop) => res.json({ ...shop }))
    .catch(next);
}
function getShopisContact(req, res, next) {
  shopService
    .getShopisContact({ ShopId: req.params.shopid, UserId: req.user.id })
    .then((shop) => res.json({ ...shop }))
    .catch(next);
}

function contactShop(req, res, next) {
  shopService
    .contactShop({ ShopId: parseInt(req.params.shopid), UserId: req.user.id })
    .then((message) => res.json(message))
    .catch(next);
}

function getOwnShop(req, res, next) {
  shopService
    .getOwnShop(req.user.id)
    .then((message) => res.json(message))
    .catch(next);
}

function changeShopStatus(req, res, next) {
  console.log('change shop status body = ', req.body);
  if (
    req.body.status !== 'pending' &&
    req.body.status !== 'closed' &&
    req.body.status !== 'opened'
  ) {
    return res.status(401).json({ message: 'status mismatch' });
  }
  shopService
    .changeShopStatus({ shopId: req.body.shopId, status: req.body.status })
    .then((message) => res.json({ message }))
    .catch(next);
}
function getShopStatus(req, res, next) {
  console.log('get pendingShop', req.params.shopstatus);
  shopService
    .getShopStatus(req.params.shopstatus)
    .then((shoplist) => res.json(shoplist))
    .catch(next);
}

module.exports = router;
