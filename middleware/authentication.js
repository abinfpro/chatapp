const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

async function authentication(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.redirect("/login");
  }
  try {
    const verification = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verification.id);
    if (!verification) res.redirect("/login");
    req.user = user;
    next();
  } catch (error) {
    return res.redirect("/login");
  }
}

module.exports = { authentication };
