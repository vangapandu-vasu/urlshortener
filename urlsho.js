const express=require("express");
const mongoose=require("mongoose");
const server=express();
const port=9000;
const shortid=require("shortid");
const path=require("path");
const {v4:uuidv4}=require("uuid");
const {setuser,getuser}=require("./map");
// const onlyloggedone=require("./auth");
const cookieParser = require("cookie-parser");
const jwt=require("jsonwebtoken");


const urlSchema=new mongoose.Schema({       //schema for url
    shortd:{
        type:String,
    },
    redirectlink:{
        type:String,
        required:true
    },
    visitHistory:[{timestamps:{type:Number}}]
});

const signschema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    email:{                             //schema for sign up
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:Number,
        required:true,
    },
},{timestamps:true});

const mod=mongoose.model("urlbase",urlSchema); //model for url

const del=mongoose.model("signusers",signschema); //model for sign up


mongoose.connect("mongodb://127.0.0.1:27017/"); //connection

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
    const shortId=shortid(9);
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
                visitHistory:{timestamps:Date.now()},             //updataion
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
        totalvisits:result.visitHistory.length,
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
            return res.send("not verified");
        }
    }catch(error){
        console.log("there exists a error",error);
        return res.status(500).json("server side error");
    };
    
}); //he used routes stuff so all good i have to check hoow to utilize it probably yes  so baiiii itrs done

server.listen(port,(req,res)=>{
    console.log("server is running successfully");
});