const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: "error", message: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id || !decoded.role) {
      return res
        .status(403)
        .json({ status: "error", message: "Token missing required user info." });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
