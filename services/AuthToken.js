const jwt = require("jsonwebtoken");
// const secretKey=process.env.AUTH_SECRET_KEY;

const generateToken=(user,secretKey)=>{
    const payload={
        _id:user._id,
    }
    return jwt.sign(payload,secretKey);
}

const verifyToken=(token,secretKey)=>{
    return jwt.verify(token,secretKey);
}

module.exports={
    generateToken,
    verifyToken,
}

