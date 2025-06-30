import db from "../config/db.js";

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  console.error(message);
  return res.status(status).json({
    status: "error",
    message,
  });
};

// Create Class
export const createClass = async (req, res) => {
  try {
    const { class_name } = req.body;
    const { school_id } = req.user;

    // Input validation
    if (!class_name) {
      return handleError(res, 400, "class_name is required");
    }

    // Insert new class
    const result = await db.query(
      "INSERT INTO classes (school_id, class_name) VALUES (?, ?)",
      [school_id, class_name]
    );

    return res.status(201).json({
      status: "success",
      message: "Class created successfully",
      data: {
        class_id: result.insertId,
        class_name,
        school_id,
      },
    });
  } catch (error) {
    console.error("Error in createClass:", error);
    return handleError(res, 500, "Failed to create class");
  }
};

// Get All Classes for the Logged-in Teacher
export const getTeacherClasses = async (req, res) => {
  try {
    const { id: teacher_id } = req.user;

    // Fetch all classes for the teacher
    const classes = await db.query(
      "SELECT * FROM classes WHERE teacher_id = ?",
      [teacher_id]
    );

    return res.status(200).json({
      status: "success",
      user_id: teacher_id,
      data: {
        classes: classes[0],
      },
    });
  } catch (error) {
    console.error("Error in getTeacherClasses:", error);
    return handleError(res, 500, "Failed to fetch classes");
  }
};

// Update Class (Name or Assign Teacher)
export const updateClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { class_name } = req.body;
    const { school_id } = req.user;

    // Input validation
    if (!class_name) {
      return handleError(res, 400, "Class name is required");
    }

    // Update class name
    const result = await db.query(
      "UPDATE classes SET class_name = ? WHERE class_id = ? AND school_id = ?",
      [class_name, class_id, school_id]
    );

    if (result.affectedRows === 0) {
      return handleError(
        res,
        404,
        "Class not found or you do not have permission"
      );
    }

    return res.status(200).json({
      status: "success",
      message: "Class updated successfully",
      data: {
        class_id,
        class_name,
      },
    });
  } catch (error) {
    console.error("Error in updateClass:", error);
    return handleError(res, 500, "Failed to update class");
  }
};

// Delete Class
// Get All Classes for a School (School Admin only)
export const getSchoolClasses = async (req, res) => {
  try {
    const { school_id } = req.user;

    // Fetch all classes for the school with teacher information
    const classes = await db.query(
      `SELECT 
        c.class_id,
        c.class_name,
        u.user_id as teacher_id,
        u.name as teacher_name,
        u.email as teacher_email,
        (SELECT COUNT(*) FROM Students s WHERE s.class_id = c.class_id) as student_count
      FROM classes c
      LEFT JOIN Users u ON c.teacher_id = u.user_id
      WHERE c.school_id = ?
      ORDER BY c.class_name`,
      [school_id]
    );

    return res.status(200).json({
      status: "success",
      data: {
        classes: classes[0],
      },
    });
  } catch (error) {
    console.error("Error in getSchoolClasses:", error);
    return handleError(res, 500, "Failed to fetch school classes");
  }
};

// Delete Class
export const deleteClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { school_id } = req.user;

    // Delete the class
    const result = await db.query(
      "DELETE FROM classes WHERE class_id = ? AND school_id = ?",
      [class_id, school_id]
    );

    if (result.affectedRows === 0) {
      return handleError(
        res,
        404,
        "Class not found or you do not have permission"
      );
    }

    return res.status(200).json({
      status: "success",
      message: "Class deleted successfully",
      data: {
        class_id,
      },
    });
  } catch (error) {
    console.error("Error in deleteClass:", error);
    return handleError(res, 500, "Failed to delete class");
  }
};
