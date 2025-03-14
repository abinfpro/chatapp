const mongoose = require("mongoose")
require("dotenv").config()


const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.dbUrl)
        console.log("mongoDb connected");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = connectDb;