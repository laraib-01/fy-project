import db from "../config/db.js";
import { 
  createStripeProductAndPrice, 
  updateStripeProduct, 
  createPriceForProduct, 
  archiveStripePrice 
} from "../services/stripeService.js";


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
    const { 
      plan_name, 
      description = '',
      monthly_price, 
      yearly_price, 
      max_teachers, 
      max_parents, 
      features,
      currency = 'usd'
    } = req.body;

    // Authorization check - only EduConnect_Admin can create plans
    if (role !== 'EduConnect_Admin') {
      return handleError(res, 403, 'You are not authorized to create subscription plans');
    }

    // Input validation
    const requiredFields = { plan_name, monthly_price, yearly_price, currency };
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

    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create Stripe product and prices
      const monthlyStripePrice = await createStripeProductAndPrice({
        name: `${plan_name} (Monthly)`,
        description: `${plan_name} - Monthly Subscription`,
        unitAmount: Math.round(monthly_price * 100), // Convert to cents
        currency,
        interval: 'month',
        metadata: {
          plan_name,
          type: 'monthly',
          max_teachers: max_teachers || 'unlimited',
          max_parents: max_parents || 'unlimited'
        }
      });

      const yearlyStripePrice = await createStripeProductAndPrice({
        name: `${plan_name} (Yearly)`,
        description: `${plan_name} - Yearly Subscription`,
        unitAmount: Math.round(yearly_price * 100), // Convert to cents
        currency,
        interval: 'year',
        metadata: {
          plan_name,
          type: 'yearly',
          max_teachers: max_teachers || 'unlimited',
          max_parents: max_parents || 'unlimited',
          is_yearly: 'true'
        }
      });

      const insertQuery = `
        INSERT INTO Subscription_Plans 
        (plan_name, description, monthly_price, yearly_price, max_teachers, max_parents, 
         features, stripe_monthly_product_id, stripe_monthly_price_id, stripe_yearly_product_id, stripe_yearly_price_id, currency, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `;

      const [result] = await connection.query(insertQuery, [
        plan_name,
        description,
        monthly_price,
        yearly_price,
        max_teachers || null,
        max_parents || null,
        JSON.stringify(featuresArray),
        monthlyStripePrice.productId,
        monthlyStripePrice.priceId,
        yearlyStripePrice.productId,
        yearlyStripePrice.priceId,
        currency.toLowerCase()
      ]);

      // Get the newly created plan
      const [[newPlan]] = await connection.query(
        'SELECT * FROM Subscription_Plans WHERE plan_id = ?', 
        [result.insertId]
      );

      await connection.commit();
      connection.release();

      return res.status(201).json({
        status: 'success',
        data: newPlan
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error creating subscription plan:', error);
      return handleError(res, 500, 'Failed to create subscription plan: ' + error.message);
    }

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
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { role } = req.user;
    const { id } = req.params;
    const { 
      plan_name, 
      description,
      monthly_price, 
      yearly_price, 
      max_teachers, 
      max_parents, 
      features, 
      is_active,
      currency = 'USD'
    } = req.body;

    // Authorization check - only EduConnect_Admin can update plans
    if (role !== 'EduConnect_Admin') {
      await connection.rollback();
      return handleError(res, 403, 'You are not authorized to update subscription plans');
    }

    // Check if plan exists
    const [[existingPlan]] = await connection.query(
      'SELECT * FROM Subscription_Plans WHERE plan_id = ?', 
      [id]
    );
    
    if (!existingPlan) {
      await connection.rollback();
      return handleError(res, 404, 'Subscription plan not found');
    }

    // Parse features if provided
    let featuresArray = existingPlan.features ? 
      (typeof existingPlan.features === 'string' ? 
        JSON.parse(existingPlan.features) : 
        existingPlan.features) : 
      [];
      
    if (features !== undefined) {
      if (typeof features === 'string') {
        try {
          featuresArray = JSON.parse(features);
        } catch (e) {
          await connection.rollback();
          return handleError(res, 400, 'Invalid features format. Must be a valid JSON array');
        }
      } else if (Array.isArray(features)) {
        featuresArray = features;
      }
    }

    // Prepare update data
    const updateData = {
      plan_name: plan_name !== undefined ? plan_name : existingPlan.plan_name,
      description: description !== undefined ? description : existingPlan.description,
      monthly_price: monthly_price !== undefined ? parseFloat(monthly_price) : existingPlan.monthly_price,
      yearly_price: yearly_price !== undefined ? parseFloat(yearly_price) : existingPlan.yearly_price,
      max_teachers: max_teachers !== undefined ? (max_teachers ? parseInt(max_teachers) : null) : existingPlan.max_teachers,
      max_parents: max_parents !== undefined ? (max_parents ? parseInt(max_parents) : null) : existingPlan.max_parents,
      features: JSON.stringify(featuresArray),
      is_active: is_active !== undefined ? is_active : existingPlan.is_active,
      currency: currency || existingPlan.currency || 'USD'
    };

    // Update Stripe products if name/description changes
    const metadata = {
      plan_name: updateData.plan_name,
      max_teachers: updateData.max_teachers || 'unlimited',
      max_parents: updateData.max_parents || 'unlimited'
    };

    // Update monthly product if it exists
    if (existingPlan.stripe_monthly_product_id) {
      await updateStripeProduct(existingPlan.stripe_monthly_product_id, {
        name: `${updateData.plan_name} (Monthly)`,
        description: `${updateData.plan_name} - Monthly Subscription`,
        metadata: { ...metadata, type: 'monthly' }
      });
    }

    // Update yearly product if it exists
    if (existingPlan.stripe_yearly_product_id) {
      await updateStripeProduct(existingPlan.stripe_yearly_product_id, {
        name: `${updateData.plan_name} (Yearly)`,
        description: `${updateData.plan_name} - Yearly Subscription`,
        metadata: { ...metadata, type: 'yearly', is_yearly: 'true' }
      });
    }

    // Check if monthly price changed
    let monthlyPriceId = existingPlan.stripe_monthly_price_id;
    if (monthly_price !== undefined && 
        parseFloat(monthly_price) !== parseFloat(existingPlan.monthly_price)) {
      // Archive old price
      if (existingPlan.stripe_monthly_price_id) {
        await archiveStripePrice(existingPlan.stripe_monthly_price_id);
      }
      
      // Create new price
      const newPrice = await createPriceForProduct({
        productId: existingPlan.stripe_monthly_product_id,
        unitAmount: Math.round(parseFloat(monthly_price) * 100),
        currency: updateData.currency.toLowerCase(),
        interval: 'month',
        metadata: { ...metadata, type: 'monthly' }
      });
      
      monthlyPriceId = newPrice.id;
    }

    // Check if yearly price changed
    let yearlyPriceId = existingPlan.stripe_yearly_price_id;
    if (yearly_price !== undefined && 
        parseFloat(yearly_price) !== parseFloat(existingPlan.yearly_price)) {
      // Archive old price
      if (existingPlan.stripe_yearly_price_id) {
        await archiveStripePrice(existingPlan.stripe_yearly_price_id);
      }
      
      // Create new price
      const newPrice = await createPriceForProduct({
        productId: existingPlan.stripe_yearly_product_id,
        unitAmount: Math.round(parseFloat(yearly_price) * 100),
        currency: updateData.currency.toLowerCase(),
        interval: 'year',
        metadata: { ...metadata, type: 'yearly', is_yearly: 'true' }
      });
      
      yearlyPriceId = newPrice.id;
    }

    // Update the plan in the database
    const updateQuery = `
      UPDATE Subscription_Plans 
      SET 
        plan_name = ?,
        description = ?,
        monthly_price = ?,
        yearly_price = ?,
        max_teachers = ?,
        max_parents = ?,
        features = ?,
        is_active = ?,
        currency = ?,
        stripe_monthly_price_id = ?,
        stripe_yearly_price_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE plan_id = ?
    `;

    await connection.query(updateQuery, [
      updateData.plan_name,
      updateData.description,
      updateData.monthly_price,
      updateData.yearly_price,
      updateData.max_teachers,
      updateData.max_parents,
      updateData.features,
      updateData.is_active,
      updateData.currency,
      monthlyPriceId,
      yearlyPriceId,
      id
    ]);

    // Get the updated plan
    const [[updatedPlan]] = await connection.query(
      'SELECT * FROM Subscription_Plans WHERE plan_id = ?', 
      [id]
    );

    // Parse features for the response
    const formattedPlan = {
      ...updatedPlan,
      features: updatedPlan.features ? JSON.parse(updatedPlan.features) : []
    };

    await connection.commit();
    connection.release();

    return res.status(200).json({
      status: 'success',
      data: formattedPlan
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error updating subscription plan:', error);
    return handleError(res, 500, `Failed to update subscription plan: ${error.message}`);
  }
};

/**
 * Delete a subscription plan (soft delete - sets is_active to false)
 */
/**
 * Toggle plan status (active/inactive) - handles Stripe product archival/reactivation
 */
export const togglePlanStatus = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { role } = req.user;
    const { id } = req.params;
    const { is_active } = req.body;

    // Authorization check - only EduConnect_Admin can toggle plan status
    if (role !== 'EduConnect_Admin') {
      await connection.rollback();
      return handleError(res, 403, 'You are not authorized to update subscription plans');
    }

    // Check if plan exists
    const [[plan]] = await connection.query(
      'SELECT * FROM Subscription_Plans WHERE plan_id = ?', 
      [id]
    );
    
    if (!plan) {
      await connection.rollback();
      return handleError(res, 404, 'Subscription plan not found');
    }

    // Update the plan status in the database
    await connection.query(
      'UPDATE Subscription_Plans SET is_active = ? WHERE plan_id = ?',
      [is_active, id]
    );

    // Archive or unarchive Stripe products based on the new status
    if (plan.stripe_monthly_product_id) {
      await updateStripeProduct(plan.stripe_monthly_product_id, {
        active: is_active
      });
    }

    if (plan.stripe_yearly_product_id) {
      await updateStripeProduct(plan.stripe_yearly_product_id, {
        active: is_active
      });
    }

    // Get the updated plan
    const [[updatedPlan]] = await connection.query(
      'SELECT * FROM Subscription_Plans WHERE plan_id = ?', 
      [id]
    );

    // Parse features for the response
    const formattedPlan = {
      ...updatedPlan,
      features: updatedPlan.features ? JSON.parse(updatedPlan.features) : []
    };

    await connection.commit();
    connection.release();

    return res.status(200).json({
      status: 'success',
      data: formattedPlan
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error toggling plan status:', error);
    return handleError(res, 500, `Failed to toggle plan status: ${error.message}`);
  }
};

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
