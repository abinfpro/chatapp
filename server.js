const express = require("express");
const app = express();
const Db = require("./dbConnection/connection");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");

require("dotenv").config();
const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`);
});

const io = socketIo(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("successfully connected");
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
  });

  socket.on("chatMessage", ({ senderId, recieverId, message, userName }) => {
    io.to(recieverId).emit("message", ` ${message}`, "left");
    io.to(senderId).emit("message", `${message}`, "right");
  });
});

app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRoutes);
app.use("/message", messageRoutes);
app.use("/chat", chatRoutes);

Db();
