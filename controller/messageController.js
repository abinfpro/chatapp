const express = require("express");
const app = express();
const Message = require("../model/messageSchema");
const Chat = require("../model/chatSchema");
const mongoose = require("mongoose");

const createMessage = async (req, res) => {
  try {
    const { message, userId, recieverId } = req.body;
    const chat = await Chat.findOne({ users: { $all: [userId, recieverId] } });
    await Message.create({
      sender: userId,
      content: message,
      chat: chat._id
    });

  } catch (error) {

        return res.status(400).render("error",{errorMessage:"Server Error"})

  }
};

module.exports = {
  createMessage,
};
