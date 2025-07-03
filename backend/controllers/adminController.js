import bcrypt from "bcryptjs";
import db from "../config/db.js";

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  return res.status(status).json({
    status: "error",
    message,
  });
};

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await db.query(
      `SELECT user_id, name, email, created_at 
       FROM Users 
       WHERE role = 'EduConnect_Admin'
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      status: "success",
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return handleError(res, 500, "Failed to fetch admins");
  }
};

// Create a new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return handleError(res, 400, "Name, email, and password are required");
    }

    if (password.length < 8) {
      return handleError(
        res,
        400,
        "Password must be at least 8 characters long"
      );
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return handleError(res, 400, "Email already in use");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const [result] = await db.query(
      `INSERT INTO Users (name, email, password, role, school_id)
       VALUES (?, ?, ?, 'EduConnect_Admin', NULL)`,
      [name, email, hashedPassword]
    );

    // Get the created admin without password
    const [newAdmin] = await db.query(
      `SELECT user_id, name, email, created_at 
       FROM Users 
       WHERE user_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      status: "success",
      message: "Admin created successfully",
      data: newAdmin[0],
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return handleError(res, 500, "Failed to create admin");
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email) {
      return handleError(res, 400, "Name and email are required");
    }

    // Check if admin exists
    const [admins] = await db.query(
      "SELECT * FROM Users WHERE user_id = ? AND role = 'EduConnect_Admin'",
      [id]
    );

    if (admins.length === 0) {
      return handleError(res, 404, "Admin not found");
    }

    // Check if email is already in use by another user
    const [existingUser] = await db.query(
      "SELECT * FROM Users WHERE email = ? AND user_id != ?",
      [email, id]
    );

    if (existingUser.length > 0) {
      return handleError(res, 400, "Email already in use");
    }

    // Prepare update data
    let updateQuery = "UPDATE Users SET name = ?, email = ?";
    const queryParams = [name, email];

    // Update password if provided
    if (password) {
      if (password.length < 8) {
        return handleError(
          res,
          400,
          "Password must be at least 8 characters long"
        );
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += ", password = ?";
      queryParams.push(hashedPassword);
    }

    updateQuery += " WHERE user_id = ? AND role = 'EduConnect_Admin'";
    queryParams.push(id);

    await db.query(updateQuery, queryParams);

    // Get updated admin
    const [updatedAdmin] = await db.query(
      `SELECT user_id, name, email, created_at 
       FROM Users 
       WHERE user_id = ?`,
      [id]
    );

    return res.status(200).json({
      status: "success",
      message: "Admin updated successfully",
      data: updatedAdmin[0],
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return handleError(res, 500, "Failed to update admin");
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingAdminId = req.user.user_id;

    // Prevent self-deletion
    if (parseInt(id) === parseInt(requestingAdminId)) {
      return handleError(res, 400, "You cannot delete your own account");
    }

    // Check if admin exists
    const [admins] = await db.query(
      "SELECT * FROM Users WHERE user_id = ? AND role = 'EduConnect_Admin'",
      [id]
    );

    if (admins.length === 0) {
      return handleError(res, 404, "Admin not found");
    }

    // Delete the admin
    await db.query("DELETE FROM Users WHERE user_id = ?", [id]);

    return res.status(200).json({
      status: "success",
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return handleError(res, 500, "Failed to delete admin");
  }
};
