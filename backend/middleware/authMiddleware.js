import jwt from "jsonwebtoken";
import db from "../config/db.js";

const authMiddleware = async (req, res, next) => {
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
      return res.status(403).json({
        status: "error",
        message: "Token missing required user info.",
      });
    }

    // Base user object
    const user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Add school_id for non-admin users
    if (decoded.role !== 'EduConnect_Admin') {
      user.school_id = decoded.school_id;
    }

    // Add subscription status for School_Admin
    if (decoded.role === 'School_Admin' && decoded.school_id) {
      try {
        const [subscriptions] = await db.query(
          `SELECT status, end_date FROM Subscriptions 
           WHERE school_id = ? 
           AND status = 'Active' 
           AND end_date >= CURDATE() 
           LIMIT 1`,
          [decoded.school_id]
        );
        user.hasActiveSubscription = subscriptions.length > 0;
      } catch (error) {
        console.error('Error checking subscription status:', error);
        user.hasActiveSubscription = false;
      }
    }

    req.user = user;
    return next();
  } catch (error) {
    res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

export default authMiddleware;
