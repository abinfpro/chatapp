require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// render register page
const renderRegister = (req, res) => {
  res.render("pages/register");
};

// render login page
const renderLogin = (req, res) => {
  res.render("pages/login");
};

const renderHome = async (req, res) => {
  try {
    const { id, username, profilePicture } = req.user;
    const users = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(id) },
    });
    res.render("pages/homePage", { users, username, id, profilePicture });
  } catch (error) {
    console.log(error.message);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//  Function to Send OTP via Email
const sendOtp = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `ChatApp<${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP Code is: ${otp}`,
    });

    console.log(" Email sent:", info.response);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Try again.");
  }
};

//  User Registration API
const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 1024 * 60 * 60 * 60 }
    );

    const option = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    await sendOtp(email, otp);

    res.cookie("token", token, option);
    res.render("pages/otpPage", { user: user._id });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const id = req.params.id;
    const { otp } = req.body;
    const user = await User.findById(id);
    if (otp.toString() === user.otp.toString()) {
      // Remove OTP field after successful verification
      const updatedUser = await User.findByIdAndUpdate(id, { $unset: { otp: 1, otpexpires: 1 } }, { new: true });
     
      res.render("pages/profileSetup", {
        id: user._id,
        username: user.username,
      });
    } else {
      await User.findByIdAndDelete(id);
      res.status(400).render("pages/error", { errorMessage: "Error OTP" });
    }
  } catch (error) {}
};

// PROFILE SETUP
const profileSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio } = req.body;
    if (req.file) {
      imgPath = `/uploads/${req.file.filename}`;
      await User.findByIdAndUpdate(id, {
        username,
        bio,
        profilePicture: imgPath,
      });
      res.redirect("/");
    }
  } catch (error) {
    return res
      .status(400)
      .render("pages/error", { errorMessage: "Server Error" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User Not Found" });
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch)
      return res.status(400).json({ message: "Incorrect Password" });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const option = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("token", token, option);
    res.redirect("/");
  } catch (error) {
    return res
      .status(400)
      .render("pages/error", { errorMessage: "Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("pages/error", { errorMessage: "Server Error" });
  }
};

const viewProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    res.render("pages/updateProfile", { user });
  } catch (error) {
    return res
      .status(400)
      .render("pages/error", { errorMessage: "Server Error" });
  }
};
// UPDATEPROFILE
const updateProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const { id } = req.user;
    if (!req.file) {
      await User.updateOne(
        { _id: id },
        {
          username: username,
          bio: bio,
        }
      );
    } else {
      const user = await User.findById(id);
      const filename = user.profilePicture.split("/uploads/")[1];
      console.log(filename, "file");

      const oldImagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        filename
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      const imgPath = `/uploads/${req.file.filename}`;
      await User.updateOne(
        { _id: id },
        {
          username: username,
          bio: bio,
          profilePicture: imgPath,
        }
      );
    }
    res.redirect("/");
  } catch (error) {
    return res
      .status(400)
      .render("pages/error", { errorMessage: "Server Error" });
  }
};

module.exports = {
  renderLogin,
  renderRegister,
  registerUser,
  profileSetup,
  login,
  renderHome,
  logout,
  viewProfile,
  updateProfile,
  verifyOtp,
};
