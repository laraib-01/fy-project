-- Fix collation issues in the database
-- This script ensures all tables use consistent collation (utf8mb4_unicode_ci)

-- 1. Get the current database name
SET @db_name = DATABASE();

-- 2. Create a temporary procedure to fix collation for all tables and columns
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS FixCollation()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tname VARCHAR(255);
    DECLARE cname VARCHAR(255);
    DECLARE ctype VARCHAR(255);
    DECLARE cur1 CURSOR FOR 
        SELECT TABLE_NAME FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = @db_name 
        AND TABLE_TYPE = 'BASE TABLE';
    DECLARE cur2 CURSOR FOR 
        SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = @db_name 
        AND TABLE_NAME = tname 
        AND DATA_TYPE IN ('varchar', 'char', 'text', 'tinytext', 'mediumtext', 'longtext', 'enum');
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur1;
    read_loop: LOOP
        FETCH cur1 INTO tname;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Fix table collation
        SET @sql = CONCAT('ALTER TABLE `', tname, '` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        -- Fix column collations
        SET done = FALSE;
        OPEN cur2;
        col_loop: LOOP
            FETCH cur2 INTO cname, ctype;
            IF done THEN
                SET done = FALSE;
                LEAVE col_loop;
            END IF;

            SET @sql = CONCAT('ALTER TABLE `', tname, '` MODIFY `', cname, '` ', 
                             UPPER(ctype), ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
                             IF(ctype = 'varchar', ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', ''));
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END LOOP col_loop;
        CLOSE cur2;
    END LOOP;
    CLOSE cur1;
    
    -- Fix database collation
    SET @sql = CONCAT('ALTER DATABASE `', @db_name, '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Rebuild views to ensure they use the correct collation
    SET @views = NULL;
    SELECT GROUP_CONCAT(TABLE_NAME) INTO @views 
    FROM information_schema.VIEWS 
    WHERE TABLE_SCHEMA = @db_name;
    
    IF @views IS NOT NULL THEN
        SET @views = CONCAT('DROP VIEW IF EXISTS ', @views);
        PREPARE stmt FROM @views;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- 3. Execute the procedure
CALL FixCollation();

-- 4. Clean up
DROP PROCEDURE IF EXISTS FixCollation;

-- 5. Recreate any necessary views (add them here if needed)
-- For example:
-- CREATE OR REPLACE VIEW View_Active_Transactions AS ...

-- 6. Verify the changes
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME, 
    TABLE_COLLATION 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = @db_name;

SELECT 
    TABLE_SCHEMA,
    TABLE_NAME, 
    COLUMN_NAME,
    COLLATION_NAME
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @db_name 
AND COLLATION_NAME IS NOT NULL
AND COLLATION_NAME != 'utf8mb4_unicode_ci';

-- 7. Fix the stored procedure collation explicitly
DELIMITER //
DROP PROCEDURE IF EXISTS Get_Transaction_Details //
CREATE PROCEDURE Get_Transaction_Details(
    IN p_user_id INT,
    IN p_transaction_id VARCHAR(50)
)
BEGIN
    DECLARE user_role VARCHAR(20) COLLATE utf8mb4_unicode_ci;
    DECLARE user_school_id INT;
    DECLARE transaction_school_id INT;
    
    -- Get user role and school ID
    SELECT role, school_id INTO user_role, user_school_id
    FROM Users 
    WHERE user_id = p_user_id;
    
    -- Get the school ID for this transaction
    SELECT school_id INTO transaction_school_id
    FROM Transactions
    WHERE transaction_id = p_transaction_id COLLATE utf8mb4_unicode_ci;
    
    -- Check if transaction exists
    IF transaction_school_id IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Transaction not found';
    END IF;
    
    -- Check permissions
    IF user_role = 'EduConnect_Admin' COLLATE utf8mb4_unicode_ci 
       OR (user_role = 'School_Admin' COLLATE utf8mb4_unicode_ci AND user_school_id = transaction_school_id) 
    THEN
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
        WHERE t.transaction_id = p_transaction_id COLLATE utf8mb4_unicode_ci;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'You do not have permission to view this transaction';
    END IF;
END //
DELIMITER ;
