import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// Error handler
const handleError = (res, status = 500, message = 'An error occurred') => {
  console.error(message);
  return res.status(status).json({ 
    status: 'error', 
    message 
  });
};

// Input validation helper
const validateInput = (fields) => {
  const errors = [];
  const { email, password, name, role } = fields;

  // Email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long');
  }

  // Role validation
  const validRoles = ['Admin', 'Teacher', 'Student', 'Parent'];
  if (role && !validRoles.includes(role)) {
    errors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  return errors.length > 0 ? errors : null;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'Student' } = req.body;

    // Input validation
    const validationErrors = validateInput({ name, email, password, role });
    if (validationErrors) {
      return handleError(res, 400, validationErrors.join('. '));
    }

    // Check if email already exists
    const [rows] = await db.query(
      'SELECT 1 FROM users WHERE email = ?',
      [email]
    );
    const existingUser = rows[0];

    if (existingUser) {
      return handleError(res, 400, 'Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase(), hashedPassword, role]
    );
    
    // Get the newly created user using email since we can't rely on ID
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    const newUser = users[0];
    
    if (!newUser) {
      throw new Error('Failed to fetch created user');
    }
    
    // Generate JWT token using email as identifier since ID might not exist
    const token = jwt.sign(
      { email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Remove password from the response
    if (newUser.password) {
      delete newUser.password;
    }

    return res.status(201).json({
      status: 'success',  
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    return handleError(res, 500, 'Registration failed');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return handleError(res, 400, 'Email and password are required');
    }

    // Get user from database
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    const user = rows[0];

    if (!user) {
      return handleError(res, 401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleError(res, 401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return handleError(res, 500, 'Login failed');
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to request by auth middleware
    const { id, role, name, email } = req.user;
    
    return res.status(200).json({
      status: 'success',
      data: {
        id,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return handleError(res, 500, 'Failed to fetch user data');
  }
};

