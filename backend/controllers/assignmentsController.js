import db from "../config/db.js";

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  console.error(message);
  return res.status(status).json({ status: "error", message });
};

// Create an assignment (Teacher only)
export const createAssignment = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { role, id: teacher_id, school_id } = req.user;
    const { class_id, title, description, due_date, points, status } = req.body;

    // Role check (assuming schema uses 'Teacher')
    if (role !== "Teacher") {
      await connection.rollback();
      return handleError(res, 403, "Only teachers can create assignments");
    }

    // Validate inputs
    if (![class_id, title, description, due_date].every(Boolean)) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "Class ID, title, description, and due date are required"
      );
    }

    // Validate date format and ensure due_date is not in the past
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
      await connection.rollback();
      return handleError(res, 400, "Invalid due date format. Use YYYY-MM-DD");
    }
    const today = new Date().toISOString().split("T")[0];
    if (due_date < today) {
      await connection.rollback();
      return handleError(res, 400, "Due date cannot be in the past");
    }

    // Verify teacher is assigned to the class
    const [classCheck] = await connection.query(
      "SELECT class_id FROM Classes WHERE class_id = ? AND teacher_id = ? AND school_id = ?",
      [class_id, teacher_id, school_id]
    );
    if (!classCheck.length) {
      await connection.rollback();
      return handleError(res, 403, "You are not assigned to this class");
    }

    // Insert assignment
    const [result] = await connection.query(
      `INSERT INTO Assignments (teacher_id, class_id, title, description, due_date, points, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [teacher_id, class_id, title, description, due_date, points, status || "Active"]
    );

    await connection.commit();
    return res.status(201).json({
      status: "success",
      message: "Assignment created successfully",
      data: { assignmentId: result.insertId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating assignment:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return handleError(res, 400, "Invalid class ID");
    }
    return handleError(res, 500, "Failed to create assignment");
  } finally {
    connection.release();
  }
};

// Get all assignments (with filters)
export const getAllAssignments = async (req, res) => {
  try {
    const { role, id: user_id, school_id } = req.user;
    const { class_id, start_date, end_date } = req.query;

    let query = `
      SELECT a.assignment_id, a.class_id, a.teacher_id, a.title, a.description, a.due_date, a.points, a.status, a.created_at, a.updated_at,
             c.class_name
      FROM Assignments a
      JOIN Classes c ON a.class_id = c.class_id
    `;
    const params = [];

    // Restrict based on role
    if (role === "Teacher") {
      query += " WHERE a.teacher_id = ? AND c.school_id = ?";
      params.push(user_id, school_id);
    } else if (role === "School_Admin") {
      query += " WHERE c.school_id = ?";
      params.push(school_id);
    } else {
      return handleError(
        res,
        403,
        "Only teachers and school admins can view assignments"
      );
    }

    // Add optional filters
    if (class_id) {
      query += " AND a.class_id = ?";
      params.push(class_id);
    }
    if (start_date && end_date) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(start_date) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(end_date)
      ) {
        return handleError(res, 400, "Invalid date format. Use YYYY-MM-DD");
      }
      query += " AND a.due_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    const [assignments] = await db.query(query, params);
    return res.status(200).json({ status: "success", assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return handleError(res, 500, "Failed to fetch assignments");
  }
};

// Update an assignment (Teacher only)
export const updateAssignment = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { role, id: teacher_id, school_id } = req.user;
    const { assignment_id } = req.params;
    const { class_id, title, description, due_date } = req.body;

    if (role !== "Teacher") {
      await connection.rollback();
      return handleError(res, 403, "Only teachers can update assignments");
    }

    // Validate inputs
    if (![assignment_id, title, description, due_date].every(Boolean)) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "Assignment ID, title, description, and due date are required"
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
      await connection.rollback();
      return handleError(res, 400, "Invalid due date format. Use YYYY-MM-DD");
    }

    // Verify assignment exists and belongs to the teacher
    const [assignment] = await connection.query(
      `SELECT a.class_id FROM Assignments a
       JOIN Classes c ON a.class_id = c.class_id
       WHERE a.assignment_id = ? AND a.teacher_id = ? AND c.school_id = ?`,
      [assignment_id, teacher_id, school_id]
    );
    if (!assignment.length) {
      await connection.rollback();
      return handleError(
        res,
        404,
        "Assignment not found or you are not authorized"
      );
    }

    // Verify class_id if provided
    if (class_id && class_id !== assignment[0].class_id) {
      const [classCheck] = await connection.query(
        "SELECT class_id FROM Classes WHERE class_id = ? AND teacher_id = ? AND school_id = ?",
        [class_id, teacher_id, school_id]
      );
      if (!classCheck.length) {
        await connection.rollback();
        return handleError(res, 403, "You are not assigned to this class");
      }
    }

    // Update assignment
    const [result] = await connection.query(
      `UPDATE Assignments 
       SET class_id = ?, title = ?, description = ?, due_date = ?, updated_at = NOW()
       WHERE assignment_id = ?`,
      [
        class_id || assignment[0].class_id,
        title,
        description,
        due_date,
        assignment_id,
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return handleError(res, 404, "Assignment not found");
    }

    await connection.commit();
    return res.status(200).json({
      status: "success",
      message: "Assignment updated successfully",
      data: { assignmentId: assignment_id },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating assignment:", error);
    return handleError(res, 500, "Failed to update assignment");
  } finally {
    connection.release();
  }
};

// Delete an assignment (Teacher only)
export const deleteAssignment = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { role, id: teacher_id, school_id } = req.user;
    const { assignment_id } = req.params;

    if (role !== "Teacher") {
      await connection.rollback();
      return handleError(res, 403, "Only teachers can delete assignments");
    }

    // Verify assignment exists and belongs to the teacher
    const [assignment] = await connection.query(
      `SELECT a.assignment_id FROM Assignments a
       JOIN Classes c ON a.class_id = c.class_id
       WHERE a.assignment_id = ? AND a.teacher_id = ? AND c.school_id = ?`,
      [assignment_id, teacher_id, school_id]
    );
    if (!assignment.length) {
      await connection.rollback();
      return handleError(
        res,
        404,
        "Assignment not found or you are not authorized"
      );
    }

    // Delete related submissions first
    await connection.query(
      "DELETE FROM Assignment_Submissions WHERE assignment_id = ?",
      [assignment_id]
    );

    // Delete assignment
    const [result] = await connection.query(
      "DELETE FROM Assignments WHERE assignment_id = ?",
      [assignment_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return handleError(res, 404, "Assignment not found");
    }

    await connection.commit();
    return res.status(200).json({
      status: "success",
      message: "Assignment deleted successfully",
      data: { assignmentId: assignment_id },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting assignment:", error);
    return handleError(res, 500, "Failed to delete assignment");
  } finally {
    connection.release();
  }
};

// Submit an assignment (Student only)
export const assignmentSubmission = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { role, id: user_id, school_id } = req.user;
    const { assignment_id, submission_date, status } = req.body;

    // Assuming role 'Student' is added to Users.role ENUM
    if (role !== "Student") {
      await connection.rollback();
      return handleError(res, 403, "Only students can submit assignments");
    }

    if (![assignment_id, submission_date, status].every(Boolean)) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "Assignment ID, submission date, and status are required"
      );
    }

    // Validate status
    const validStatuses = ["Pending", "Submitted", "Graded"];
    if (!validStatuses.includes(status)) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "Invalid status. Use Pending, Submitted, or Graded"
      );
    }

    // Validate submission date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(submission_date)) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "Invalid submission date format. Use YYYY-MM-DD"
      );
    }

    // Verify student is in the class for this assignment
    const [student] = await connection.query(
      `SELECT s.student_id
       FROM Students s
       JOIN Assignments a ON s.class_id = a.class_id
       JOIN Users u ON s.parent_id = u.user_id
       WHERE u.user_id = ? AND a.assignment_id = ? AND u.school_id = ?`,
      [user_id, assignment_id, school_id]
    );
    if (!student.length) {
      await connection.rollback();
      return handleError(
        res,
        403,
        "You are not enrolled in this assignment's class"
      );
    }

    // Check for existing submission
    const [existingSubmissions] = await connection.query(
      "SELECT submission_id FROM Assignment_Submissions WHERE assignment_id = ? AND student_id = ?",
      [assignment_id, student[0].student_id]
    );
    if (existingSubmissions.length > 0) {
      await connection.rollback();
      return handleError(
        res,
        400,
        "You have already submitted this assignment"
      );
    }

    // Insert submission
    const [result] = await connection.query(
      `INSERT INTO Assignment_Submissions (assignment_id, student_id, submission_date, status)
       VALUES (?, ?, ?, ?)`,
      [assignment_id, student[0].student_id, submission_date, status]
    );

    await connection.commit();
    return res.status(201).json({
      status: "success",
      message: "Assignment submitted successfully",
      data: { submissionId: result.insertId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error submitting assignment:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return handleError(res, 400, "Invalid assignment ID");
    }
    return handleError(res, 500, "Failed to process assignment submission");
  } finally {
    connection.release();
  }
};

// Get assignment submissions (Teacher only)
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { role, id: teacher_id, school_id } = req.user;
    const { assignment_id } = req.params;

    if (role !== "Teacher") {
      return handleError(
        res,
        403,
        "Only teachers can view assignment submissions"
      );
    }

    if (!assignment_id) {
      return handleError(res, 400, "Assignment ID is required");
    }

    // Verify assignment belongs to the teacher
    const [assignment] = await db.query(
      `SELECT a.assignment_id FROM Assignments a
       JOIN Classes c ON a.class_id = c.class_id
       WHERE a.assignment_id = ? AND a.teacher_id = ? AND c.school_id = ?`,
      [assignment_id, teacher_id, school_id]
    );
    if (!assignment.length) {
      return handleError(
        res,
        404,
        "Assignment not found or you are not authorized"
      );
    }

    // Fetch submissions
    const [submissions] = await db.query(
      `SELECT 
         s.submission_id, 
         s.assignment_id, 
         s.student_id, 
         s.submission_date, 
         s.status,
         st.first_name, 
         st.last_name, 
         st.roll_number
       FROM Assignment_Submissions s
       JOIN Students st ON s.student_id = st.student_id
       WHERE s.assignment_id = ?`,
      [assignment_id]
    );

    return res.status(200).json({
      status: "success",
      submissions: submissions.map((sub) => ({
        submissionId: sub.submission_id,
        assignmentId: sub.assignment_id,
        studentId: sub.student_id,
        studentName: `${sub.first_name} ${sub.last_name}`,
        rollNumber: sub.roll_number,
        submissionDate: sub.submission_date,
        status: sub.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    return handleError(res, 500, "Failed to fetch assignment submissions");
  }
};

// Get assignment submission summary (Teacher only)
export const getAssignmentSubmissionSummary = async (req, res) => {
  try {
    const { role, id: teacher_id, school_id } = req.user;
    const { class_id, start_date, end_date } = req.query;

    if (role !== "Teacher") {
      return handleError(
        res,
        403,
        "Only teachers can view assignment summaries"
      );
    }

    if (!class_id) {
      return handleError(res, 400, "Class ID is required");
    }

    // Verify teacher is assigned to the class
    const [classCheck] = await db.query(
      "SELECT class_id FROM Classes WHERE class_id = ? AND teacher_id = ? AND school_id = ?",
      [class_id, teacher_id, school_id]
    );
    if (!classCheck.length) {
      return handleError(res, 403, "You are not assigned to this class");
    }

    let query = `
      SELECT 
        a.assignment_id,
        a.title,
        a.due_date,
        COUNT(s.student_id) AS total_submissions,
        SUM(CASE WHEN s.status = 'Submitted' THEN 1 ELSE 0 END) AS submitted_count,
        SUM(CASE WHEN s.status = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN s.status = 'Graded' THEN 1 ELSE 0 END) AS graded_count
      FROM Assignments a
      LEFT JOIN Assignment_Submissions s ON a.assignment_id = s.assignment_id
      WHERE a.class_id = ?
    `;
    const params = [class_id];

    if (start_date && end_date) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(start_date) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(end_date)
      ) {
        return handleError(res, 400, "Invalid date format. Use YYYY-MM-DD");
      }
      query += " AND a.due_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    query += " GROUP BY a.assignment_id, a.title, a.due_date";

    const [summary] = await db.query(query, params);
    return res.status(200).json({
      status: "success",
      summary: summary.map((record) => ({
        assignmentId: record.assignment_id,
        title: record.title,
        dueDate: record.due_date,
        totalSubmissions: record.total_submissions,
        submittedCount: record.submitted_count,
        pendingCount: record.pending_count,
        gradedCount: record.graded_count,
        submissionRate: record.total_submissions
          ? ((record.submitted_count / record.total_submissions) * 100).toFixed(
              2
            )
          : "0.00",
      })),
    });
  } catch (error) {
    console.error("Error fetching assignment summary:", error);
    return handleError(res, 500, "Failed to fetch assignment summary");
  }
};
