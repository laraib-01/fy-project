const db = require("../config/db");

// Create Event Notification (School_Admin only)
const createEventNotification = async (req, res) => {
  if (req.user.role !== "School_Admin") {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }
  const { event_id, recipient_role, message, notification_date } = req.body;
  if (!event_id || !recipient_role || !message || !notification_date) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO Event_Notifications (event_id, recipient_role, message, notification_date) VALUES (?, ?, ?, ?)",
      [event_id, recipient_role, message, notification_date]
    );
    res.status(201).json({ status: "success", message: "Notification created" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Event Notifications (Teacher, Parent, Student)
const getEventNotifications = async (req, res) => {
  const role = req.user.role;
  if (!["Teacher", "Parent", "Student"].includes(role)) {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }
  try {
    const [results] = await db.query(
      "SELECT * FROM Event_Notifications WHERE recipient_role = ?",
      [role]
    );
    res.json({ status: "success", data: results });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { createEventNotification, getEventNotifications };