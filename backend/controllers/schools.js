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

// Create School (Admins Only)
export const createSchool = async (req, res) => {
  try {
    const { role } = req.user;
    const { name, address, phone_number, email, admin_name, admin_email } = req.body;

    // Authorization check
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to create a school');
    }

    // Input validation
    const requiredFields = { name, address, phone_number, email, admin_name, admin_email };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return handleError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Create new school
    const result = await query(
      `INSERT INTO school 
       (name, address, phone_number, email, admin_name, admin_email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, address, phone_number, email, admin_name, admin_email]
    );

    return res.status(201).json({
      status: 'success',
      message: 'School created successfully',
      data: {
        school_id: result.insertId,
        name,
        email,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in createSchool:', error);
    return handleError(res, 500, 'Failed to create school');
  }
};

// Get All Schools (Public or Authenticated Users)
export const getAllSchools = async (req, res) => {
  try {
    const schools = await query('SELECT * FROM school');
    
    return res.status(200).json({
      status: 'success',
      data: {
        count: schools.length,
        schools
      }
    });
  } catch (error) {
    console.error('Error in getAllSchools:', error);
    return handleError(res, 500, 'Failed to fetch schools');
  }
};

// Update School (Admins Only)
export const updateSchool = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;
    const { name, address, phone_number, email, admin_name, admin_email } = req.body;

    // Authorization check
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to update this school');
    }

    // Input validation
    if (!id) {
      return handleError(res, 400, 'School ID is required');
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    const fieldsToUpdate = {
      name, address, phone_number, 
      email, admin_name, admin_email
    };

    Object.entries(fieldsToUpdate).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return handleError(res, 400, 'No valid fields provided for update');
    }

    updateValues.push(id); // Add id for WHERE clause

    const result = await query(
      `UPDATE school SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return handleError(res, 404, 'School not found');
    }

    // Fetch updated school data
    const [updatedSchool] = await query('SELECT * FROM school WHERE id = ?', [id]);

    return res.status(200).json({
      status: 'success',
      message: 'School updated successfully',
      data: updatedSchool
    });
  } catch (error) {
    console.error('Error in updateSchool:', error);
    return handleError(res, 500, 'Failed to update school');
  }
};

// Delete School (Admins Only)
export const deleteSchool = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Authorization check
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to delete this school');
    }

    // Input validation
    if (!id) {
      return handleError(res, 400, 'School ID is required');
    }

    // First, get school data before deletion for response
    const [school] = await query('SELECT * FROM school WHERE id = ?', [id]);
    
    if (!school) {
      return handleError(res, 404, 'School not found');
    }

    // Delete the school
    const result = await query('DELETE FROM school WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return handleError(res, 404, 'School not found');
    }

    return res.status(200).json({
      status: 'success',
      message: 'School deleted successfully',
      data: {
        id,
        name: school.name,
        deleted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in deleteSchool:', error);
    return handleError(res, 500, 'Failed to delete school');
  }
};
