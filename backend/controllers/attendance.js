import db from "../config/db.js";
import { promisify } from 'util';

// Promisify db.query
const query = promisify(db.query).bind(db);

// Error handler
const handleError = (res, status = 500, message = 'An error occurred') => {
  console.error(message); // It's good practice to log the user-facing error message
  return res.status(status).json({ status: 'error', message });
};

// Helper to check if class belongs to the teacher
const verifyClassOwnership = async (class_id, teacher_id) => {
  const rows = await query("SELECT * FROM classes WHERE id = ? AND teacher_id = ?", [class_id, teacher_id]);
  return rows.length > 0;
};

// Create Attendance (Teacher only)
const createAttendance = async (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to create attendance"
    });

  const { student_id, attendance_date, status, class_id } = req.body;
  const teacher_id = req.user.id;

  try {
    if (!student_id || !attendance_date || !status || !class_id) {
      return handleError(res, 400, "All fields are required");
    }

    const ownsClass = await verifyClassOwnership(class_id, teacher_id);
    if (!ownsClass) {
      return handleError(res, 403, "You do not have permission to manage this class");
    }

    const existingAttendance = await query(
      "SELECT * FROM attendance WHERE student_id = ? AND attendance_date = ? AND class_id = ? AND is_deleted = false",
      [student_id, attendance_date, class_id]
    );

    if (existingAttendance.length > 0) {
      return handleError(res, 409, "Attendance already exists for this student on this date in this class");
    }

    await query(
      "INSERT INTO attendance (student_id, attendance_date, status, teacher_id, class_id, is_deleted) VALUES (?, ?, ?, ?, ?, false)",
      [student_id, attendance_date, status, teacher_id, class_id]
    );

    return res.status(201).json({
      status: "success",
      message: "Attendance saved successfully",
    });
  } catch (error) {
    console.error("Error in createAttendance:", error);
    return handleError(res, 500, "Failed to save attendance");
  }
};

// Get All Attendance Records for the logged-in teacher
const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return handleError(res, 403, "You are not authorized to get attendance records");
    }

    const teacher_id = req.user.id;
    const { class_id } = req.query;

    let sql = "SELECT * FROM attendance WHERE teacher_id = ? AND is_deleted = false";
    const values = [teacher_id];

    if (class_id) {
      sql += " AND class_id = ?";
      values.push(class_id);
    }

    sql += " ORDER BY attendance_date DESC";

    const results = await query(sql, values);
    return res.status(200).json({ status: "success", data: results });
  } catch (error) {
    console.error("Error in getAllAttendance:", error);
    return handleError(res, 500, "Failed to fetch attendance");
  }
};

// Update Attendance (only by the teacher who created it)
const updateAttendance = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return handleError(res, 403, "You are not authorized to update attendance");
    }

    const { attendance_id } = req.params;
    const { status, attendance_date, class_id } = req.body;
    const teacher_id = req.user.id;

    if (!status && !attendance_date && !class_id) {
      return handleError(res, 400, "No fields to update");
    }

    if (class_id) {
      const ownsClass = await verifyClassOwnership(class_id, teacher_id);
      if (!ownsClass) {
        return handleError(res, 403, "You do not have permission to manage this class");
      }
    }

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

    values.push(attendance_id, teacher_id);

    const sql = `UPDATE attendance SET ${updates.join(", ")} WHERE id = ? AND teacher_id = ? AND is_deleted = false`;

    const result = await query(sql, values);

    if (result.affectedRows === 0) {
      return handleError(res, 404, "Attendance not found or you do not have permission");
    }
    return res.status(200).json({ status: "success", message: "Attendance updated" });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    return handleError(res, 500, "Failed to update attendance");
  }
};

// Soft Delete Attendance (only by teacher who created it)
const deleteAttendance = async (req, res) => {
  if (req.user.role !== "teacher")
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to delete attendance"
    });

  const { attendance_id } = req.params;
  const teacher_id = req.user.id;

  try {
    const attendanceRecords = await query(
      "SELECT class_id FROM attendance WHERE id = ? AND is_deleted = false",
      [attendance_id]
    );

    if (attendanceRecords.length === 0) {
      return handleError(res, 404, "Attendance not found or already deleted");
    }

    const class_id = attendanceRecords[0].class_id;

    const ownsClass = await verifyClassOwnership(class_id, teacher_id);
    if (!ownsClass) {
      return handleError(res, 403, "You do not have permission to delete this record");
    }

    const result = await query(
      "UPDATE attendance SET is_deleted = true WHERE id = ?",
      [attendance_id]
    );

    if (result.affectedRows === 0) {
      // This case implies the record was not found for update, possibly deleted/modified concurrently
      return handleError(res, 404, "Attendance record not found or failed to update.");
    }

    return res.status(200).json({
      status: "success",
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAttendance:", error);
    return handleError(res, 500, "Failed to delete attendance");
  }
};

export {
  createAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
};
