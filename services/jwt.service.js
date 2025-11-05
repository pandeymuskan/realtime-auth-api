const jwt=require("jsonwebtoken");

const JWT_SECRET=process.env.JWT_SECRET;
const JWT_EXPIRE="3h";
function signjwt(payload){
    return jwt.sign(payload,JWT_SECRET,{expiresIn:JWT_EXPIRE})
}
function verifyJwt(token){
    try{
        return jwt.verify(token,JWT_SECRET);
    }
    catch(error)
    {
        return null;
    }
}

module.exports={signjwt,verifyJwt};