require('dotenv').config();
const express = require('express');
const cors = require("cors");
const pool = require('./db');
const user = require('./routes/auth');
const shop = require('./routes/shop');
const role = require('./routes/role');
const errorHelpers = require('./middlewares/error-handler');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use("/api/user",user);
app.use("/api/shop",shop);
app.use("/api/role",role);

app.get("/",async(req,res)=>{
    res.status(200).send("sucess")

})
app.use(errorHelpers);

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 3002;
app.listen(port, () => console.log(`Listening on port ${port}`));