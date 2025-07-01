-- Add reset token columns to Users table
ALTER TABLE Users
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expires DATETIME NULL,
ADD INDEX idx_reset_token (reset_token);

-- Add a comment to document the change
ALTER TABLE Users 
COMMENT 'Added reset_token and reset_token_expires for password reset functionality';
