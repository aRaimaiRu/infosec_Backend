const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const users = require("../models/Users");
const express = require("express");
const router = express.Router();


router.get("/users",async (req,res)=>{
    let result = await users.getAllUsers();
    // console.log("result = ",result);
    res.status(200).json(result);


})

router.post("/users",async (req,res)=>{
    try
    {let data = _.pick(req.body, ["email", "password","name","surname"]);
    // console.log("data =",data);
    const { error } = validate(data);
    if (error) return res.status(400).send(error.details[0].message);

    let result = await users.register(data.email,data.password,data.name,data.surname);
    console.log("result = ",result);
    res.status(200).json(result);
    }catch(e){
    res.status(400).json({err:e.message});
    }


})

router.delete("/:id",async(req,res)=>{
    try{
        let user = await users.deleteUsers(req.params.id);
        res.status(200).json(user);
    }catch(e){
        res.status(400).json({err:e.message});
    }
    
    
    
})

router.put("/:id",async(req,res)=>{
    try{
        let data = _.pick(req.body, ["email", "password","name","surname"]);
        let user = await users.updateUsers(req.params.id,data);
        res.status(200).json(user);
    }catch(e){
        res.status(400).json({err:e.message});
    }
    
    
    
})



router.get("/",async (req,res)=>{
    res.status(200).send("User success");


})


// router.post("/register", async (req, res) => {
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);
  
//     let user = await User.findOne({ email: req.body.email });
//     if (user) return res.status(400).send("User already registered.");
  
//     user = new User(_.pick(req.body, ["email", "password"]));
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     await user.save();
  
//     const token = user.generateAuthToken();
//     // res.header("x-auth-token", token).json(_.pick(user, ["_id", "email"]));
//     res.json({ _id: token });
//   });


function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    name: Joi.string().min(5).max(255).required(),
    surname:Joi.string().min(5).max(255).required()
  });

  return schema.validate(req);
}

module.exports = router;