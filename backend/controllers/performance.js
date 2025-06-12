// performance.js
const db = require("../config/db");

// Create Performance Record (Teacher only)
const createPerformance = async (req, res) => {
  if (req.user.role !== "Teacher") {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }
  const { student_id, subject, grade, remarks } = req.body;
  const teacher_id = req.user.user_id;
  if (!student_id || !subject || !grade) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO Performance (student_id, teacher_id, subject, grade, remarks) VALUES (?, ?, ?, ?, ?)",
      [student_id, teacher_id, subject, grade, remarks]
    );
    res
      .status(201)
      .json({ status: "success", message: "Performance record created" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Performance Records (Teacher or Parent)
const getPerformance = async (req, res) => {
  const { student_id } = req.params;
  const user_id = req.user.user_id;
  const role = req.user.role;

  let query = "SELECT * FROM Performance WHERE student_id = ?";
  let values = [student_id];

  if (role === "Parent") {
    query +=
      " AND student_id IN (SELECT student_id FROM Parent_Student_Links WHERE parent_user_id = ?)";
    values.push(user_id);
  } else if (role === "Teacher") {
    query += " AND teacher_id = ?";
    values.push(user_id);
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

module.exports = { createPerformance, getPerformance };
