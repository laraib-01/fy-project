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

export const createSubscription = async (req, res) => {
  try {
    const { role } = req.user;
    const { school_id, plan_type, start_date, end_date, status = 'active' } = req.body;

    // Authorization check
    if (role !== 'admin') {
      return handleError(res, 403, 'You are not authorized to create subscriptions');
    }

    // Input validation
    const requiredFields = { school_id, plan_type, start_date, end_date };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return handleError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return handleError(res, 400, 'Invalid date format. Please use YYYY-MM-DD');
    }

    if (startDate >= endDate) {
      return handleError(res, 400, 'End date must be after start date');
    }

    // Check for existing active subscription
    const [existingSubscription] = await query(
      'SELECT 1 FROM subscriptions WHERE school_id = ? AND status = ? AND end_date >= CURDATE()',
      [school_id, 'active']
    );

    if (existingSubscription) {
      return handleError(res, 400, 'An active subscription already exists for this school');
    }

    // Create new subscription
    const result = await query(
      `INSERT INTO subscriptions 
       (school_id, plan_type, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [school_id, plan_type, start_date, end_date, status]
    );

    // Get the newly created subscription
    const [newSubscription] = await query(
      'SELECT * FROM subscriptions WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      status: 'success',
      message: 'Subscription created successfully',
      data: newSubscription
    });
  } catch (error) {
    console.error('Error in createSubscription:', error);
    return handleError(res, 500, 'Failed to create subscription');
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { school_id } = req.query;

    // For non-admin users, they can only view their own school's subscriptions
    if (role !== 'admin' && school_id && school_id !== userId) {
      return handleError(res, 403, 'You are not authorized to view these subscriptions');
    }

    // Build query based on user role
    let queryString = `
      SELECT s.*, sc.name as school_name, sc.email as school_email
      FROM subscriptions s
      JOIN school sc ON s.school_id = sc.id
    `;
    let queryParams = [];

    if (role === 'admin' && school_id) {
      queryString += ' WHERE s.school_id = ?';
      queryParams.push(school_id);
    } else if (role !== 'admin') {
      queryString += ' WHERE s.school_id = ?';
      queryParams.push(userId);
    }

    queryString += ' ORDER BY s.start_date DESC';

    const subscriptions = await query(queryString, queryParams);

    // Add subscription status (active/expired)
    const now = new Date();
    const subscriptionsWithStatus = subscriptions.map(sub => ({
      ...sub,
      status: new Date(sub.end_date) >= now ? 'active' : 'expired'
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        count: subscriptionsWithStatus.length,
        subscriptions: subscriptionsWithStatus
      }
    });
  } catch (error) {
    console.error('Error in getSubscriptions:', error);
    return handleError(res, 500, 'Failed to fetch subscriptions');
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { id } = req.params;

    if (!id) {
      return handleError(res, 400, 'Subscription ID is required');
    }

    // Get subscription with school details
    const [subscription] = await query(
      `SELECT s.*, sc.name as school_name, sc.email as school_email,
              sc.address as school_address, sc.phone_number as school_phone
       FROM subscriptions s
       JOIN school sc ON s.school_id = sc.id
       WHERE s.id = ?`,
      [id]
    );

    if (!subscription) {
      return handleError(res, 404, 'Subscription not found');
    }

    // Authorization check
    if (role !== 'admin' && subscription.school_id !== userId) {
      return handleError(res, 403, 'You are not authorized to view this subscription');
    }

    // Add status (active/expired)
    const now = new Date();
    const status = new Date(subscription.end_date) >= now ? 'active' : 'expired';

    return res.status(200).json({
      status: 'success',
      data: {
        ...subscription,
        status
      }
    });
  } catch (error) {
    console.error('Error in getSubscriptionById:', error);
    return handleError(res, 500, 'Failed to fetch subscription details');
  }
};
