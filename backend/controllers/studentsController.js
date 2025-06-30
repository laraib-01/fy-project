import db from "../config/db.js";
import bcrypt from "bcryptjs";

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  console.error(message);
  return res.status(status).json({
    status: "error",
    message,
  });
};

export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const user = req.user;

    // Validate class ID
    if (!classId) {
      return handleError(res, 400, "Class ID is required");
    }

    // Build base query with joins to Parents and Users tables
    let query = `
      SELECT 
        s.student_id, 
        s.roll_number,
        s.first_name, 
        s.last_name, 
        s.date_of_birth, 
        s.gender, 
        s.address, 
        s.phone_number, 
        s.enrollment_date, 
        s.parent_id,
        p.first_name as parent_first_name,
        p.last_name as parent_last_name,
        p.email as parent_email,
        p.phone_number as parent_phone,
        p.gender as parent_gender
      FROM Students s
      LEFT JOIN Parents p ON s.parent_id = p.parent_id
      WHERE s.class_id = ?
    `;

    // If user is a teacher, first verify they are assigned to this class
    if (user.role === "Teacher") {
      // First, check if this teacher is assigned to the requested class
      const [teacherClass] = await db.query(
        "SELECT class_id FROM Classes WHERE teacher_id = ? AND class_id = ?",
        [user.id, classId]
      );

      if (!teacherClass.length) {
        return handleError(res, 403, "You are not assigned to this class");
      }

      // If they are assigned, get all students in this class
      const [students] = await db.query(query, [classId]);
      return res.json({ status: "success", students });
    }

    // If user is School Admin, ensure they belong to the same school
    if (user.role === "School_Admin") {
      query += ` AND s.class_id IN (SELECT class_id FROM Classes WHERE school_id = ?)`;
      const [students] = await db.query(query, [classId, user.school_id]);
      return res.json({ status: "success", students });
    }

    // If user is a parent, only show their own children
    if (user.role === "Parent") {
      // First get the parent_id for this user
      const [parent] = await db.query(
        "SELECT parent_id FROM Parents WHERE user_id = ?",
        [user.id]
      );

      if (!parent.length) {
        return res.json({ status: "success", students: [] });
      }

      query += " AND s.parent_id = ?";
      const [students] = await db.query(query, [classId, parent[0].parent_id]);
      return res.json({ status: "success", students });
    }

    // If user doesn't have permission
    return handleError(res, 403, "Not authorized to view these students");
  } catch (error) {
    console.error("Error getting students by class:", error);
    return handleError(res, 500, "Failed to fetch students");
  }
};

