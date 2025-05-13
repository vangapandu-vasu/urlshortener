const mongoose = require("mongoose");

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

const mod=mongoose.model("urlbase",urlSchema); //model for url

module.exports=mod;