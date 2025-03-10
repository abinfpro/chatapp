const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  name: {type:String,trim:false},
  users:[{type: mongoose.Schema.ObjectId,ref: "User"}],
  isGroupChat: {type: Boolean},
  group_admin: {type: mongoose.Schema.ObjectId,ref: "User"},
  latest_message: {type: mongoose.Schema.ObjectId,ref: "Message"},
},{timestamps:true})

module.exports = mongoose.model("Chat",chatSchema)
  