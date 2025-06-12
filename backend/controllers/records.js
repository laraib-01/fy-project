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

// Create a student record (Teacher only)
export const createRecord = async (req, res) => {
  try {
    const { role, id: teacher_id } = req.user;
    const { student_id, attendance, performance_text, task_description } = req.body;

    // Authorization check
    if (role !== 'teacher') {
      return handleError(res, 403, 'Access denied. Teacher privileges required');
    }

    // Input validation
    if (![student_id, attendance, performance_text, task_description].every(Boolean)) {
      return handleError(res, 400, 'All fields are required');
    }

    // Create new record
    const result = await query(
      `INSERT INTO student_records 
       (student_id, teacher_id, attendance, performance_text, task_description) 
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, teacher_id, attendance, performance_text, task_description]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Record created successfully',
      data: {
        recordId: result.insertId,
        student_id,
        attendance,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in createRecord:', error);
    return handleError(res, 500, 'Failed to create record');
  }
};

// Get student records (Parent or Teacher)
export const getRecords = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { role, id: userId } = req.user;

    // Input validation
    if (!student_id) {
      return handleError(res, 400, 'Student ID is required');
    }

    // Additional authorization check for parents
    if (role === 'parent') {
      // Verify the parent has access to this student's records
      const [parentAccess] = await query(
        'SELECT 1 FROM students WHERE id = ? AND parent_id = ?',
        [student_id, userId]
      );

      if (!parentAccess) {
        return handleError(res, 403, 'Access denied to student records');
      }
    }

    // Get records
    const records = await query(
      'SELECT * FROM student_records WHERE student_id = ?',
      [student_id]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        records
      }
    });
  } catch (error) {
    console.error('Error in getRecords:', error);
    return handleError(res, 500, 'Failed to fetch records');
  }
};
