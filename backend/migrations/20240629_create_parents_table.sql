-- Create Parents table to store parent-specific information
CREATE TABLE IF NOT EXISTS `Parents` (
  `parent_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `school_id` INT NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone_number` VARCHAR(20) NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON DELETE CASCADE,
  INDEX `idx_parent_email` (`email`),
  INDEX `idx_parent_phone` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update the Parent_Student_Links table to reference the new Parents table
ALTER TABLE `Parent_Student_Links` 
ADD COLUMN `parent_id` INT NULL AFTER `parent_user_id`,
ADD FOREIGN KEY (`parent_id`) REFERENCES `Parents`(`parent_id`) ON DELETE CASCADE;

-- Migrate existing parent data from Users to Parents table
-- This is a one-time migration for existing data
INSERT INTO `Parents` (
  `user_id`, 
  `school_id`, 
  `first_name`, 
  `last_name`, 
  `email`, 
  `phone_number`, 
  `gender`, 
  `address`,
  `created_at`,
  `updated_at`
)
SELECT 
  u.user_id,
  u.school_id,
  SUBSTRING_INDEX(u.name, ' ', 1) as first_name,
  SUBSTRING_INDEX(u.name, ' ', -1) as last_name,
  u.email,
  u.phone_number,
  u.gender,
  u.address,
  u.created_at,
  u.updated_at
FROM `Users` u
WHERE u.role = 'Parent';

-- Update Parent_Student_Links with the new parent_id
UPDATE `Parent_Student_Links` psl
JOIN `Parents` p ON psl.parent_user_id = p.user_id
SET psl.parent_id = p.parent_id
WHERE psl.parent_id IS NULL;

-- Make parent_id required after migration
ALTER TABLE `Parent_Student_Links`
MODIFY COLUMN `parent_id` INT NOT NULL,
DROP FOREIGN KEY `parent_student_links_ibfk_1`;  -- Drop the old foreign key

-- Add new foreign key constraint
ALTER TABLE `Parent_Student_Links`
ADD CONSTRAINT `fk_parent_student_links_parents` 
FOREIGN KEY (`parent_id`) REFERENCES `Parents`(`parent_id`) ON DELETE CASCADE;

-- Drop the old parent_user_id column after migration is complete
-- ALTER TABLE `Parent_Student_Links`
-- DROP COLUMN `parent_user_id`;  -- Uncomment this line after verifying the migration

-- Add indexes for better query performance
CREATE INDEX `idx_parent_student_link` ON `Parent_Student_Links` (`parent_id`, `student_id`);

-- Add triggers to keep Users and Parents in sync
DELIMITER //
CREATE TRIGGER after_parent_insert
AFTER INSERT ON `Parents`
FOR EACH ROW
BEGIN
    UPDATE `Users` 
    SET role = 'Parent',
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
END//

CREATE TRIGGER after_parent_delete
AFTER DELETE ON `Parents`
FOR EACH ROW
BEGIN
    DELETE FROM `Users` WHERE user_id = OLD.user_id;
END//
DELIMITER ;
