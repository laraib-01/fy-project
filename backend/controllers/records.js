const db = require("../config/db");

// Create a student record (Teacher only)
const createRecord = (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({ error: "Access denied" });
  const { student_id, attendance, performance_text, task_description } =
    req.body;
  db.query(
    "INSERT INTO student_records (student_id, teacher_id, attendance, performance_text, task_description) VALUES (?, ?, ?, ?, ?)",
    [student_id, req.user.id, attendance, performance_text, task_description],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Failed to create record" });
      res.status(201).json({ message: "Record created" });
    }
  );
};

// Get student records (Parent or Teacher)
const getRecords = (req, res) => {
  db.query(
    "SELECT * FROM student_records WHERE student_id = ?",
    [req.params.student_id],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: "Failed to fetch records" });
      res.json(results);
    }
  );
};

module.exports = { createRecord, getRecords };
