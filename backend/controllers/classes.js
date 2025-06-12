const db = require("../config/db");

// Create Class
const createClass = async (req, res) => {
  const { school_id, class_name } = req.body;
  const teacher_id = req.user.id;

  if (!school_id || !class_name) {
    return res
      .status(400)
      .json({ message: "school_id and class_name are required" });
  }

  try {
    db.query(
      "INSERT INTO classes (school_id, teacher_id, class_name) VALUES (?, ?, ?)",
      [school_id, teacher_id, class_name],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to create class" });
        }
        res
          .status(201)
          .json({
            message: "Class created successfully",
            class_id: result.insertId,
          });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Classes for the Logged-in Teacher
const getTeacherClasses = async (req, res) => {
  const teacher_id = req.user.id;

  try {
    db.query(
      "SELECT * FROM classes WHERE teacher_id = ?",
      [teacher_id],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Failed to fetch classes" });
        }

        return res.status(200).json({
          status: "success",
          classes: results,
        });
      }
    );
  } catch (error) {
    console.error("Internal error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



// Update Class (Name or Assign Teacher)
const updateClass = async (req, res) => {
  const { class_id } = req.params;
  const { class_name } = req.body;
  const teacher_id = req.user.id;

  if (!class_name) {
    return res.status(400).json({ message: "class_name is required" });
  }

  try {
    db.query(
      "UPDATE classes SET class_name = ? WHERE id = ? AND teacher_id = ?",
      [class_name, class_id, teacher_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to update class" });
        }
        if (result.affectedRows === 0) {
          return res
            .status(403)
            .json({ message: "Class not found or you don't have permission" });
        }
        res.status(200).json({ message: "Class updated successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Class
const deleteClass = async (req, res) => {
  const { class_id } = req.params;
  const teacher_id = req.user.id;

  try {
    db.query(
      "DELETE FROM classes WHERE id = ? AND teacher_id = ?",
      [class_id, teacher_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to delete class" });
        }
        if (result.affectedRows === 0) {
          return res
            .status(403)
            .json({ message: "Class not found or unauthorized" });
        }
        res.status(200).json({ message: "Class deleted successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  getTeacherClasses,
  updateClass,
  deleteClass,
};
