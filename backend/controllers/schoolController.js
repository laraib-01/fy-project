import db from "../config/db.js";
import { promisify } from "util";

// Promisify db.query
// const query = promisify(db.query).bind(db);

const query = db.query;

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  console.error(message);
  return res.status(status).json({
    status: "error",
    message,
  });
};

// Create School (Admins Only)
export const createSchool = async (req, res) => {
  try {
    const { role } = req.user;
    const {
      school_name,
      address,
      contact_number,
      email,
      admin_name,
      admin_email,
    } = req.body;

    // Authorization check
    if (role !== "EduConnect_Admin") {
      return handleError(res, 403, "You are not authorized to create a school");
    }

    // Input validation
    const requiredFields = {
      school_name,
      address,
      contact_number,
      email,
      admin_name,
      admin_email,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return handleError(
        res,
        400,
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }

    // Create new school
    const result = await query(
      `INSERT INTO schools
       (school_name, address, contact_number, email, admin_name, admin_email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [school_name, address, contact_number, email, admin_name, admin_email]
    );

    return res.status(201).json({
      status: "success",
      message: "School created successfully",
      data: {
        school_id: result.insertId,
        school_name,
        email,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in createSchool:", error);
    return handleError(res, 500, "Failed to create school");
  }
};

// Get All Schools (Public or Authenticated Users)
export const getAllSchools = async (req, res) => {
  try {
    const [schools] = await db.query(`
      SELECT 
        s.school_id,
        s.school_name,
        s.address,
        s.contact_number,
        s.email,
        s.admin_name,
        s.admin_email,
        sub.subscription_id,
        sub.plan_type,
        sub.start_date,
        sub.end_date,
        sub.status AS subscription_status,
        sub.payment_status,
        sub.transaction_id
      FROM schools s
      LEFT JOIN (
        SELECT *
        FROM subscriptions
        WHERE (school_id, end_date) IN (
          SELECT school_id, MAX(end_date)
          FROM subscriptions
          GROUP BY school_id
        )
      ) sub ON s.school_id = sub.school_id
    `);

    if (!schools.length) {
      return res.status(200).json({
        status: "success",
        data: {
          count: 0,
          schools: [],
        },
      });
    }

    // Extract school IDs for user lookup
    const schoolIds = schools.map((s) => s.school_id);

    // Fetch users for those schools
    const [users] = await db.query(
      `
      SELECT user_id, school_id, role, name, email
      FROM users
      WHERE school_id IN (?)
    `,
      [schoolIds]
    );

    // Group users by school_id
    const usersBySchool = {};
    users.forEach((user) => {
      if (!usersBySchool[user.school_id]) {
        usersBySchool[user.school_id] = [];
      }
      usersBySchool[user.school_id].push(user);
    });

    // Attach users to each school
    const schoolsWithUsers = schools.map((school) => ({
      ...school,
      users: usersBySchool[school.school_id] || [],
    }));

    
    // Return final response
    return res.status(200).json({
      status: 'success',
      data: {
        count: schoolsWithUsers.length,
        schools: schoolsWithUsers
      }
    });
  } catch (error) {
    console.error("Error in getAllSchools:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch schools and subscriptions",
    });
  }
};

// Update School (Admins Only)
export const updateSchool = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;
    const {
      school_name,
      address,
      contact_number,
      email,
      admin_name,
      admin_email,
    } = req.body;

    // Authorization check
    if (role !== "EduConnect_Admin") {
      return handleError(
        res,
        403,
        "You are not authorized to update this school"
      );
    }

    // Input validation
    if (!id) {
      return handleError(res, 400, "School ID is required");
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    const fieldsToUpdate = {
      school_name,
      address,
      contact_number,
      email,
      admin_name,
      admin_email,
    };

    Object.entries(fieldsToUpdate).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return handleError(res, 400, "No valid fields provided for update");
    }

    updateValues.push(id); // Add id for WHERE clause

    const result = await query(
      `UPDATE schools SET ${updateFields.join(", ")} WHERE school_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return handleError(res, 404, "School not found");
    }

    // Fetch updated school data
    const [updatedSchool] = await query(
      "SELECT * FROM schools WHERE school_id = ?",
      [id]
    );

    return res.status(200).json({
      status: "success",
      message: "School updated successfully",
      data: updatedSchool,
    });
  } catch (error) {
    console.error("Error in updateSchool:", error);
    return handleError(res, 500, "Failed to update school");
  }
};

// Delete School (Admins Only)
export const deleteSchool = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Authorization check
    if (role !== "EduConnect_Admin") {
      return handleError(
        res,
        403,
        "You are not authorized to delete this school"
      );
    }

    // Input validation
    if (!id) {
      return handleError(res, 400, "School ID is required");
    }

    // First, get school data before deletion for response
    const [school] = await query("SELECT * FROM schools WHERE school_id = ?", [
      id,
    ]);

    if (!school) {
      return handleError(res, 404, "School not found");
    }

    // Delete the school
    const result = await query("DELETE FROM schools WHERE school_id = ?", [id]);

    if (result.affectedRows === 0) {
      return handleError(res, 404, "School not found");
    }

    return res.status(200).json({
      status: "success",
      message: "School deleted successfully",
      data: {
        id,
        school_name: school.school_name,
        deleted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in deleteSchool:", error);
    return handleError(res, 500, "Failed to delete school");
  }
};
