const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Access denied. No token provided." });
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { user_id, role, school_id }
    next();
  } catch (error) {
    res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

module.exports = authenticate;
