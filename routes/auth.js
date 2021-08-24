const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");
  
    user = new User(_.pick(req.body, ["email", "password"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
  
    const token = user.generateAuthToken();
    // res.header("x-auth-token", token).json(_.pick(user, ["_id", "email"]));
    res.json({ _id: token });
  });

// function validate(req) {
//   const schema = Joi.object({
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(5).max(255).required(),
//     name: Joi.string().min(5).max(255).required(),
//     surname:Joi.string().min(5).max(255).required()
//   });

//   return schema.validate(req);
// }

module.exports = router;