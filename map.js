
const jwt=require("jsonwebtoken");
const skey=process.env.PASSKEY;



function setuser(user){
    return jwt.sign({
        email:user.email,
        password:user.password,
    },skey);
}

function getuser(token){
    if(!token){
        return null;
    }
    try{
        return jwt.verify(token,skey);
    }catch(error){
        return res.statuscode(500).send("server side error");
    }
}

module.exports={setuser,getuser};