-- ======================================================
-- Transaction Management Stored Procedures
-- Purpose: Handle all transaction-related database operations
-- Access: Restricted to EduConnect_Admin role
-- ======================================================

-- Stored procedure for updating transaction status (for payment gateways)
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS Update_Transaction_Status(
    IN p_admin_id INT,
    IN p_transaction_id VARCHAR(50),
    IN p_status VARCHAR(20),
    IN p_metadata JSON
)
BEGIN
    DECLARE is_admin BOOLEAN;
    
    -- Check if user is EduConnect_Admin
    SELECT COUNT(*) > 0 INTO is_admin
    FROM Users 
    WHERE user_id = p_admin_id AND role = 'EduConnect_Admin';
    
    IF is_admin THEN
        UPDATE Transactions
        SET 
            status = p_status,
            metadata = IF(p_metadata IS NOT NULL, p_metadata, metadata),
            updated_at = CURRENT_TIMESTAMP
        WHERE transaction_id = p_transaction_id;
        
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Transaction not found';
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Only EduConnect_Admin can update transactions';
    END IF;
END //

-- Stored procedure to get transactions for a school (accessible by School_Admin and EduConnect_Admin)
CREATE PROCEDURE IF NOT EXISTS Get_Transactions_For_School(
    IN p_user_id INT,
    IN p_school_id INT
)
BEGIN
    DECLARE user_role VARCHAR(20);
    DECLARE user_school_id INT;
    
    -- Get user role and school ID
    SELECT role, school_id INTO user_role, user_school_id
    FROM Users 
    WHERE user_id = p_user_id;
    
    -- Check permissions
    IF user_role = 'EduConnect_Admin' OR (user_role = 'School_Admin' AND user_school_id = p_school_id) THEN
        SELECT 
            t.transaction_id,
            t.amount,
            t.currency,
            t.payment_method,
            t.payment_gateway,
            t.status,
            t.description,
            t.invoice_number,
            t.billing_cycle,
            t.created_at,
            t.updated_at,
            s.school_name,
            sp.plan_name
        FROM Transactions t
        JOIN Schools s ON t.school_id = s.school_id
        LEFT JOIN Subscription_Plans sp ON t.subscription_plan_id = sp.plan_id
        WHERE t.school_id = p_school_id
        ORDER BY t.created_at DESC;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'You do not have permission to view these transactions';
    END IF;
END //

-- Stored procedure to get transaction details by ID (with permission check)
CREATE PROCEDURE IF NOT EXISTS Get_Transaction_Details(
    IN p_user_id INT,
    IN p_transaction_id VARCHAR(50)
)
BEGIN
    DECLARE user_role VARCHAR(20);
    DECLARE user_school_id INT;
    DECLARE transaction_school_id INT;
    
    -- Get user role and school ID
    SELECT role, school_id INTO user_role, user_school_id
    FROM Users 
    WHERE user_id = p_user_id;
    
    -- Get the school ID for this transaction
    SELECT school_id INTO transaction_school_id
    FROM Transactions
    WHERE transaction_id = p_transaction_id;
    
    -- Check if transaction exists
    IF transaction_school_id IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Transaction not found';
    END IF;
    
    -- Check permissions
    IF user_role = 'EduConnect_Admin' OR (user_role = 'School_Admin' AND user_school_id = transaction_school_id) THEN
        SELECT 
            t.*,
            s.school_name,
            sp.plan_name,
            u.name as created_by_name,
            u.email as created_by_email
        FROM Transactions t
        JOIN Schools s ON t.school_id = s.school_id
        LEFT JOIN Subscription_Plans sp ON t.subscription_plan_id = sp.plan_id
        LEFT JOIN Users u ON t.created_by = u.user_id
        WHERE t.transaction_id = p_transaction_id;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'You do not have permission to view this transaction';
    END IF;
END //

-- Stored procedure to get transaction summary for dashboard
CREATE PROCEDURE IF NOT EXISTS Get_Transaction_Summary(
    IN p_admin_id INT
)
BEGIN
    DECLARE is_admin BOOLEAN;
    
    -- Check if user is EduConnect_Admin
    SELECT COUNT(*) > 0 INTO is_admin
    FROM Users 
    WHERE user_id = p_admin_id AND role = 'EduConnect_Admin';
    
    IF is_admin THEN
        -- Total revenue
        SELECT 
            COUNT(*) as total_transactions,
            SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
            SUM(CASE WHEN status = 'completed' AND billing_cycle = 'monthly' THEN amount ELSE 0 END) as monthly_revenue,
            SUM(CASE WHEN status = 'completed' AND billing_cycle = 'yearly' THEN amount ELSE 0 END) as yearly_revenue,
            SUM(CASE WHEN status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as last_30_days_revenue
        FROM Transactions;
        
        -- Revenue by plan
        SELECT 
            sp.plan_name,
            COUNT(*) as transaction_count,
            SUM(t.amount) as total_amount
        FROM Transactions t
        LEFT JOIN Subscription_Plans sp ON t.subscription_plan_id = sp.plan_id
        WHERE t.status = 'completed'
        GROUP BY sp.plan_name
        ORDER BY total_amount DESC;
        
        -- Recent transactions
        SELECT 
            t.transaction_id,
            t.amount,
            t.currency,
            t.status,
            t.created_at,
            s.school_name,
            sp.plan_name
        FROM Transactions t
        JOIN Schools s ON t.school_id = s.school_id
        LEFT JOIN Subscription_Plans sp ON t.subscription_plan_id = sp.plan_id
        ORDER BY t.created_at DESC
        LIMIT 10;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Only EduConnect_Admin can view transaction summary';
    END IF;
END //

DELIMITER ;
