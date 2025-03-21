const jwt = require("jsonwebtoken");


const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.cookies.jwt; // Get token from cookie
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
};

const generateToken = (payload, expiresIn = "1h") => {
    return jwt.sign("dgsg", SECRET_KEY, { expiresIn });
};

module.exports = {
    auth,generateToken
};