function authorizeForRoleId(Role){
    return (req,res,next)=>{
        if (req.user.RoleId != Role){
            return res.json({message:'Permission mismatch'})
        }
        next()
    
    }

}
module.exports = authorizeForRoleId;