export const addStudent = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Check if user is School Admin
    if (req.user.role !== "School_Admin") {
      await connection.rollback();
      return handleError(res, 403, "Only School Admin can add students");
    }

    const {
      class_id,
      roll_number,
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      phone_number,
      enrollment_date,
      parent, // Parent data for creating new parent
      parent_id, // Optional: existing parent ID
    } = req.body;

    // Validate required fields
    if (
      !class_id ||
      !roll_number ||
      !first_name ||
      !last_name ||
      !date_of_birth ||
      !enrollment_date
    ) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "Class ID, first name, last name, date of birth, and enrollment date are required"
      );
    }

    // Verify class exists in the same school
    const [classes] = await connection.query(
      "SELECT * FROM Classes WHERE class_id = ? AND school_id = ?",
      [class_id, req.user.school_id]
    );

    if (classes.length === 0) {
      await connection.rollback();
      return handleError(res, 404, "Class not found in your school");
    }

    // Handle parent creation or verification
    let parentId = null;

    // If parent data is provided, create a new parent
    if (parent) {
      // Validate parent data
      if (
        !parent.first_name ||
        !parent.last_name ||
        !parent.email ||
        !parent.phone_number ||
        !parent.gender
      ) {
        await connection.rollback();
        return handleError(
          res,
          400,
          "Parent first name, last name, email, phone number, and gender are required"
        );
      }

      // Check if email already exists in Users table
      const [existingUser] = await connection.query(
        "SELECT user_id FROM Users WHERE email = ? AND school_id = ?",
        [parent.email, req.user.school_id]
      );

      if (existingUser.length > 0) {
        await connection.rollback();
        return handleError(res, 400, "A user with this email already exists");
      }

      // Create new user account for parent
      const defaultPassword = parent.password || "parent123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Start transaction for user creation
      const [userResult] = await connection.query(
        `INSERT INTO Users 
        (school_id, name, email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'Parent', NOW(), NOW())`,
        [
          req.user.school_id,
          `${parent.first_name} ${parent.last_name}`,
          parent.email,
          hashedPassword,
        ]
      );

      // Create parent record in Parents table
      const [parentResult] = await connection.query(
        `INSERT INTO Parents 
        (user_id, school_id, first_name, last_name, email, phone_number, gender, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userResult.insertId,
          req.user.school_id,
          parent.first_name,
          parent.last_name,
          parent.email,
          parent.phone_number,
          parent.gender,
          parent.address || address, // Use student address if parent address not provided
        ]
      );

      parentId = parentResult.insertId;
    }
    // If parent_id is provided, verify it exists and belongs to the same school
    else if (parent_id) {
      const [existingParent] = await connection.query(
        `SELECT p.parent_id 
         FROM Parents p
         JOIN Users u ON p.user_id = u.user_id
         WHERE p.parent_id = ? AND p.school_id = ?`,
        [parent_id, req.user.school_id]
      );

      if (existingParent.length === 0) {
        await connection.rollback();
        return handleError(res, 404, "Parent not found in your school");
      }
      parentId = parent_id;
    }

    try {
      // Add student
      const [result] = await connection.query(
        `INSERT INTO Students 
        (class_id, roll_number, first_name, last_name, date_of_birth, gender, address, phone_number, parent_id, enrollment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          class_id,
          roll_number,
          first_name,
          last_name,
          date_of_birth,
          gender || null,
          address || null,
          phone_number || null,
          parentId, // Can be null if no parent
          enrollment_date,
        ]
      );

      // If we have a parent, create the parent-student link
      if (parentId) {
        try {
          // First, get the user_id for this parent
          const [parentUser] = await connection.query(
            "SELECT user_id FROM Parents WHERE parent_id = ?",
            [parentId]
          );

          if (!parentUser.length) {
            throw new Error("Parent user not found");
          }

          const parentUserId = parentUser[0].user_id;

          await connection.query(
            `INSERT INTO Parent_Student_Links (parent_user_id, parent_id, student_id) 
             VALUES (?, ?, ?)`,
            [parentUserId, parentId, result.insertId]
          );
        } catch (linkError) {
          console.error("Error creating parent-student link:", linkError);
          await connection.rollback();
          return handleError(
            res,
            500,
            "Failed to create parent-student relationship"
          );
        }
      }

      // Get the newly created student with parent info
      const [newStudent] = await connection.query(
        `SELECT s.*, 
                p.first_name as parent_first_name,
                p.last_name as parent_last_name,
                p.email as parent_email,
                p.phone_number as parent_phone
         FROM Students s
         LEFT JOIN Parents p ON s.parent_id = p.parent_id
         WHERE s.student_id = ?`,
        [result.insertId]
      );

      // Commit the transaction
      await connection.commit();

      return res.status(201).json({
        status: "success",
        message: "Student added successfully",
        student: newStudent[0],
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error adding student:", error);
      return handleError(res, 500, "Failed to add student");
    }
  } catch (error) {
    console.error("Error adding student:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return handleError(res, 400, "Student with these details already exists");
    }
    return handleError(res, 500, "Server error while adding student");
  }
};

