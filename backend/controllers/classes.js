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

// Create Class
export const createClass = async (req, res) => {
  try {
    const { school_id, class_name } = req.body;
    const { id: teacher_id } = req.user;

    // Input validation
    if (!school_id || !class_name) {
      return handleError(res, 400, 'school_id and class_name are required');
    }

    // Insert new class
    const result = await query(
      'INSERT INTO classes (school_id, teacher_id, class_name) VALUES (?, ?, ?)',
      [school_id, teacher_id, class_name]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Class created successfully',
      data: {
        class_id: result.insertId,
        class_name,
        school_id
      }
    });
  } catch (error) {
    console.error('Error in createClass:', error);
    return handleError(res, 500, 'Failed to create class');
  }
};

// Get All Classes for the Logged-in Teacher
export const getTeacherClasses = async (req, res) => {
  try {
    const { id: teacher_id } = req.user;

    // Fetch all classes for the teacher
    const classes = await query(
      'SELECT * FROM classes WHERE teacher_id = ?',
      [teacher_id]
    );

    return res.status(200).json({
      status: 'success',
      data: {
        classes
      }
    });
  } catch (error) {
    console.error('Error in getTeacherClasses:', error);
    return handleError(res, 500, 'Failed to fetch classes');
  }
};



// Update Class (Name or Assign Teacher)
export const updateClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { class_name } = req.body;
    const { id: teacher_id } = req.user;

    // Input validation
    if (!class_name) {
      return handleError(res, 400, 'class_name is required');
    }

    // Update class name
    const result = await query(
      'UPDATE classes SET class_name = ? WHERE id = ? AND teacher_id = ?',
      [class_name, class_id, teacher_id]
    );

    if (result.affectedRows === 0) {
      return handleError(res, 404, 'Class not found or you do not have permission');
    }

    return res.status(200).json({
      status: 'success',
      message: 'Class updated successfully',
      data: {
        class_id,
        class_name
      }
    });
  } catch (error) {
    console.error('Error in updateClass:', error);
    return handleError(res, 500, 'Failed to update class');
  }
};

// Delete Class
export const deleteClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const { id: teacher_id } = req.user;

    // Delete the class
    const result = await query(
      'DELETE FROM classes WHERE id = ? AND teacher_id = ?',
      [class_id, teacher_id]
    );

    if (result.affectedRows === 0) {
      return handleError(res, 404, 'Class not found or you do not have permission');
    }

    return res.status(200).json({
      status: 'success',
      message: 'Class deleted successfully',
      data: {
        class_id
      }
    });
  } catch (error) {
    console.error('Error in deleteClass:', error);
    return handleError(res, 500, 'Failed to delete class');
  }
};
