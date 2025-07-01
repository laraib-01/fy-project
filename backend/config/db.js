// db.js

// Import the mysql2 package with Promise support
import mysql from "mysql2/promise";

// Import dotenv to load environment variables from a .env file
import dotenv from "dotenv";

// Load environment variables (e.g. DB_HOST, DB_USER, etc.)
dotenv.config();

// Define database configuration using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost", // MySQL server host (e.g. localhost)
  user: process.env.DB_USER || "root", // MySQL username
  password: process.env.DB_PASSWORD || "", // MySQL password
  database: process.env.DB_NAME || "educonnect", // Name of the database to use
  port: process.env.DB_PORT || 3307, // <-- ADD THIS LINE
  waitForConnections: true, // Queue connections if none are available
  connectionLimit: 10, // Max number of connections in the pool
  queueLimit: 0, // Max number of connection requests (0 = unlimited)
});

// Function to test if the connection to the database is working
const testConnection = async () => {
  try {
    // Try to get a connection from the pool
    const connection = await pool.getConnection();

    // If successful, print a confirmation message
    console.log("✅ Connected to MySQL database");

    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    // If the connection fails, print the error and exit the app
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit the process with an error code
  }
};

// Call the testConnection function to verify the DB is accessible
testConnection();

// Export a function to get a direct connection from the pool
export const getConnection = () => pool.getConnection(); // Useful for transactions or manual queries

// Export a query method for SELECT or complex SQL operations
export const query = (sql, params) => pool.query(sql, params); // Returns [rows, fields]

// Export an execute method (used for INSERT, UPDATE, DELETE)
export const execute = (sql, params) => pool.execute(sql, params); // Returns [result, fields]

// Export a method to gracefully close the pool (used when shutting down the app)
export const end = () => pool.end();

// Optionally export all methods together as a default object for convenience
export default {
  getConnection, // For manual control or transactions
  query, // For running raw SELECT SQL
  execute, // For running INSERT/UPDATE/DELETE
  end, // For closing the pool
};
