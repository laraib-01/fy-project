const db = require("../config/db");

// Create an assignment (Teacher only)
const createAssignment = (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to create an assignment",
    });
  const { class_id, title, description, due_date } = req.body;
  const teacher_id = req.user.id;

  if (!class_id || !title || !description || !due_date) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  db.query(
    "INSERT INTO assignments (teacher_id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)",
    [teacher_id, class_id, title, description, due_date],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to create assignment" });
      }
      res.status(201).json({
        status: "success",
        message: "Assignment created successfully",
      });
    }
  );
};

// Get all assignments
const getAllAssignments = (req, res) => {
  db.query("SELECT * FROM assignments", (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to fetch assignments" });
    }
    res.status(200).json({ status: "success", data: results });
  });
};

// Update an assignment (Teacher only)
const updateAssignment = (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({ status: "error", message: "Access denied" });

  const { assignment_id } = req.params;
  const { title, description, due_date } = req.body;

  db.query(
    `UPDATE assignments 
     SET title = ?, description = ?, due_date = ?
     WHERE assignment_id = ?`,
    [title, description, due_date, assignment_id],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to update assignment" });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "Assignment not found" });
      }
      res
        .status(200)
        .json({ status: "success", message: "Assignment updated" });
    }
  );
};

// Delete an assignment (Teacher only)
const deleteAssignment = (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({ status: "error", message: "Access denied" });

  const { assignment_id } = req.params;

  db.query(
    `DELETE FROM assignments WHERE assignment_id = ?`,
    [assignment_id],
    (err, result) => {
      if (err) {
        console.error("Delete error:", err);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to delete assignment" });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "Assignment not found" });
      }
      res
        .status(200)
        .json({ status: "success", message: "Assignment deleted" });
    }
  );
};

// Submit an assignment (Student only)
const assignmentSubmission = (req, res) => {
  if (req.user.role !== "student")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to submit an assignment",
    });

  const { assignment_id, submission_date, status } = req.body;
  const student_id = req.user.id;

  if (!assignment_id || !submission_date || !status) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  db.query(
    "SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?",
    [assignment_id, student_id],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "error", message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "You have already submitted this assignment",
        });
      }

      // Insert submission
      db.query(
        "INSERT INTO assignment_submissions (assignment_id, student_id, submission_date, status) VALUES (?, ?, ?, ?)",
        [assignment_id, student_id, submission_date, status],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              status: "error",
              message: "Failed to submit assignment",
            });
          }
          res.status(201).json({
            status: "success",
            message: "Assignment submitted successfully",
          });
        }
      );
    }
  );
};

module.exports = {
  createAssignment,
  getAllAssignments,
  updateAssignment,
  deleteAssignment,
  assignmentSubmission,
};