export const updateStudent = async (req, res) => {
  try {
    // Check if user is School Admin
    if (req.user.role !== "School_Admin") {
      return res.status(403).json({
        success: false,
        message: "Only School Admin can update students",
      });
    }

    const { studentId } = req.params;
    const {
      class_id,
      roll_number,
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      phone_number,
      parent_id,
      enrollment_date,
    } = req.body;

    // Validate student ID
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Check if student exists in the same school
    const [student] = await db.query(
      `SELECT s.* FROM Students s 
             JOIN Classes c ON s.class_id = c.class_id 
             WHERE s.student_id = ? AND c.school_id = ?`,
      [studentId, req.user.school_id]
    );

    if (student.length === 0) {
      return handleError(res, 404, "Student not found in your school");
    }

    // Verify class exists in the same school if class_id is being updated
    if (class_id) {
      const [classes] = await db.query(
        "SELECT * FROM Classes WHERE class_id = ? AND school_id = ?",
        [class_id, req.user.school_id]
      );
      if (classes.length === 0) {
        return handleError(res, 404, "Class not found in your school");
      }
    }

    // Verify parent exists if provided
    if (parent_id) {
      const [parent] = await db.query(
        `SELECT p.parent_id, p.user_id 
         FROM Parents p
         WHERE p.parent_id = ? AND p.school_id = ?`,
        [parent_id, req.user.school_id]
      );
      if (parent.length === 0) {
        return handleError(res, 404, "Parent not found in your school");
      }
    }

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (class_id !== undefined) {
      updates.push("class_id = ?");
      params.push(class_id);
    }
    if (roll_number !== undefined) {
      updates.push("roll_number = ?");
      params.push(roll_number);
    }
    if (first_name) {
      updates.push("first_name = ?");
      params.push(first_name);
    }
    if (last_name) {
      updates.push("last_name = ?");
      params.push(last_name);
    }
    if (date_of_birth) {
      updates.push("date_of_birth = ?");
      params.push(date_of_birth);
    }
    if (gender !== undefined) {
      updates.push("gender = ?");
      params.push(gender);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      params.push(address);
    }
    if (phone_number !== undefined) {
      updates.push("phone_number = ?");
      params.push(phone_number);
    }
    if (parent_id !== undefined) {
      updates.push("parent_id = ?");
      params.push(parent_id);
    }

    // If no fields to update
    if (updates.length === 0) {
      return handleError(res, 400, "No fields to update");
    }

    // Add student ID to params for WHERE clause
    params.push(studentId);

    // Execute update query
    await db.query(
      `UPDATE Students SET ${updates.join(", ")} WHERE student_id = ?`,
      params
    );

    // Update parent-student link if parent_id was provided
    if (parent_id !== undefined) {
      try {
        // Remove existing links
        await db.query(
          "DELETE FROM Parent_Student_Links WHERE student_id = ?",
          [studentId]
        );

        // Add new link if parent_id is not null
        if (parent_id) {
          const [parent] = await db.query(
            "SELECT user_id FROM Parents WHERE parent_id = ?",
            [parent_id]
          );
          if (!parent.length) {
            return handleError(res, 404, "Parent user not found");
          }
          await db.query(
            "INSERT INTO Parent_Student_Links (parent_user_id, parent_id, student_id) VALUES (?, ?, ?)",
            [parent[0].user_id, parent_id, studentId]
          );
        }
      } catch (linkError) {
        console.error("Error updating parent-student link:", linkError);
        // Continue even if link update fails
      }
    }

    // Get the updated student
    const [updatedStudent] = await db.query(
      `SELECT s.*, 
              p.first_name as parent_first_name,
              p.last_name as parent_last_name,
              p.email as parent_email,
              p.phone_number as parent_phone
       FROM Students s
       LEFT JOIN Parents p ON s.parent_id = p.parent_id
       WHERE s.student_id = ?`,
      [studentId]
    );

    res.json({
      status: "success",
      message: "Student updated successfully",
      data: updatedStudent[0],
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return handleError(res, 500, "Server error while updating student");
  }
};

export const deleteStudent = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { studentId } = req.params;
    const { role, school_id } = req.user;

    // Validate student ID
    if (!studentId || isNaN(studentId)) {
      return handleError(res, 400, "Valid Student ID is required");
    }

    // Check if student exists
    const [student] = await connection.query(
      `SELECT s.* FROM Students s 
       JOIN Classes c ON s.class_id = c.class_id 
       WHERE s.student_id = ?`,
      [studentId]
    );

    if (!student.length) {
      return handleError(res, 404, "Student not found");
    }
    if (role === "School_Admin") {
      const [classCheck] = await connection.query(
        `SELECT 1 FROM Classes WHERE class_id = ? AND school_id = ?`,
        [student[0].class_id, school_id]
      );
      if (!classCheck.length) {
        return handleError(res, 403, "Student not in your school");
      }
    }

    // First, delete all related records that reference the student
    // Delete from Parent_Student_Links first as it's a linking table
    await connection.query(
      `DELETE FROM Parent_Student_Links WHERE student_id = ?`,
      [studentId]
    );

    // Delete from Attendance
    await connection.query(`DELETE FROM Attendance WHERE student_id = ?`, [
      studentId,
    ]);

    // Delete from Assignment_Submissions
    await connection.query(
      `DELETE FROM Assignment_Submissions WHERE student_id = ?`,
      [studentId]
    );

    // Delete from Performance
    await connection.query(`DELETE FROM Performance WHERE student_id = ?`, [
      studentId,
    ]);

    // Now it's safe to delete the student
    await connection.query(`DELETE FROM Students WHERE student_id = ?`, [
      studentId,
    ]);

    await connection.commit();
    return res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting student:", error);
    return handleError(res, 500, "Server error while deleting student");
  } finally {
    connection.release();
  }
};

