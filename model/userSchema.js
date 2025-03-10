const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    username:{
        type:String,
        required:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String
    },
    otpexpires: {
        type: Date
    },
    bio:{
        type:String,
        default:"user",                                
      },
    profilePicture: {
        type: String, 
        default:""
    }, 
   
});

const User = mongoose.model('User', userSchema);
module.exports = User;
