const mongoose = require("mongoose")

const messageSchema = mongoose.Schema({
    sender: {type: mongoose.Schema.ObjectId,
        ref: "User"
    } ,
    content: {type: String,trim: true},
    chat: {type: mongoose.Schema.ObjectId,
        ref: "User"
    }
},{timestamps:true})

module.exports = mongoose.model("Message",messageSchema)