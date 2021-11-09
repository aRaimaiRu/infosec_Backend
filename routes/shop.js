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
const { decodeBase64 } = require('bcryptjs');
const { x } = require('joi');
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
const uploadlogo = upload.fields([{ name: 'logo', maxCount: 1 }]);

// routes
router.post(
  '/approve',
  [authorize(), CheckAuthorizeWithTable('shops', 2, 2)],
  changeShopStatus
);
router.get('/getReportShop', getReportShop);
router.get('/getShopStatus/:shopstatus', [authorize()], getShopStatus);
router.get('/contact/:shopid', authorize(), getShopisContact);
router.post('/contact/:shopid', authorize(), contactShop);
router.get('/OwnShop', authorize(), getOwnShop);
router.get('/:shopid', getShop);
router.post('/Register', [authorize(), registerUpload], registerShop);
router.put('/updateShop', [authorize(), uploadlogo], changelogo);

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

async function getShop(req, res, next) {
  try {
    let shop = await shopService.getShop(req.params.shopid);
    let g = {
      ...shop,
      like: shop.Users.filter((d) => d.contact.like == 1).length,
      dislike: shop.Users.filter((d) => d.contact.like == -1).length,
      likeratio:
        shop.Users.filter((d) => d.contact.like == 1).length -
          shop.Users.filter((d) => d.contact.like == -1).length >
        0
          ? true
          : 1 -
              shop.Users.filter((d) => d.contact.like == 1).length /
                shop.Users.filter((d) => d.contact.like == -1).length >=
            0.8
          ? false
          : true,
    };
    res.json({ ...g });
  } catch (e) {
    next(e);
  }
}
function getShopisContact(req, res, next) {
  shopService
    .getShopisContact({ ShopId: req.params.shopid, UserId: req.user.id })
    .then((shop) => res.json({ ...shop }))
    .catch(next);
}

function contactShop(req, res, next) {
  console.log('contact Shop');
  shopService
    .contactShop({
      ShopId: parseInt(req.params.shopid),
      UserId: req.user.id,
      like: req.body.like,
    })
    .then((message) => res.json(message))
    .catch(next);
}

async function getOwnShop(req, res, next) {
  try {
    let result = await shopService.getOwnShop(req.user.id);
    let g = {
      ...result,
      like: result.contact.filter((d) => d.like == 1).length,
      dislike: result.contact.filter((d) => d.like == -1).length,
      likeratio:
        result.contact.filter((d) => d.like == 1).length -
          result.contact.filter((d) => d.like == -1).length >
        0
          ? true
          : 1 -
              result.contact.filter((d) => d.like == 1).length /
                result.contact.filter((d) => d.like == -1).length >=
            0.8
          ? false
          : true,
    };
    res.json({ ...g });
  } catch (e) {
    next(e);
  }
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

async function changelogo(req, res, next) {
  if (req.files['logo'][0]) {
    let shop = await shopService.getOwnShop(req.user.id);
    await shopService.update(shop.id, {
      logo:
        process.env.CURRENTURL + '/uploads/' + req.files['logo'][0].filename,
    });
    res.json({ message: 'success change logo' });
  }
}

async function getReportShop(req, res, next) {
  //get all shop and like
  try {
    console.log('getReportShopdsadasdas');
    // let allShop = await shopService.getReportShop();
    // console.log(allShop.map((c) => c.Users.filter((d) => d.contact.like == 1)));
    let a = await shopService.getReportShop();
    let g = a.map((x) => ({
      ...x.get(),
      like: x.Users.filter((d) => d.contact.like == 1).length,
      dislike: x.Users.filter((d) => d.contact.like == -1).length,
      likeratio:
        x.Users.filter((d) => d.contact.like == 1).length -
          x.Users.filter((d) => d.contact.like == -1).length >
        0
          ? true
          : 1 -
              x.Users.filter((d) => d.contact.like == 1).length /
                x.Users.filter((d) => d.contact.like == -1).length >=
            0.8
          ? false
          : true,
    }));
    let fillter = g.filter((f) => f.likeratio == false);
    res.send(fillter);
  } catch (e) {
    next(e);
  }
}

module.exports = router;