export const getAttendanceByDate = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const user = req.user;

    // Validate inputs
    if (!classId || !date) {
      return handleError(res, 400, "Class ID and date are required");
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return handleError(res, 400, "Invalid date format. Use YYYY-MM-DD");
    }

    // Verify teacher is assigned to the class
    if (user.role === "Teacher") {
      const [teacherClass] = await db.query(
        "SELECT class_id FROM Classes WHERE teacher_id = ? AND class_id = ?",
        [user.id, classId]
      );
      if (!teacherClass.length) {
        return handleError(res, 403, "You are not assigned to this class");
      }
    } else {
      return handleError(res, 403, "Only teachers can view attendance");
    }

    // Fetch all students in the class with their attendance status (if any)
    const [students] = await db.query(
      `SELECT 
         s.student_id AS studentId, 
         s.first_name,
         s.last_name,
         s.roll_number,
         a.status,
         a.attendance_date AS date
       FROM Students s
       LEFT JOIN Attendance a ON s.student_id = a.student_id AND a.attendance_date = ?
       WHERE s.class_id = ?`,
      [date, classId]
    );

    return res.json({
      status: "success",
      attendance: students.map((record) => ({
        studentId: record.studentId,
        firstName: record.first_name,
        lastName: record.last_name,
        rollNumber: record.roll_number,
        status: record.status || "Not Marked",
        date: record.date || date,
      })),
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return handleError(res, 500, "Failed to fetch attendance records");
  }
};

