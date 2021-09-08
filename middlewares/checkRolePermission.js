const db = require("../db")


//operation postion 1.C 2.R 3.U 4.D
function CheckAuthorizeWithTable(tablename,authorizationlevel,operation){//current role at req.user.RoleId
    return async (req,res,next)=>{
        //select tablename where RoleId at table Roles then check if  operation level in field  >= authorizationlevel need
        let permission =await db.Role.findOne({where:{
            id:req.user.RoleId
        }})
        if(!(permission[tablename][operation] >= authorizationlevel)){
            return res.status(401).json({message:'Permission mismatch'})
        }
        

        next()
    
    }

}



module.exports = CheckAuthorizeWithTable;