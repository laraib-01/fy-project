const db = require("../config/db");

// Create an event (Admin only)
const createEvent = (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });
  const { title, date, time, location } = req.body;
  db.query(
    "INSERT INTO events (school_id, title, date, time, location) VALUES (?, ?, ?, ?, ?)",
    [req.user.school_id, title, date, time, location],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ status: "error", message: "Failed to create event" });
      res.status(201).json({ status: "success", message: "Event created" });
    }
  );
};

// Get all events
const getAllEvents = (req, res) => {
  db.query("SELECT * FROM events", (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ status: "error", message: "Failed to fetch events" });
    res.json({ status: "success", events: results });
  });
};

module.exports = { createEvent, getAllEvents };
