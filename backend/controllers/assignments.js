import db from "../config/db.js";
import { promisify } from 'util';

// Promisify db.query
const query = promisify(db.query).bind(db);

// Error handler
const handleError = (res, status = 500, message = 'An error occurred') => {
  console.error(message);
  return res.status(status).json({ status: 'error', message });
};

// Create an assignment (Teacher only)
export const createAssignment = async (req, res) => {
  try {
  const { role, id: teacher_id } = req.user;
  const { class_id, title, description, due_date } = req.body;

  if (role !== 'teacher') {
    return handleError(res, 403, 'You are not authorized to create an assignment');
  }

  if (![class_id, title, description, due_date].every(Boolean)) {
    return handleError(res, 400, 'All fields are required');
  }

  const result = await query(
    'INSERT INTO assignments (teacher_id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)',
    [teacher_id, class_id, title, description, due_date]
  );

  return res.status(201).json({
    status: 'success',
    message: 'Assignment created successfully',
    data: { assignmentId: result.insertId }
  });
  } catch (error) {
    return handleError(res, 500, 'Failed to create assignment');
  }
};

// Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
  const results = await query('SELECT * FROM assignments');
  return res.status(200).json({ status: 'success', data: results });
  } catch (error) {
    return handleError(res, 500, 'Failed to fetch assignments');
  }
};

// Update an assignment (Teacher only)
export const updateAssignment = async (req, res) => {
  try {
  const { role } = req.user;
  const { assignment_id } = req.params;
  const { title, description, due_date } = req.body;

  if (role !== 'teacher') {
    return handleError(res, 403, 'Access denied');
  }

  const result = await query(
    `UPDATE assignments 
     SET title = ?, description = ?, due_date = ?
     WHERE assignment_id = ?`,
    [title, description, due_date, assignment_id]
  );

  if (result.affectedRows === 0) {
    return handleError(res, 404, 'Assignment not found');
  }

  return res.status(200).json({ 
    status: 'success', 
    message: 'Assignment updated',
    data: { assignmentId: assignment_id }
  });
  } catch (error) {
    return handleError(res, 500, 'Failed to update assignment');
  }
};

// Delete an assignment (Teacher only)
export const deleteAssignment = async (req, res) => {
  try {
  const { role } = req.user;
  const { assignment_id } = req.params;

  if (role !== 'teacher') {
    return handleError(res, 403, 'Access denied');
  }

  const result = await query('DELETE FROM assignments WHERE assignment_id = ?', [assignment_id]);

  if (result.affectedRows === 0) {
    return handleError(res, 404, 'Assignment not found');
  }

  return res.status(200).json({ 
    status: 'success', 
    message: 'Assignment deleted',
    data: { assignmentId: assignment_id }
  });
  } catch (error) {
    return handleError(res, 500, 'Failed to delete assignment');
  }
};

// Submit an assignment (Student only)
export const assignmentSubmission = async (req, res) => {
  try {
    const { role, id: student_id } = req.user;
    const { assignment_id, submission_date, status } = req.body;

    if (role !== 'student') {
      return handleError(res, 403, 'You are not authorized to submit an assignment');
    }

    if (![assignment_id, submission_date, status].every(Boolean)) {
      return handleError(res, 400, 'All fields are required');
    }

    // Check for existing submission
    const existingSubmissions = await query(
      'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [assignment_id, student_id]
    );

    if (existingSubmissions.length > 0) {
      return handleError(res, 400, 'You have already submitted this assignment');
    }

    // Insert submission
    const result = await query(
      `INSERT INTO assignment_submissions 
       (assignment_id, student_id, submission_date, status) 
       VALUES (?, ?, ?, ?)`,
      [assignment_id, student_id, submission_date, status]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Assignment submitted successfully',
      data: { submissionId: result.insertId }
    });
  } catch (error) {
    return handleError(res, 500, 'Failed to process assignment submission');
  }
};
