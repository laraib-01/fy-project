import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to MySQL database');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

testConnection();

// Export the pool and a method to get a connection
export const getConnection = () => pool.getConnection();

export default {
    query: (sql, params) => pool.query(sql, params),
    execute: (sql, params) => pool.execute(sql, params),
    getConnection: () => pool.getConnection(),
    end: () => pool.end()
};