const db = require("../config/db");

// Create a subscription (Admin only)
const createSubscription = (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });
  const { school_id, plan_type, start_date, end_date, status } = req.body;
  db.query(
    "INSERT INTO subscriptions (school_id, plan_type, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)",
    [school_id, plan_type, start_date, end_date, status],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Failed to create subscription" });
      res.status(201).json({ message: "Subscription created" });
    }
  );
};

// Get subscriptions
const getSubscriptions = (req, res) => {
  db.query(
    "SELECT * FROM subscriptions WHERE school_id = ?",
    [req.user.id],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Failed to fetch subscriptions" });
      res.json(results);
    }
  );
};

module.exports = { createSubscription, getSubscriptions };
