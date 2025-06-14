import db from "../config/db.js";


// Error handler
const handleError = (res, status = 500, message = 'An error occurred') => {
  console.error(message);
  return res.status(status).json({ 
    status: 'error', 
    message 
  });
};

/**
 * Create a new subscription plan (Admin only)
 */
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { role } = req.user;
    const { plan_name, monthly_price, yearly_price, max_teachers, max_parents, features } = req.body;

    // Authorization check - only EduConnect_Admin can create plans
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to create subscription plans');
    }

    // Input validation
    const requiredFields = { plan_name, monthly_price, yearly_price };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return handleError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Parse features if it's a string (should be JSON array)
    let featuresArray = [];
    if (typeof features === 'string') {
      try {
        featuresArray = JSON.parse(features);
      } catch (e) {
        return handleError(res, 400, 'Invalid features format. Must be a valid JSON array');
      }
    } else if (Array.isArray(features)) {
      featuresArray = features;
    }

    const insertQuery = `
      INSERT INTO Subscription_Plans 
      (plan_name, monthly_price, yearly_price, max_teachers, max_parents, features)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertQuery, [
      plan_name,
      monthly_price,
      yearly_price,
      max_teachers || null,
      max_parents || null,
      JSON.stringify(featuresArray)
    ]);

    // Get the newly created plan
    const [newPlan] = await db.query('SELECT * FROM Subscription_Plans WHERE plan_id = ?', [result.insertId]);

    return res.status(201).json({
      status: 'success',
      data: newPlan
    });

  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return handleError(res, 500, 'Failed to create subscription plan');
  }
};

/**
 * Get all subscription plans (active by default, or all if requested)
 */
export const getSubscriptionPlans = async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM Subscription_Plans');
    
    // Parse features from JSON string to array
    const formattedPlans = plans.map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' 
        ? JSON.parse(plan.features) 
        : plan.features,
      is_active: Boolean(plan.is_active) // Convert to boolean
    }));
    
    return res.status(200).json({
      status: 'success',
      results: formattedPlans.length,
      data: formattedPlans
    });
    
  } catch (error) {
    return handleError(res, 500, 'Failed to fetch subscription plans');
  }
};

/**
 * Get a single subscription plan by ID
 */
export const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [plan] = await db.query('SELECT * FROM Subscription_Plans WHERE plan_id = ?', [id]);
    
    if (!plan) {
      return handleError(res, 404, 'Subscription plan not found');
    }
    
    // Parse features from JSON string to array
    const formattedPlan = {
      ...plan,
      features: plan.features ? JSON.parse(plan.features) : []
    };
    
    return res.status(200).json({
      status: 'success',
      data: formattedPlan
    });
    
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return handleError(res, 500, 'Failed to fetch subscription plan');
  }
};

/**
 * Update a subscription plan (Admin only)
 */
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;
    const { plan_name, monthly_price, yearly_price, max_teachers, max_parents, features, is_active } = req.body;

    // Authorization check - only EduConnect_Admin can update plans
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to update subscription plans');
    }

    // Check if plan exists
    const [existingPlan] = await db.query('SELECT * FROM Subscription_Plans WHERE plan_id = ?', [id]);
    if (!existingPlan) {
      return handleError(res, 404, 'Subscription plan not found');
    }

    // Parse features if provided
    let featuresArray = existingPlan.features ? JSON.parse(existingPlan.features) : [];
    if (features !== undefined) {
      if (typeof features === 'string') {
        try {
          featuresArray = JSON.parse(features);
        } catch (e) {
          return handleError(res, 400, 'Invalid features format. Must be a valid JSON array');
        }
      } else if (Array.isArray(features)) {
        featuresArray = features;
      }
    }

    const updateQuery = `
      UPDATE Subscription_Plans 
      SET 
        plan_name = ?,
        monthly_price = ?,
        yearly_price = ?,
        max_teachers = ?,
        max_parents = ?,
        features = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = ?
    `;

    await db.query(updateQuery, [
      plan_name !== undefined ? plan_name : existingPlan.plan_name,
      monthly_price !== undefined ? monthly_price : existingPlan.monthly_price,
      yearly_price !== undefined ? yearly_price : existingPlan.yearly_price,
      max_teachers !== undefined ? (max_teachers === 0 ? null : max_teachers) : existingPlan.max_teachers,
      max_parents !== undefined ? (max_parents === 0 ? null : max_parents) : existingPlan.max_parents,
      JSON.stringify(featuresArray),
      is_active !== undefined ? is_active : existingPlan.is_active,
      id
    ]);

    // Get the updated plan
    const [updatedPlan] = await db.query('SELECT * FROM Subscription_Plans WHERE plan_id = ?', [id]);
    
    // Parse features from JSON string to array
    const formattedPlan = {
      ...updatedPlan,
      features: updatedPlan.features ? JSON.parse(updatedPlan.features) : []
    };

    return res.status(200).json({
      status: 'success',
      data: formattedPlan
    });

  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return handleError(res, 500, 'Failed to update subscription plan');
  }
};

/**
 * Delete a subscription plan (soft delete - sets is_active to false)
 */
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // Authorization check - only EduConnect_Admin can delete plans
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to delete subscription plans');
    }

    // Check if plan exists
    const [existingPlan] = await db.query('SELECT * FROM Subscription_Plans WHERE plan_id = ?', [id]);
    if (!existingPlan) {
      return handleError(res, 404, 'Subscription plan not found');
    }

    // Soft delete by setting is_active to false
    await query('UPDATE Subscription_Plans SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE plan_id = ?', [id]);

    return res.status(200).json({
      status: 'success',
      message: 'Subscription plan deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return handleError(res, 500, 'Failed to delete subscription plan');
  }
};
