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
        t.class_id, t.qualification, t.specialization, t.joining_date, t.status,
        c.class_name
      FROM Users u
      JOIN Teachers t ON u.user_id = t.teacher_id
      LEFT JOIN Classes c ON t.class_id = c.class_id
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
        t.class_id, t.qualification, t.specialization, t.joining_date, t.status,
        c.class_name
      FROM Users u
      JOIN Teachers t ON u.user_id = t.teacher_id
      LEFT JOIN Classes c ON t.class_id = c.class_id
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
      "INSERT INTO Teachers (name, teacher_id, class_id, qualification, specialization, joining_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        userResult.insertId,
        class_id,
        qualification,
        specialization,
        joining_date,
        status,
      ]
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
    const {
      name,
      email,
      qualification,
      specialization,
      joining_date,
      class_id,
      status,
    } = req.body;

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
    if (qualification || specialization || joining_date || class_id || status) {
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

// Assign a single class to a teacher
export const assignClass = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { id: teacher_id } = req.params;
    const { class_id } = req.body;

    // 1. Verify the user is a School Admin
    if (req.user.role !== "School_Admin") {
      return handleError(
        res,
        403,
        "Unauthorized: Only School Admins can assign classes"
      );
    }

    // 2. Verify the teacher exists and belongs to the same school
    const [teacher] = await db.query(
      'SELECT u.user_id FROM Users u WHERE u.user_id = ? AND u.school_id = ? AND u.role = "Teacher"',
      [teacher_id, school_id]
    );

    if (!teacher) {
      return handleError(res, 404, "Teacher not found");
    }

    // 3. Verify the class exists and belongs to the same school
    const [classRecord] = await db.query(
      "SELECT class_id, teacher_id FROM Classes WHERE class_id = ? AND school_id = ?",
      [class_id, school_id]
    );

    if (!classRecord) {
      return handleError(res, 404, "Class not found");
    }

    // 4. Check if the class is already assigned to another teacher
    if (classRecord.teacher_id && classRecord.teacher_id !== teacher_id) {
      return handleError(
        res,
        400,
        "Class is already assigned to another teacher"
      );
    }

    // 5. Start a transaction to ensure atomic updates
    await db.query("START TRANSACTION");
    try {
      // Update the Classes table to assign the teacher
      await db.query("UPDATE Classes SET teacher_id = ? WHERE class_id = ?", [
        teacher_id,
        class_id,
      ]);

      // Update the Teachers table to reflect the assigned class
      await db.query("UPDATE Teachers SET class_id = ? WHERE teacher_id = ?", [
        class_id,
        teacher_id,
      ]);

      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }

    return res.status(200).json({
      status: "success",
      message: "Class assigned to teacher successfully",
      data: {
        teacher_id,
        class_id,
      },
    });
  } catch (error) {
    console.error("Error in assignClass:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return handleError(res, 400, "Invalid teacher_id or class_id");
    }
    return handleError(res, 500, "Failed to assign class to teacher");
  }
};
