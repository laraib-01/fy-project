const db = require("../config/db");

// Helper to check if class belongs to the teacher
const verifyClassOwnership = (class_id, teacher_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM classes WHERE id = ? AND teacher_id = ?",
      [class_id, teacher_id],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows.length > 0);
      }
    );
  });
};

// Create Attendance (Teacher only)
const createAttendance = async (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to create attendance",
    });

  const { student_id, attendance_date, status, class_id } = req.body;
  const teacher_id = req.user.id;

  if (!student_id || !attendance_date || !status || !class_id) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  const ownsClass = await verifyClassOwnership(class_id, teacher_id);

  if (!ownsClass) {
    return res.status(403).json({
      status: "error",
      message: "You do not have permission to manage this class",
    });
  }

  db.query(
    "SELECT * FROM attendance WHERE student_id = ? AND attendance_date = ? AND class_id = ? AND is_deleted = false",
    [student_id, attendance_date, class_id],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "error", message: "Database error" });
      }
      if (results.length > 0) {
        return res.status(409).json({
          status: "error",
          message:
            "Attendance already exists for this student on this date in this class",
        });
      }

      // Insert attendance
      db.query(
        "INSERT INTO attendance (student_id, attendance_date, status, teacher_id, class_id, is_deleted) VALUES (?, ?, ?, ?, ?, false)",
        [student_id, attendance_date, status, teacher_id, class_id],
        (err2, result) => {
          if (err2) {
            return res.status(500).json({
              status: "error",
              message: "Failed to save attendance",
            });
          }
          res.status(201).json({
            status: "success",
            message: "Attendance saved successfully",
          });
        }
      );
    }
  );
};

// Get All Attendance Records for the logged-in teacher
const getAllAttendance = async (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to get attendance records",
    });

  const teacher_id = req.user.id;
  const { class_id } = req.query;

  let sql =
    "SELECT * FROM attendance WHERE teacher_id = ? AND is_deleted = false";
  const values = [teacher_id];

  if (class_id) {
    sql += " AND class_id = ?";
    values.push(class_id);
  }

  sql += " ORDER BY attendance_date DESC";

  db.query(sql, values, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to fetch attendance" });
    }
    res.status(200).json({ status: "success", data: results });
  });
};

// Update Attendance (only by the teacher who created it)
const updateAttendance = async (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to update attendance",
    });

  const { attendance_id } = req.params;
  const { status, attendance_date, class_id } = req.body;
  const teacher_id = req.user.id;

  if (!status && !attendance_date && !class_id) {
    return res.status(400).json({
      status: "error",
      message: "No fields to update",
    });
  }

  if (class_id) {
    const ownsClass = await verifyClassOwnership(class_id, teacher_id);
    if (!ownsClass) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to manage this class",
      });
    }
  }

  // Build dynamic update query
  let updates = [];
  let values = [];

  if (status) {
    updates.push("status = ?");
    values.push(status);
  }
  if (attendance_date) {
    updates.push("attendance_date = ?");
    values.push(attendance_date);
  }
  if (class_id) {
    updates.push("class_id = ?");
    values.push(class_id);
  }

  // Add teacher_id and attendance_id to WHERE clause
  values.push(attendance_id, teacher_id);

  const sql = `UPDATE attendance SET ${updates.join(
    ", "
  )} WHERE id = ? AND teacher_id = ? AND is_deleted = false`;

  db.query(sql, values, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to update attendance" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Attendance not found or you do not have permission",
      });
    }
    res.status(200).json({ status: "success", message: "Attendance updated" });
  });
};

// Soft Delete Attendance (only by teacher who created it)
const deleteAttendance = async (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to delete attendance",
    });

  const { attendance_id } = req.params;
  const teacher_id = req.user.id;

  // First get the class_id from attendance
  db.query(
    "SELECT class_id FROM attendance WHERE id = ? AND is_deleted = false",
    [attendance_id],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "DB error" });
      }
      if (result.length === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "Attendance not found" });
      }

      const class_id = result[0].class_id;

      // Check if teacher owns this class
      const ownsClass = await verifyClassOwnership(class_id, teacher_id);
      if (!ownsClass) {
        return res
          .status(403)
          .json({
            status: "error",
            message: "You do not have permission to delete this record",
          });
      }

      // Soft delete
      db.query(
        "UPDATE attendance SET is_deleted = true WHERE id = ?",
        [attendance_id],
        (err2, result) => {
          if (err2) {
            console.error(err2);
            return res
              .status(500)
              .json({
                status: "error",
                message: "Failed to delete attendance",
              });
          }
          res.status(200).json({
            status: "success",
            message: "Attendance deleted successfully",
          });
        }
      );
    }
  );
};

module.exports = {
  createAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
};
