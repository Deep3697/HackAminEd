// roleCheck middleware - Prevents users from accessing Admin screens
module.exports = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (verifyToken should have already set this)
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};
