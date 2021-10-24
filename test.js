require('dotenv').config();
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
const cors = require('cors');
const app = express();
const path = require('path');
app.use(express.static('public'));

app.use(cors());
app.get('/', function (req, res, next) {
  res.send('hello');
});

app.post('/profile', upload.single('avatar'), function (req, res, next) {
  console.log(req.file);
  res.json({ file: req.file });
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});

app.post(
  '/photos/upload',
  upload.array('photos', 12),
  function (req, res, next) {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
  }
);

const cpUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
]);
app.post('/cool-profile', cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
});
const port =
  process.env.NODE_ENV === 'production'
    ? process.env.PORT || 80
    : process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));
