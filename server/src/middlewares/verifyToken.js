// verifyToken middleware - Checks if the user's login is valid
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Extract the token (Bearer <token>)
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Attach the user info to the request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
