const mongoose = require("mongoose");

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



const del=mongoose.model("signusers",signschema); //model for sign 


module.export=del;
