// admin/middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

module.exports = function (req, res, next) {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};