const router = require("../routes/staticRouter");
const cookieParser = require("cookie-parser");

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login"); // Redirect to login if no token is found
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.redirect("/login"); // Redirect to login if token is invalid
  }
}


module.exports = authenticateToken;