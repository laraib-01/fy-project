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

// Create an event (Admin only)
export const createEvent = async (req, res) => {
  try {
    const { role, school_id } = req.user;
    const { title, date, time, location } = req.body;

    // Authorization check
    if (role !== 'admin') {
      return handleError(res, 403, 'Access denied. Admin privileges required');
    }

    // Input validation
    if (![title, date, time, location].every(Boolean)) {
      return handleError(res, 400, 'All fields are required');
    }

    // Create new event
    const result = await query(
      'INSERT INTO events (school_id, title, date, time, location) VALUES (?, ?, ?, ?, ?)',
      [school_id, title, date, time, location]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: {
        eventId: result.insertId,
        title,
        date,
        time,
        location
      }
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    return handleError(res, 500, 'Failed to create event');
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await query('SELECT * FROM events');
    
    return res.status(200).json({
      status: 'success',
      data: {
        events
      }
    });
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    return handleError(res, 500, 'Failed to fetch events');
  }
};
