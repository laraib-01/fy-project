-- Add new columns to Subscription_Plans table
ALTER TABLE Subscription_Plans
ADD COLUMN description TEXT AFTER plan_name,
ADD COLUMN stripe_monthly_price_id VARCHAR(255) AFTER features,
ADD COLUMN stripe_yearly_price_id VARCHAR(255) AFTER stripe_monthly_price_id,
ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' AFTER stripe_yearly_price_id,
MODIFY COLUMN is_active BOOLEAN DEFAULT TRUE AFTER currency;

-- Add indexes for better query performance
CREATE INDEX idx_stripe_monthly_price_id ON Subscription_Plans(stripe_monthly_price_id);
CREATE INDEX idx_stripe_yearly_price_id ON Subscription_Plans(stripe_yearly_price_id);

-- Update existing plans with default values if needed
-- Note: You'll need to manually set the stripe price IDs for existing plans in Stripe
-- and then update them in the database using queries like:
-- UPDATE Subscription_Plans 
-- SET stripe_monthly_price_id = 'price_xxx', 
--     stripe_yearly_price_id = 'price_yyy',
--     currency = 'USD'
-- WHERE plan_id = [plan_id];
