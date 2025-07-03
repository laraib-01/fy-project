import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js";
import {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
} from "../services/emailService.js";

// Error handler
const handleError = (res, status = 500, message = "An error occurred") => {
  return res.status(status).json({
    status: "error",
    message,
  });
};

// Input validation helper
const validateInput = (fields) => {
  const errors = [];
  const { email, password, name, role } = fields;

  // Email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please provide a valid email address");
  }

  // Password validation
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters long");
  }

  // Role validation
  const validRoles = ["EduConnect_Admin", "Teacher", "School_Admin", "Parent"];
  if (role && !validRoles.includes(role)) {
    errors.push(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  return errors.length > 0 ? errors : null;
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      schoolName,
      schoolEmail,
      schoolAddress,
      schoolPhone,
    } = req.body;

    // Input validation
    const validationErrors = validateInput({ name, email, password, role });
    if (validationErrors) {
      return handleError(res, 400, validationErrors.join(". "));
    }

    // Additional validation for School_Admin role
    if (role === "School_Admin") {
      if (!schoolName || schoolName.trim().length < 2) {
        return handleError(
          res,
          400,
          "School name is required for School_Admin role"
        );
      }
      if (!schoolEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolEmail)) {
        return handleError(
          res,
          400,
          "Valid school email is required for School_Admin role"
        );
      }
    }

    // Check if email already exists
    const [rows] = await db.query("SELECT 1 FROM Users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    const existingUser = rows[0];

    if (existingUser) {
      return handleError(res, 400, "Email already in use");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let school_id = null;
    let hasActiveSubscription = false;

    // Create school if role is School_Admin
    if (role === "School_Admin") {
      const [schoolResult] = await db.query(
        `INSERT INTO Schools (school_name, email, address, contact_number, admin_name, admin_email) VALUES (?, ?, ?, ? ,?, ?)`,
        [
          schoolName.trim(),
          schoolEmail.toLowerCase(),
          schoolAddress || null,
          schoolPhone || null,
          name.trim(),
          email.toLowerCase(),
        ]
      );

      school_id = schoolResult.insertId;

      // Check for active subscription
      const [subscriptionRows] = await db.query(
        `SELECT 1 FROM Subscriptions WHERE school_id = ? AND status = 'Active' AND payment_status = 'Succeeded'`,
        [school_id]
      );
      hasActiveSubscription = subscriptionRows.length > 0;
    }

    // Create new user
    await db.query(
      `INSERT INTO Users (name, email, password, role, school_id) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase(), hashedPassword, role, school_id]
    );

    // Get the newly created user
    const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    const newUser = users[0];

    if (!newUser) {
      throw new Error("Failed to fetch created user");
    }

    const tokenPayload = {
      id: newUser.user_id,
      role: newUser.role,
      ...(school_id && { school_id }), // Include school_id if it exists
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    delete newUser.password;

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: newUser,
        token,
        hasActiveSubscription, // Return boolean indicating subscription status
      },
    });
  } catch (error) {
    return handleError(res, 500, "Registration failed");
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return handleError(res, 400, "Email and password are required");
    }

    const [rows] = await db.query("SELECT * FROM Users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    const user = rows[0];

    if (!user) {
      return handleError(res, 401, "Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleError(res, 401, "Invalid credentials");
    }

    // Check for active subscription if user is School_Admin
    let hasActiveSubscription = false;
    if (user.role === "School_Admin" && user.school_id) {
      const [subscriptionRows] = await db.query(
        `SELECT 1 FROM Subscriptions WHERE school_id = ? AND status = 'Active' AND payment_status = 'Succeeded'`,
        [user.school_id]
      );
      hasActiveSubscription = subscriptionRows.length > 0;
    }

    // Generate JWT token
    let token;
    if (user.role === "EduConnect_Admin") {
      token = jwt.sign(
        { id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    } else {
      token = jwt.sign(
        { id: user.user_id, role: user.role, school_id: user.school_id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
        hasActiveSubscription, // Return boolean indicating subscription status
      },
    });
  } catch (error) {
    return handleError(res, 500, "Login failed");
  }
};

export const logout = async (req, res) => {
  try {
    // Since JWT is stateless, we can't invalidate the token on the server side
    // The client should remove the token from their storage
    return res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  } catch (error) {
    return handleError(res, 500, "Logout failed");
  }
};

export const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, name, email, role, school_id FROM Users WHERE user_id = ?",
      [req.user.id]
    );
    const user = rows[0];

    if (!user) {
      return handleError(res, 404, "User not found");
    }

    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    return handleError(res, 500, "Failed to fetch user profile");
  }
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return handleError(res, 400, "Email is required");
    }

    // Find user by email
    const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [
      email.toLowerCase(),
    ]);
    const user = users[0];

    // Don't reveal if user doesn't exist (security best practice)
    if (!user) {
      return res.status(200).json({
        status: "success",
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    }

    // Generate reset token and set expiry (1 hour from now)
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await db.query(
      "UPDATE Users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?",
      [resetToken, resetTokenExpires, user.user_id]
    );

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    return res.status(200).json({
      status: "success",
      message:
        "If an account with that email exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return handleError(res, 500, "Failed to process password reset request");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return handleError(res, 400, "Token and new password are required");
    }

    // Find user by reset token and check if it's still valid
    const [users] = await db.query(
      "SELECT * FROM Users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );
    const user = users[0];

    if (!user) {
      return handleError(res, 400, "Invalid or expired reset token");
    }

    // Validate password
    if (password.length < 8) {
      return handleError(
        res,
        400,
        "Password must be at least 8 characters long"
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token
    await db.query(
      `UPDATE Users 
       SET password = ?, reset_token = NULL, reset_token_expires = NULL 
       WHERE user_id = ?`,
      [hashedPassword, user.user_id]
    );

    // Send confirmation email
    await sendPasswordResetConfirmation(user.email, user.name);

    return res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return handleError(res, 500, "Failed to reset password");
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return handleError(res, 400, "Token is required");
    }

    // Check if token exists and is not expired
    const [rows] = await db.query(
      "SELECT 1 FROM Users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return handleError(res, 400, "Invalid or expired reset token");
    }

    return res.status(200).json({
      status: "success",
      valid: true,
    });
  } catch (error) {
    console.error("Error in validateResetToken:", error);
    return handleError(res, 500, "Failed to validate reset token");
  }
};
