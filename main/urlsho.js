const express=require("express");
const mongoose=require("mongoose");
const server=express();
const port=process.env.PORT || 9000;
const shortid=require("shortid");
const path=require("path");
const {v4:uuidv4}=require("uuid");
const del=require("./databases/signdb.js");
const mod=require("./databases/urldb.js");
const {setuser,getuser}=require("./map.js");
// const onlyloggedone=require("./auth");
const cookieParser = require("cookie-parser");
const { error } = require("console");
require("dotenv").config();

const mongo_url = process.env.MONGO_URI;

mongoose.connect(mongo_url)
.then(()=>console.log("✅ MongoDB connected successfully"))
.catch((err)=>console.log("❌ MongoDB connection error:",err)) //connection

server.get("/",async(req,res)=>{
    console.log("on home page");
    // res.send("homeee"); //for broswer
    return res.render('home');//browser
});

server.use(express.static(path.join(__dirname, 'public'))); //middleware for css 
server.use(express.json()); //middleware for url
server.use(express.urlencoded({extended:false}));
server.use(cookieParser());


server.set("view engine","ejs");

server.set("views",path.resolve("./content"));


server.get("/signup",(req,res)=>{
    console.log("on sign up page");
    res.render('signup');
});

server.get("/login",(req,res)=>{
    console.log("on login page");
    return res.render("login");
});




server.post("/signup",async (req,res)=>{
    const body=req.body
    if(body===""){
        console.log("please fill all the details");
        return res.render("signup");
    }
    await del.create({
        firstname:body.firstname,
        email:body.email,                     //creation for signup
        password:body.password,
    });

    console.log("signed in");
    return res.render("home");
});


server.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    const details=await del.findOne({email,password});
    if(!details){
        return res.render("login");
    }
    
    const token=setuser(details);
    res.cookie("uid",token);
    return res.render("home");
});

server.post("/urlshort",async(req,res)=>{
    const body=req.body
    if(body.url===""){
        return res.status(400).json("bad request it cannot be empty");
    }
    const shortId=shortid.generate();
    await mod.create({
        shortd:shortId,                   //creationnnn for url
        redirectlink:body.url,
        visitHistory:[]
    });
    console.log("data uploaded successfully");
    return res.render('home',{
        id:shortId,
    }
    );
});

server.get("/:shortId",async(req,res)=>{
    const shortId=req.params.shortId;
    const entry=await mod.findOneAndUpdate(
        {
             shortd: shortId ,
        },
        {
            $push:{
                visitHistory:{timeStamp:Date.now()},             //updataion
            },
        },
        { new: true },
    );
    if(!entry){
        console.log("error in redirectlink");
        return res.status(404).json("not found");
    }
    else{
    console.log("its working");
    res.redirect(entry.redirectlink);
    }
});




server.get("/length/:shortId",async(req,res)=>{
    const shortId=req.params.shortId;
    const result=await mod.findOne(
        {
            shortd:shortId,
        },                  
    )
    return res.json({
        totalvisits:result.visitHistory.length,     //work on this trouble
        details:result.visitHistory,
    });
});

server.get("/authen/allusers",async(req,res)=>{
    try{
        const token=req.cookies.uid;
        const verify=getuser(token);
        if(verify){
            return res.send("authentication done");
        }
        else{
            return res.send("not verified");            //used to know the authentication is working while running this
        }
    }catch(error){
        console.log("there exists a error",error);
        return res.status(500).json("server side error");
    };
    
}); 
server.listen(port,(req,res)=>{
    console.log("server is running successfully");
});

//make it ready for depolyment add 3D models, so basically its all backend rendering watch out