export const getAttendanceByDateRange = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    const user = req.user;

    if (!classId || !startDate || !endDate) {
      return handleError(
        res,
        400,
        "Class ID, start date, and end date are required"
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      return handleError(res, 400, "Invalid date format. Use YYYY-MM-DD");
    }

    if (user.role === "Teacher") {
      const [teacherClass] = await db.query(
        "SELECT class_id FROM Classes WHERE teacher_id = ? AND class_id = ?",
        [user.id, classId]
      );
      if (!teacherClass.length) {
        return handleError(res, 403, "You are not assigned to this class");
      }
    } else {
      return handleError(res, 403, "Only teachers can view attendance");
    }

    const [attendance] = await db.query(
      `SELECT 
         s.student_id AS studentId, 
         s.first_name,
         s.last_name,
         s.roll_number,
         a.status,
         a.attendance_date AS date
       FROM Students s
       LEFT JOIN Attendance a ON s.student_id = a.student_id 
         AND a.attendance_date BETWEEN ? AND ?
       WHERE s.class_id = ?
       ORDER BY a.attendance_date, s.student_id`,
      [startDate, endDate, classId]
    );

    return res.json({
      status: "success",
      attendance: attendance.map((record) => ({
        studentId: record.studentId,
        firstName: record.first_name,
        lastName: record.last_name,
        rollNumber: record.roll_number,
        status: record.status || "Not Marked",
        date: record.date || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching attendance range:", error);
    return handleError(res, 500, "Failed to fetch attendance records");
  }
};

export const submitAttendance = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { classId } = req.params;
    const { date, attendanceData } = req.body;
    const user = req.user;

    // Validate inputs
    if (!classId || !date || !Array.isArray(attendanceData)) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "Class ID, date, and attendance data are required"
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await connection.rollback();
      return handleError(res, 400, "Invalid date format. Use YYYY-MM-DD");
    }

    // Prevent future dates
    const today = new Date().toISOString().split("T")[0];
    if (date > today) {
      await connection.rollback();
      return handleError(res, 400, "Cannot mark attendance for future dates");
    }

    // Verify teacher is assigned to the class
    if (user.role === "Teacher") {
      const [teacherClass] = await connection.query(
        "SELECT class_id FROM Classes WHERE teacher_id = ? AND class_id = ?",
        [user.id, classId]
      );
      if (!teacherClass.length) {
        await connection.rollback();
        return handleError(res, 403, "You are not assigned to this class");
      }
    } else {
      await connection.rollback();
      return handleError(res, 403, "Only teachers can submit attendance");
    }

    // Verify all students belong to the class
    const studentIds = attendanceData.map((record) => record.studentId);
    const [validStudents] = await connection.query(
      "SELECT student_id FROM Students WHERE class_id = ? AND student_id IN (?)",
      [classId, studentIds]
    );

    if (validStudents.length !== studentIds.length) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "One or more students do not belong to this class"
      );
    }

    // Validate attendance status
    const validStatuses = ["Present", "Absent", "Late"];
    for (const record of attendanceData) {
      if (!validStatuses.includes(record.status)) {
        await connection.rollback();
        return handleError(
          res,
          400,
          `Invalid status for student ${record.studentId}`
        );
      }
    }

    // Upsert attendance records
    const attendanceInsertQuery = `
      INSERT INTO Attendance (student_id, attendance_date, status, teacher_id)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), teacher_id = VALUES(teacher_id)
      `;
    for (const record of attendanceData) {
      await connection.query(attendanceInsertQuery, [
        record.studentId,
        date,
        record.status,
        user.id,
      ]);
    }

    await connection.commit();
    return res.json({
      status: "success",
      message: "Attendance recorded successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error submitting attendance:", error);
    return handleError(res, 500, "Failed to record attendance");
  } finally {
    connection.release();
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    const user = req.user;

    if (!classId || !startDate || !endDate) {
      return handleError(
        res,
        400,
        "Class ID, start date, and end date are required"
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
    ) {
      return handleError(res, 400, "Invalid date format. Use YYYY-MM-DD");
    }

    if (user.role === "Teacher") {
      const [teacherClass] = await db.query(
        "SELECT class_id FROM Classes WHERE teacher_id = ? AND class_id = ?",
        [user.id, classId]
      );
      if (!teacherClass.length) {
        return handleError(res, 403, "You are not assigned to this class");
      }
    } else {
      return handleError(res, 403, "Only teachers can view attendance summary");
    }

    const [summary] = await db.query(
      `SELECT 
         s.student_id AS studentId,
         s.first_name,
         s.last_name,
         s.roll_number,
         COUNT(a.student_id) AS total_days,
         SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_days,
         SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_days,
         SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_days
       FROM Students s
       LEFT JOIN Attendance a ON s.student_id = a.student_id 
         AND a.attendance_date BETWEEN ? AND ?
       WHERE s.class_id = ?
       GROUP BY s.student_id, s.first_name, s.last_name, s.roll_number`,
      [startDate, endDate, classId]
    );

    return res.json({
      status: "success",
      summary: summary.map((record) => ({
        studentId: record.studentId,
        firstName: record.first_name,
        lastName: record.last_name,
        rollNumber: record.roll_number,
        totalDays: record.total_days,
        presentDays: record.present_days,
        absentDays: record.absent_days,
        lateDays: record.late_days,
        attendancePercentage: record.total_days
          ? ((record.present_days / record.total_days) * 100).toFixed(2)
          : 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    return handleError(res, 500, "Failed to fetch attendance summary");
  }
};
