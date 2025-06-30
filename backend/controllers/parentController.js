import db from "../config/db.js";

// Get all students linked to the parent
export const getLinkedStudents = async (req, res) => {
  try {
    const { user_id, role } = req.user;

    // Only parents can access this endpoint
    if (role !== 'Parent') {
      return res.status(403).json({ 
        status: "error", 
        message: "Access denied. Only parents can view linked students." 
      });
    }

    // Get all students linked to this parent
    const [students] = await db.query(`
      SELECT s.student_id, s.first_name, s.last_name, s.date_of_birth, s.gender,
             c.class_name, c.class_id,
             u.name as teacher_name
      FROM Parent_Student_Links psl
      JOIN Students s ON psl.student_id = s.student_id
      JOIN Classes c ON s.class_id = c.class_id
      LEFT JOIN Users u ON c.teacher_id = u.user_id
      WHERE psl.parent_user_id = ?
    `, [user_id]);

    return res.status(200).json({
      status: "success",
      data: students
    });
  } catch (error) {
    console.error("Error in getLinkedStudents:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch linked students" });
  }
};

// Get attendance for a specific student
export const getStudentAttendance = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const { studentId } = req.params;

    // Only parents can access this endpoint
    if (role !== 'Parent') {
      return res.status(403).json({ 
        status: "error", 
        message: "Access denied. Only parents can view student attendance." 
      });
    }

    // Verify the parent has access to this student
    const [hasAccess] = await db.query(
      `SELECT 1 FROM Parent_Student_Links 
       WHERE parent_user_id = ? AND student_id = ?`,
      [user_id, studentId]
    );

    if (!hasAccess.length) {
      return res.status(403).json({ 
        status: "error", 
        message: "You don't have access to this student's attendance." 
      });
    }

    // Get attendance records
    const [attendance] = await db.query(
      `SELECT a.attendance_date, a.status, 
              u.name as marked_by, a.notes
       FROM Attendance a
       JOIN Users u ON a.teacher_id = u.user_id
       WHERE a.student_id = ?
       ORDER BY a.attendance_date DESC
       LIMIT 30`,
      [studentId]
    );

    return res.status(200).json({
      status: "success",
      data: attendance
    });
  } catch (error) {
    console.error("Error in getStudentAttendance:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch attendance" });
  }
};

// Get assignments for a specific student
export const getStudentAssignments = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const { studentId } = req.params;

    if (role !== 'Parent') {
      return res.status(403).json({ 
        status: "error", 
        message: "Access denied. Only parents can view student assignments." 
      });
    }

    // Verify the parent has access to this student
    const [hasAccess] = await db.query(
      `SELECT 1 FROM Parent_Student_Links 
       WHERE parent_user_id = ? AND student_id = ?`,
      [user_id, studentId]
    );

    if (!hasAccess.length) {
      return res.status(403).json({ 
        status: "error", 
        message: "You don't have access to this student's assignments." 
      });
    }

    // Get assignments with submission status
    const [assignments] = await db.query(`
      SELECT a.assignment_id, a.title, a.description, a.due_date,
             c.class_name, u.name as teacher_name,
             asub.status as submission_status, asub.submission_date,
             asub.grade, asub.feedback
      FROM Assignments a
      JOIN Classes c ON a.class_id = c.class_id
      JOIN Users u ON a.teacher_id = u.user_id
      LEFT JOIN Assignment_Submissions asub 
        ON a.assignment_id = asub.assignment_id 
        AND asub.student_id = ?
      WHERE c.class_id = (SELECT class_id FROM Students WHERE student_id = ?)
      ORDER BY a.due_date DESC
    `, [studentId, studentId]);

    return res.status(200).json({
      status: "success",
      data: assignments
    });
  } catch (error) {
    console.error("Error in getStudentAssignments:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch assignments" });
  }
};

// Get performance data for a specific student
export const getStudentPerformance = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const { studentId } = req.params;

    if (role !== 'Parent') {
      return res.status(403).json({ 
        status: "error", 
        message: "Access denied. Only parents can view student performance." 
      });
    }

    // Verify the parent has access to this student
    const [hasAccess] = await db.query(
      `SELECT 1 FROM Parent_Student_Links 
       WHERE parent_user_id = ? AND student_id = ?`,
      [user_id, studentId]
    );

    if (!hasAccess.length) {
      return res.status(403).json({ 
        status: "error", 
        message: "You don't have access to this student's performance data." 
      });
    }

    // Get performance data
    const [performance] = await db.query(
      `SELECT p.performance_id, p.subject, p.grade, p.remarks, 
              p.evaluation_date, u.name as evaluated_by
       FROM Performance p
       JOIN Users u ON p.teacher_id = u.user_id
       WHERE p.student_id = ?
       ORDER BY p.evaluation_date DESC`,
      [studentId]
    );

    return res.status(200).json({
      status: "success",
      data: performance
    });
  } catch (error) {
    console.error("Error in getStudentPerformance:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch performance data" });
  }
};

// Get school events
export const getSchoolEvents = async (req, res) => {
  try {
    const { user_id, role, school_id } = req.user;

    if (role !== 'Parent') {
      return res.status(403).json({ 
        status: "error", 
        message: "Access denied. Only parents can view school events." 
      });
    }

    // Get upcoming school events
    const [events] = await db.query(
      `SELECT event_id, event_name, event_date, event_time, 
              event_location, description
       FROM Events 
       WHERE school_id = ? AND event_date >= CURDATE()
       ORDER BY event_date, event_time
       LIMIT 20`,
      [school_id]
    );

    return res.status(200).json({
      status: "success",
      data: events
    });
  } catch (error) {
    console.error("Error in getSchoolEvents:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch school events" });
  }
};
