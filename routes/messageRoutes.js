const express = require("express")
const router = express.Router();
const {createMessage} = require ("../controller/messageController")

router.post("/createMessage",createMessage)


module.exports = router;   