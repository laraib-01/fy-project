import Stripe from "stripe";
import db from "../config/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: false, // Add this line to suppress TypeScript warning if needed
});

// Defaults
const DEFAULT_CURRENCY = "usd";
const DEFAULT_INTERVAL = "month";

// Safe logger
const logError = (msg, err) => {
  console.error(msg, {
    message: err?.message,
    type: err?.type,
    code: err?.code,
  });
};

// Create a Stripe customer and link to a school
export const createCustomer = async (user, paymentMethodId) => {
  try {
    if (!user.school_id) throw new Error("Missing school_id on user");

    // Safety check: prevent reuse of an already-attached PaymentMethod
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (pm.customer) {
      throw new Error("Payment method already attached to another customer");
    }

    // Create customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.school_name || `${user.first_name} ${user.last_name}`,
      metadata: {
        userId: user.id,
        schoolId: user.school_id,
      },
    });

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Save to DB
    await db.query(
      "UPDATE Schools SET stripe_customer_id = ? WHERE school_id = ?",
      [customer.id, user.school_id]
    );

    return customer;
  } catch (error) {
    logError("Error creating Stripe customer:", error);
    throw new Error("Failed to create customer in payment system");
  }
};

// Create subscription
export const createStripeSubscription = async (
  customerId,
  priceId,
  metadata = {}
) => {
  try {
    // First, get the default payment method for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1
    });

    if (paymentMethods.data.length === 0) {
      throw new Error('No payment method found for this customer');
    }

    const paymentMethod = paymentMethods.data[0];
    
    // Create subscription with immediate payment
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethod.id,
      expand: ['latest_invoice.payment_intent'],
      metadata,
      off_session: true, // This allows the payment to complete without customer action
      // payment_behavior: 'pending_if_incomplete',
      proration_behavior: 'create_prorations',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      collection_method: 'charge_automatically'
    });

    // If the subscription requires payment, confirm the payment intent
    if (subscription.pending_setup_intent) {
      const setupIntent = await stripe.setupIntents.confirm(
        subscription.pending_setup_intent,
        { payment_method: paymentMethod.id }
      );
    }

    // Refresh the subscription to get the latest status
    const updatedSubscription = await stripe.subscriptions.retrieve(subscription.id, {
      expand: ['latest_invoice.payment_intent']
    });

    return updatedSubscription;
  } catch (error) {
    logError("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    logError("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
};

// Get subscription
export const getSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["customer", "latest_invoice.payment_intent"],
    });
  } catch (error) {
    logError("Error getting subscription:", error);
    throw new Error("Failed to get subscription details");
  }
};

// Handle webhook
export const handleWebhook = async (payload, signature, webhookSecret) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return { event };
  } catch (error) {
    logError("Error verifying webhook signature:", error);
    throw new Error("Webhook signature verification failed");
  }
};

// Update Stripe product
export const updateStripeProduct = async (productId, updates) => {
  try {
    if (!stripe) throw new Error("Stripe not initialized");

    // Archive prices if deactivating product
    if (updates.active === false) {
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 100,
      });
      await Promise.all(
        prices.data.map((price) =>
          stripe.prices
            .update(price.id, { active: false })
            .catch((err) =>
              logError(`Failed to archive price ${price.id}`, err)
            )
        )
      );
    }

    // Reactivate price if activating product
    if (updates.active === true) {
      const prices = await stripe.prices.list({
        product: productId,
        active: false,
        limit: 1,
      });
      if (prices.data.length > 0) {
        await stripe.prices.update(prices.data[0].id, { active: true });
      }
    }

    // Filter undefined fields
    const updateData = { ...updates };
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    return await stripe.products.update(productId, updateData);
  } catch (error) {
    logError("Error updating product:", error);
    throw error;
  }
};

// Create new price for existing product
export const createPriceForProduct = async ({
  productId,
  unitAmount,
  currency = DEFAULT_CURRENCY,
  interval = DEFAULT_INTERVAL,
  metadata = {},
}) => {
  try {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency: currency.toLowerCase(),
      recurring: { interval },
      metadata,
    });

    return price;
  } catch (error) {
    logError("Error creating price:", error);
    throw new Error("Failed to create price in Stripe");
  }
};

// Archive price
export const archiveStripePrice = async (priceId) => {
  try {
    await stripe.prices.update(priceId, { active: false });
    return true;
  } catch (error) {
    logError(`Error archiving price ${priceId}:`, error);
    throw new Error("Failed to archive price in Stripe");
  }
};

// Create new product and price
export const createStripeProductAndPrice = async ({
  name,
  description = "",
  unitAmount,
  currency = DEFAULT_CURRENCY,
  interval = DEFAULT_INTERVAL,
  metadata = {},
}) => {
  try {
    // Create product in Stripe
    const product = await stripe.products.create({
      name,
      description,
      metadata,
    });

    const price = await createPriceForProduct({
      productId: product.id,
      unitAmount,
      currency,
      interval,
      metadata,
    });

    return {
      productId: product.id,
      priceId: price.id,
      ...price,
    };
  } catch (error) {
    logError("Error creating product/price:", error);
    throw new Error("Failed to create product/price in Stripe");
  }
};

// Create payment intent
export const createStripePaymentIntent = async ({
  amount,
  currency = DEFAULT_CURRENCY,
  customer,
  metadata = {},
}) => {
  try {
    const params = {
      amount,
      currency,
      metadata,
      payment_method_types: ["card"],
      setup_future_usage: customer ? "off_session" : undefined,
    };

    if (customer) params.customer = customer;

    const paymentIntent = await stripe.paymentIntents.create(params);

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    logError("Error creating payment intent:", error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};
