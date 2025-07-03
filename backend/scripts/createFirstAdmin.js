import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createFirstAdmin = async () => {
  try {
    // Check if there are any existing admins
    const [existingAdmins] = await db.query(
      "SELECT user_id FROM Users WHERE role = 'EduConnect_Admin'"
    );

    if (existingAdmins.length > 0) {
      console.log('Admin user already exists. Exiting...');
      process.exit(0);
    }

    // Default admin credentials (in production, these would come from environment variables)
    const adminData = {
      name: process.env.FIRST_ADMIN_NAME || 'Admin',
      email: process.env.FIRST_ADMIN_EMAIL || 'admin@educonnect.com',
      password: process.env.FIRST_ADMIN_PASSWORD || 'admin123',
    };

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Insert the first admin
    await db.query(
      `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, 'EduConnect_Admin')`,
      [adminData.name, adminData.email.toLowerCase(), hashedPassword]
    );

    console.log('First admin user created successfully!');
    console.log(`Email: ${adminData.email}`);
    console.log('Please change the default password after first login.');
    
  } catch (error) {
    console.error('Error creating first admin:', error);
  } finally {
    process.exit(0);
  }
};

createFirstAdmin();
