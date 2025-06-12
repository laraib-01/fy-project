// parent_student_links.js
const db = require("../config/db");

// Create Parent-Student Link (School_Admin only)
const createParentStudentLink = async (req, res) => {
  if (req.user.role !== "School_Admin") {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }
  const { parent_user_id, student_id } = req.body;
  if (!parent_user_id || !student_id) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO Parent_Student_Links (parent_user_id, student_id) VALUES (?, ?)",
      [parent_user_id, student_id]
    );
    res.status(201).json({ status: "success", message: "Link created" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Parent-Student Links (Parent or School_Admin)
const getParentStudentLinks = async (req, res) => {
  const user_id = req.user.user_id;
  const role = req.user.role;

  let query = "";
  let values = [];

  if (role === "Parent") {
    query = "SELECT * FROM Parent_Student_Links WHERE parent_user_id = ?";
    values = [user_id];
  } else if (role === "School_Admin") {
    query = "SELECT * FROM Parent_Student_Links WHERE student_id IN (SELECT student_id FROM Students WHERE class_id IN (SELECT class_id FROM Classes WHERE school_id = ?))";
    values = [req.user.school_id];
  } else {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }

  try {
    const [results] = await db.query(query, values);
    res.json({ status: "success", data: results });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { createParentStudentLink, getParentStudentLinks };