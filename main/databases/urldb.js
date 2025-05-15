const mongoose = require("mongoose");

const urlSchema=new mongoose.Schema({       //schema for url
    shortd:{
        type:String,
        required:true,
    },
    redirectlink:{
        type:String,
        required:true
    },
    visitHistory:[{timeStamp:{type:Number}}]

});

const mod=mongoose.model("urlbase",urlSchema); //model for url

module.exports=mod;