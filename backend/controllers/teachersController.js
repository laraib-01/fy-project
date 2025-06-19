import bcrypt from "bcryptjs";
import db from "../config/db.js";

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  console.error(message);
  return res.status(status).json({
    status: "error",
    message,
  });
};

// Get all teachers in a school (for school admin)
export const getAllTeachers = async (req, res) => {
  try {
    const { school_id } = req.user;

    const teachers = await db.query(
      `
      SELECT 
        u.user_id, u.name, u.email, u.role,
        t.class_id, t.qualification, t.specialization, t.joining_date, t.status
      FROM Users u
      JOIN Teachers t ON u.user_id = t.teacher_id
      WHERE u.school_id = ? AND u.role = 'Teacher'
      ORDER BY u.name
    `,
      [school_id]
    );

    return res.status(200).json({
      status: "success",
      data: {
        teachers: teachers[0],
      },
    });
  } catch (error) {
    console.error("Error in getAllTeachers:", error);
    return handleError(res, 500, "Failed to fetch teachers");
  }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { id } = req.params;

    const teacher = await db.query(
      `
      SELECT 
        u.user_id, u.name, u.email, u.role,
        t.class_id, t.qualification, t.specialization, t.joining_date, t.status
      FROM Users u
      JOIN Teachers t ON u.user_id = t.teacher_id
      WHERE u.user_id = ? AND u.school_id = ? AND u.role = 'Teacher'
    `,
      [id, school_id]
    );

    if (teacher.length === 0) {
      return handleError(res, 404, "Teacher not found");
    }

    return res.status(200).json({
      status: "success",
      data: {
        teacher: teacher[0],
      },
    });
  } catch (error) {
    console.error("Error in getTeacherById:", error);
    return handleError(res, 500, "Failed to fetch teacher");
  }
};

// Create a new teacher (School Admin only)
export const createTeacher = async (req, res) => {
  try {
    const { school_id } = req.user;
    const {
      name,
      email,
      password, // In production, this should be hashed
      qualification,
      specialization,
      joining_date,
      class_id,
      status = "Active",
    } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Create user
    const [userResult] = await db.query(
      "INSERT INTO Users (school_id, role, name, email, password) VALUES (?, ?, ?, ?, ?)",
      [school_id, "Teacher", name, email, hashedPassword] // In production, hash the password
    );

    // 2. Create teacher record
    await db.query(
      "INSERT INTO Teachers (teacher_id, class_id, qualification, specialization, joining_date, status) VALUES (?, ?, ?, ?, ?, ?)",
      [userResult.insertId, class_id, qualification, specialization, joining_date, status]
    );

    return res.status(201).json({
      status: "success",
      message: "Teacher created successfully",
      data: {
        teacher_id: userResult.insertId,
      },
    });
  } catch (error) {
    console.error("Error in createTeacher:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return handleError(res, 400, "Email already exists");
    }

    return handleError(res, 500, "Failed to create teacher");
  }
};

// Update teacher information
export const updateTeacher = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { id } = req.params;
    const { name, email, qualification, specialization, joining_date, status } =
      req.body;

    // 1. Verify the teacher exists and belongs to the same school
    const [teacher] = await db.query(
      'SELECT u.user_id FROM Users u WHERE u.user_id = ? AND u.school_id = ? AND u.role = "Teacher"',
      [id, school_id]
    );

    if (!teacher) {
      await db.query("ROLLBACK");
      return handleError(res, 404, "Teacher not found");
    }

    // 2. Update user information
    if (name || email) {
      await db.query(
        "UPDATE Users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE user_id = ?",
        [name, email, id]
      );
    }

    // 3. Update teacher information
    if (qualification || specialization || joining_date || status) {
      await db.query(
        `UPDATE Teachers 
         SET 
           qualification = COALESCE(?, qualification),
           specialization = COALESCE(?, specialization),
           joining_date = COALESCE(?, joining_date),
           class_id = COALESCE(?, class_id),
           status = COALESCE(?, status)
         WHERE teacher_id = ?`,
        [qualification, specialization, joining_date, class_id, status, id]
      );
    }

    return res.status(200).json({
      status: "success",
      message: "Teacher updated successfully",
    });
  } catch (error) {
    console.error("Error in updateTeacher:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return handleError(res, 400, "Email already exists");
    }

    return handleError(res, 500, "Failed to update teacher");
  }
};

// Delete a teacher (soft delete by setting status to Inactive)
export const deleteTeacher = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { id } = req.params;

    // 1. Verify the teacher exists and belongs to the same school
    const [teacher] = await db.query(
      'SELECT u.user_id FROM Users u WHERE u.user_id = ? AND u.school_id = ? AND u.role = "Teacher"',
      [id, school_id]
    );

    if (!teacher) {
      await db.query("ROLLBACK");
      return handleError(res, 404, "Teacher not found");
    }

    // 2. Check if teacher is assigned to any classes
    const [classes] = await db.query(
      "SELECT class_id FROM Classes WHERE teacher_id = ?",
      [id]
    );

    if (classes.length > 0) {
      await db.query("ROLLBACK");
      return handleError(res, 400, "Cannot delete teacher assigned to classes");
    }

    // 3. Soft delete by updating status to Inactive
    await db.query(
      'UPDATE Teachers SET status = "Inactive" WHERE teacher_id = ?',
      [id]
    );

    // 4. Optionally, you might want to deactivate the user account as well
    await db.query('UPDATE Users SET status = "Inactive" WHERE user_id = ?', [
      id,
    ]);

    return res.status(200).json({
      status: "success",
      message: "Teacher deactivated successfully",
    });
  } catch (error) {
    console.error("Error in deleteTeacher:", error);
    return handleError(res, 500, "Failed to deactivate teacher");
  }
};

// Get all classes taught by a teacher
export const getTeacherClasses = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { id } = req.params;

    // Verify the teacher exists and belongs to the same school
    const [teacher] = await db.query(
      'SELECT u.user_id FROM Users u WHERE u.user_id = ? AND u.school_id = ? AND u.role = "Teacher"',
      [id, school_id]
    );

    if (!teacher) {
      return handleError(res, 404, "Teacher not found");
    }

    // Get all classes taught by this teacher
    const classes = await db.query(
      `SELECT 
         c.class_id, c.class_name, 
         COUNT(s.student_id) as student_count
       FROM Classes c
       LEFT JOIN Students s ON c.class_id = s.class_id
       WHERE c.teacher_id = ? AND c.school_id = ?
       GROUP BY c.class_id, c.class_name`,
      [id, school_id]
    );

    return res.status(200).json({
      status: "success",
      data: {
        classes,
      },
    });
  } catch (error) {
    console.error("Error in getTeacherClasses:", error);
    return handleError(res, 500, "Failed to fetch teacher classes");
  }
};
