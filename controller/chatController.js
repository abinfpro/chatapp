const express = require("express");
const app = express();
const Chat = require("../model/chatSchema");
const Message = require("../model/messageSchema");

const mongoose = require("mongoose");

const createChat = async (req,res) => {
  try {
    const {userId,recieverId} = req.body;    
   const chat =  await Chat.findOne({users:{$all:[userId,recieverId]}});   
   if(!chat){
    const chat = await Chat.create({
        name:"private",
        users:[userId,recieverId],
        isGroupChat:false
    })
  }else{
    const messages = await Message.find({chat: chat._id})
    return res.status(200).json(messages)
  }
  } catch (error) {

    return res.status(400).render("error",{errorMessage:"Server Error"})

  }
};

module.exports = {
  createChat,
};
