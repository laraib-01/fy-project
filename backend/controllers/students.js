import db from "../config/db.js";
import { promisify } from 'util';

// Promisify db.query
const query = promisify(db.query).bind(db);

// Error handler
const handleError = (res, status = 500, message = 'An error occurred') => {
  console.error(message);
  return res.status(status).json({ 
    status: 'error', 
    message 
  });
};


export const getStudents = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { role, id: userId } = req.user;

    // Input validation
    if (!class_id) {
      return handleError(res, 400, 'Class ID is required');
    }

    // Additional authorization check for parents
    if (role === 'parent') {
      // Verify the parent has a child in this class
      const [hasAccess] = await query(
        `SELECT 1 FROM students 
         WHERE class_id = ? AND parent_id = ? 
         LIMIT 1`,
        [class_id, userId]
      );

      if (!hasAccess) {
        return handleError(res, 403, 'Access denied to student records');
      }
    }

    // Get students with additional class information
    const students = await query(
      `SELECT s.id, s.first_name, s.last_name, s.email, s.date_of_birth,
              s.gender, s.address, s.phone_number, s.enrollment_date,
              c.class_name, c.grade_level
       FROM students s
       JOIN classes c ON s.class_id = c.id
       WHERE s.class_id = ?
       ORDER BY s.last_name, s.first_name`,
      [class_id]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        count: students.length,
        students
      }
    });
  } catch (error) {
    console.error('Error in getStudents:', error);
    return handleError(res, 500, 'Failed to fetch students');
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    if (!id) {
      return handleError(res, 400, 'Student ID is required');
    }

    // Get student with detailed information
    const [student] = await query(
      `SELECT s.*, c.class_name, c.grade_level, 
              CONCAT(t.first_name, ' ', t.last_name) as teacher_name
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN users t ON c.teacher_id = t.id
       WHERE s.id = ?`,
      [id]
    );

    if (!student) {
      return handleError(res, 404, 'Student not found');
    }

    // Authorization check for parents
    if (role === 'parent' && student.parent_id !== userId) {
      return handleError(res, 403, 'Access denied to this student record');
    }

    // Get attendance summary for the student
    const [attendance] = await query(
      `SELECT 
         COUNT(*) as total_days,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
         SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
         SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
       FROM attendance 
       WHERE student_id = ?`,
      [id]
    );

    // Get recent assignments
    const assignments = await query(
      `SELECT a.id, a.title, a.due_date, 
              asub.submission_date, asub.status, asub.grade
       FROM assignments a
       LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
       WHERE a.class_id = ?
       ORDER BY a.due_date DESC
       LIMIT 5`,
      [id, student.class_id]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        ...student,
        attendance: attendance || { total_days: 0, present_days: 0, absent_days: 0, late_days: 0 },
        recent_assignments: assignments
      }
    });
  } catch (error) {
    console.error('Error in getStudentById:', error);
    return handleError(res, 500, 'Failed to fetch student details');
  }
};

export const createStudent = async (req, res) => {
  try {
    const { role } = req.user;
    const {
      first_name,
      last_name,
      email,
      date_of_birth,
      gender,
      address,
      phone_number,
      class_id,
      parent_id,
      enrollment_date
    } = req.body;

    // Authorization check
    if (!['admin', 'school_admin'].includes(role)) {
      return handleError(res, 403, 'You are not authorized to create students');
    }

    // Input validation
    const requiredFields = {
      first_name,
      last_name,
      email,
      date_of_birth,
      class_id
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return handleError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if email already exists
    const [existingStudent] = await query(
      'SELECT 1 FROM students WHERE email = ?',
      [email]
    );

    if (existingStudent) {
      return handleError(res, 400, 'A student with this email already exists');
    }

    // Insert new student
    const result = await query(
      `INSERT INTO students 
       (first_name, last_name, email, date_of_birth, gender, 
        address, phone_number, class_id, parent_id, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        date_of_birth,
        gender || null,
        address || null,
        phone_number || null,
        class_id,
        parent_id || null,
        enrollment_date || new Date().toISOString().split('T')[0]
      ]
    );

    // Get the newly created student
    const [newStudent] = await query(
      'SELECT * FROM students WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: newStudent
    });
  } catch (error) {
    console.error('Error in createStudent:', error);
    return handleError(res, 500, 'Failed to create student');
  }
};
