-- ======================================================
-- EduConnect SQL Schema (With Comments for Newbies)
-- Purpose: Manage a school information system with users, classes,
-- students, attendance, assignments, events, performance, etc.
-- ======================================================


-- 1. SCHOOLS: Stores basic info about each school
CREATE TABLE IF NOT EXISTS Schools (
  school_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique ID for each school, auto-generated
  school_name VARCHAR(100) NOT NULL,        -- Name of the school, cannot be empty
  address VARCHAR(255),                     -- School address (optional)
  contact_number VARCHAR(15),               -- Contact number of the school (optional)
  email VARCHAR(100),                       -- Email of the school (optional)
  admin_name VARCHAR(100),                  -- Name of the school admin 
  admin_email VARCHAR(100),                 -- Email of the school admin
  stripe_customer_id VARCHAR(255),          -- Stripe customer ID (optional)
  has_active_subscription BOOLEAN DEFAULT FALSE -- Whether the school has an active subscription (optional)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. USERS: All user accounts (Admins, Teachers, Parents)
CREATE TABLE IF NOT EXISTS Users (
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique user ID
  school_id INT,                                      -- Links user to a school
  role ENUM('EduConnect_Admin', 'School_Admin', 'Teacher', 'Parent') NOT NULL,  -- User's role
  name VARCHAR(100) NOT NULL,                         -- Full name
  email VARCHAR(100) UNIQUE NOT NULL,                 -- Must be unique for login
  password VARCHAR(255) NOT NULL,                     -- Hashed password (DO NOT store raw text)
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  FOREIGN KEY (school_id) REFERENCES Schools(school_id) -- Link to school
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;;

-- 3. PARENTS: Stores parent-specific information
CREATE TABLE IF NOT EXISTS Parents (
  parent_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  school_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE,
  INDEX idx_parent_email (email),
  INDEX idx_parent_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SUBSCRIPTION_PLANS: Defines the details of available subscription plans
CREATE TABLE IF NOT EXISTS Subscription_Plans (
  plan_id INT AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(50) NOT NULL,           -- e.g., 'Basic', 'Standard', 'Premium'
  description TEXT,                         -- Description of the plan
  monthly_price DECIMAL(10,2) NOT NULL,     -- Monthly price in USD
  yearly_price DECIMAL(10,2) NOT NULL,      -- Yearly price in USD (discounted)
  max_teachers INT,                         -- NULL means unlimited
  max_parents INT,                          -- NULL means unlimited
  features TEXT,                            -- JSON array of features
  stripe_monthly_product_id VARCHAR(255),   -- Stripe product ID for monthly plan
  stripe_monthly_price_id VARCHAR(255),     -- Stripe price ID for monthly plan
  stripe_yearly_product_id VARCHAR(255),    -- Stripe product ID for yearly plan
  stripe_yearly_price_id VARCHAR(255),      -- Stripe price ID for yearly plan
  currency VARCHAR(3) DEFAULT 'USD',        -- Currency (default USD)
  is_active BOOLEAN DEFAULT TRUE,           -- Whether the plan is available for subscription
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CLASSES: Represents a class/section under a teacher
CREATE TABLE IF NOT EXISTS Classes (
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  class_id INT AUTO_INCREMENT PRIMARY KEY,            -- Unique class ID
  school_id INT NOT NULL,                             -- School this class belongs to
  teacher_id INT,                                     -- Teacher responsible for this class
  class_name VARCHAR(50) NOT NULL,                    -- E.g., "Grade 5 - A"
  FOREIGN KEY (school_id) REFERENCES Schools(school_id),
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. STUDENTS: Students enrolled in a class
CREATE TABLE IF NOT EXISTS Students (
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  student_id INT AUTO_INCREMENT PRIMARY KEY,          -- Unique ID for each student
  class_id INT NOT NULL,                              -- Class the student is assigned to
  roll_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(50) NOT NULL,                    -- Student's first name
  last_name VARCHAR(50) NOT NULL,                     -- Student's last name
  date_of_birth DATE,                                 -- Date of birth
  gender ENUM('Male', 'Female', 'Other'),             -- Gender, optional
  address VARCHAR(255),                               -- Address, optional
  phone_number VARCHAR(15),                           -- Phone number, optional
  enrollment_date DATE,                               -- Enrollment date, optional
  parent_id INT,                                      -- Direct link to primary parent
  FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES Parents(parent_id) ON DELETE SET NULL,
  INDEX idx_students_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TEACHERS: Stores teacher-specific information
CREATE TABLE IF NOT EXISTS Teachers (
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  name VARCHAR(100) NOT NULL,
  teacher_id INT PRIMARY KEY,                             -- References user_id from Users table
  class_id INT NOT NULL,
  qualification VARCHAR(100),                             -- Teacher's qualification
  specialization VARCHAR(100),                           -- Subject/Area of specialization
  joining_date DATE NOT NULL,                            -- Date when teacher joined the school
  status ENUM('Active', 'On Leave', 'Inactive') NOT NULL DEFAULT 'Active',
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. EVENTS: Upcoming or past school events
CREATE TABLE IF NOT EXISTS Events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,            -- Event ID
  school_id INT NOT NULL,                             -- Which school is hosting
  event_name VARCHAR(100),                            -- Title of the event
  event_date DATE,                                    -- Date it occurs
  event_location VARCHAR(255),                        -- Where it occurs
  event_time TIME,                                    -- Time it occurs
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  description TEXT,                                   -- What it's about
  FOREIGN KEY (school_id) REFERENCES Schools(school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SUBSCRIPTIONS: Tracks schools' plan and payment
CREATE TABLE IF NOT EXISTS Subscriptions (
  subscription_id INT AUTO_INCREMENT PRIMARY KEY,     -- Unique subscription ID
  school_id INT NOT NULL,                             -- Which school
  plan_id INT NOT NULL,                               -- Which plan
  plan_type ENUM('Basic', 'Premium', 'Enterprise') NOT NULL, -- Plan tier
  billing_cycle ENUM('Monthly', 'Yearly') NOT NULL,   -- Billing cycle
  start_date DATE,                                    -- When it starts
  end_date DATE,                                      -- When it ends
  status ENUM('Pending', 'Active', 'Cancelled', 'Expired', 'Failed') NOT NULL DEFAULT 'Pending', -- Status of subscription
  payment_status ENUM('Succeeded', 'Failed', 'Pending') NOT NULL DEFAULT 'Pending', -- Payment status
  transaction_id VARCHAR(255),                        -- Payment reference
  stripe_subscription_id VARCHAR(255),                -- Stripe subscription ID
  stripe_customer_id VARCHAR(255),                    -- Stripe customer ID
  payment_method_id VARCHAR(255),                     -- Payment method ID
  amount DECIMAL(10,2),                               -- Amount paid
  currency VARCHAR(3) DEFAULT 'USD',                  -- Currency (default USD)
  stripe_payment_intent_id VARCHAR(255),               -- Stripe payment intent ID
  stripe_invoice_id VARCHAR(255),                      -- Stripe invoice ID
  last_payment_date DATETIME,                         -- When the last payment was made
  next_payment_date DATETIME,                         -- When the next payment is due
  cancel_at_period_end BOOLEAN DEFAULT FALSE,         -- Whether to cancel at period end
  cancel_reason TEXT,                                 -- Reason for cancellation
  failure_reason TEXT,                                -- Reason for failure if status is Failed
  metadata JSON,                                      -- Additional metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- When the subscription was created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- When the subscription was last updated
  FOREIGN KEY (school_id) REFERENCES Schools(school_id),
  FOREIGN KEY (plan_id) REFERENCES Subscription_Plans(plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TRANSACTIONS: Track all payment transactions in the system
CREATE TABLE IF NOT EXISTS Transactions (
  transaction_id VARCHAR(50) PRIMARY KEY,          -- Unique transaction ID (can be from payment gateway)
  school_id INT NOT NULL,                         -- School making the payment
  subscription_plan_id INT,                        -- Reference to subscription plan (if applicable)
  amount DECIMAL(10, 2) NOT NULL,                 -- Transaction amount
  currency VARCHAR(3) DEFAULT 'USD',               -- Currency code (USD, EUR, etc.)
  payment_method VARCHAR(50) NOT NULL,            -- Credit Card, Bank Transfer, etc.
  payment_gateway VARCHAR(50),                    -- Stripe, PayPal, etc.
  gateway_transaction_id VARCHAR(100),            -- Transaction ID from payment gateway
  status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') NOT NULL,
  description TEXT,                               -- Description of the transaction
  invoice_number VARCHAR(50),                     -- Invoice number for reference
  billing_cycle ENUM('monthly', 'yearly'),        -- Billing cycle for subscription payments
  metadata JSON,                                  -- Additional metadata in JSON format
  created_by INT NOT NULL,                        -- User who initiated the transaction
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the transaction was created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update timestamp
  FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_plan_id) REFERENCES Subscription_Plans(plan_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PARENT_STUDENT_LINKS: Which parent is linked to which student
CREATE TABLE IF NOT EXISTS Parent_Student_Links (
  parent_user_id INT NOT NULL,                        -- User ID of parent (retained for migration)
  parent_id INT NOT NULL,                            -- Parent ID from Parents table
  student_id INT NOT NULL,                            -- Student ID
  PRIMARY KEY (parent_id, student_id),                -- Composite key: one parent can link to many students
  FOREIGN KEY (parent_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES Parents(parent_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. ATTENDANCE: Daily attendance marked by teachers
CREATE TABLE IF NOT EXISTS Attendance (
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  student_id INT NOT NULL,                            -- Who was marked
  attendance_date DATE NOT NULL,                      -- When attendance was taken
  status ENUM('Present', 'Absent', 'Late') NOT NULL,  -- Attendance status
  teacher_id INT NOT NULL,                            -- Who marked the attendance
  PRIMARY KEY (student_id, attendance_date),          -- Prevent duplicate entries
  FOREIGN KEY (student_id) REFERENCES Students(student_id),
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. ASSIGNMENTS: Work given to a class by a teacher
CREATE TABLE IF NOT EXISTS Assignments (
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique ID
  teacher_id INT NOT NULL,                            -- Who assigned it
  class_id INT NOT NULL,                              -- Which class it's for
  title VARCHAR(255) NOT NULL,                        -- Assignment title
  description TEXT,                                   -- Optional details
  due_date DATE,                                      -- Deadline
  points INT NOT NULL,                                -- Points for the assignment
  status ENUM('Draft', 'Active', 'Completed') NOT NULL DEFAULT 'Draft', -- Assignment status
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id),
  FOREIGN KEY (class_id) REFERENCES Classes(class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. ASSIGNMENT_SUBMISSIONS: Tracks who submitted what and when
CREATE TABLE IF NOT EXISTS Assignment_Submissions (
  submission_id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique ID
  assignment_id INT NOT NULL,                         -- The assignment
  student_id INT NOT NULL,                            -- The student
  submission_date DATE,                               -- When it was submitted
  status ENUM('Submitted', 'Not Submitted') NOT NULL,
  FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id),
  FOREIGN KEY (student_id) REFERENCES Students(student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. PERFORMANCE: Subject grades and feedback per student
CREATE TABLE IF NOT EXISTS Performance (
  performance_id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique record ID
  student_id INT NOT NULL,                            -- Who it's for
  teacher_id INT NOT NULL,                            -- Teacher who graded
  subject VARCHAR(50),                                -- Subject name
  grade VARCHAR(2),                                   -- Grade, e.g., "A+"
  remarks TEXT,                                       -- Optional teacher comments
  FOREIGN KEY (student_id) REFERENCES Students(student_id),
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. EVENT_NOTIFICATIONS: Notices sent about events
CREATE TABLE IF NOT EXISTS Event_Notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,     -- Unique ID
  event_id INT NOT NULL,                              -- Related event
  recipient_role ENUM('Teacher', 'Parent', 'Student'),-- Who gets the notification
  message TEXT,                                       -- Message content
  notification_date DATE,                             -- When it was sent
  FOREIGN KEY (event_id) REFERENCES Events(event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- PERFORMANCE INDEXES (for faster queries)
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_attendance_student ON Attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher ON Attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assign ON Assignment_Submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON Assignment_Submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_perf_student ON Performance(student_id);
CREATE INDEX IF NOT EXISTS idx_perf_teacher ON Performance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_users_school ON Users(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON Classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_school ON Classes(school_id);
CREATE INDEX IF NOT EXISTS idx_transactions_school_id ON Transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON Transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON Transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_stripe_monthly_price_id ON Subscription_Plans(stripe_monthly_price_id);
CREATE INDEX IF NOT EXISTS idx_stripe_yearly_price_id ON Subscription_Plans(stripe_yearly_price_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_link ON Parent_Student_Links(parent_id, student_id);

-- ======================================================
-- USEFUL VIEWS (for reports and dashboards)
-- ======================================================

-- View 1: Attendance per student
CREATE VIEW IF NOT EXISTS View_Student_Attendance AS
SELECT 
  s.first_name AS student_name,
  a.attendance_date,
  a.status
FROM Students s
JOIN Attendance a ON s.student_id = a.student_id;

-- View 2: Grades per subject
CREATE VIEW IF NOT EXISTS View_Student_Performance AS
SELECT 
  s.first_name AS student_name,
  p.subject,
  p.grade
FROM Students s
JOIN Performance p ON s.student_id = p.student_id;

-- View 3: Assignment submissions
CREATE VIEW IF NOT EXISTS View_Assignment_Submissions AS
SELECT 
  s.first_name AS student_name,
  a.title AS assignment_title,
  sub.status AS submission_status
FROM Students s
JOIN Assignment_Submissions sub ON s.student_id = sub.student_id
JOIN Assignments a ON sub.assignment_id = a.assignment_id;

-- View 4: Active subscription plans
CREATE VIEW IF NOT EXISTS View_Active_Subscription_Plans AS
SELECT * FROM Subscription_Plans WHERE is_active = TRUE;

-- View 5: Active transactions (completed payments)
CREATE VIEW IF NOT EXISTS View_Active_Transactions AS
SELECT * FROM Transactions WHERE status = 'completed';

-- Note: Update existing plans with Stripe price IDs manually
-- UPDATE Subscription_Plans 
-- SET stripe_monthly_price_id = 'price_xxx', 
--     stripe_yearly_price_id = 'price_yyy',
--     currency = 'USD'
-- WHERE plan_id = [plan_id];

-- ======================================================
-- INSERT SAMPLE DATA
-- ======================================================

-- -- 1. Schools Table
-- INSERT INTO Schools (school_name, address, contact_number, email, admin_name, admin_email) VALUES
-- ('Greenwood Academy', '123 Oak Ave, Cityville', '111-222-3333', 'info.greenwood@example.com', 'Misher Mubarik', 'mishermubarik01@gmail.com'),
-- ('Riverside High School', '456 River Rd, Townsville', '444-555-6666', 'contact@riverside.edu', 'Brenda SchoolAdmin', 'brenda.admin@riverside.edu'),
-- ('Bright Minds Elementary', '789 Pine Ln, Villageton', '777-888-9999', 'admin@brightminds.org', 'Carol White', 'carol.teacher@greenwood.com'),
-- ('Elite Scholars College', '101 University Dr, Metro City', '000-111-2222', 'admissions@elitescholars.net', 'David Brown', 'david.teacher@greenwood.com'),
-- ('Beacon Learning Center', '202 Light St, Suburbia', '333-444-5555', 'support@beacon.school', 'Eve Green', 'eve.teacher@riverside.edu');

-- -- 2. Users Table
-- INSERT INTO Users (school_id, role, name, email, password) VALUES
-- (NULL, 'EduConnect_Admin', 'Misher Mubarik', 'mishermubarik01@gmail.com', 'misher123'),
-- (NULL, 'EduConnect_Admin', 'Sadia Mehmood', 'saadianasir1001@gmail.com', 'sadia123'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'School_Admin', 'Alex SchoolAdmin', 'alex.admin@greenwood.com', 'greenwoodadmin'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'School_Admin', 'Brenda SchoolAdmin', 'brenda.admin@riverside.edu', 'riversideadmin'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Teacher', 'Carol White', 'carol.teacher@greenwood.com', 'teacherpass1'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Teacher', 'David Brown', 'david.teacher@greenwood.com', 'teacherpass2'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'Teacher', 'Eve Green', 'eve.teacher@riverside.edu', 'teacherpass3'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Parent', 'Frank Black', 'frank.parent@greenwood.com', 'parentpass1'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Parent', 'Grace Lee', 'grace.parent@greenwood.com', 'parentpass2'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'Parent', 'Henry Kim', 'henry.parent@riverside.edu', 'parentpass3');

-- -- 3. Parents Table
-- INSERT INTO Parents (
--   user_id, 
--   school_id, 
--   first_name, 
--   last_name, 
--   email, 
--   phone_number, 
--   gender, 
--   address
-- ) VALUES
-- ((SELECT user_id FROM Users WHERE email = 'frank.parent@greenwood.com'), 
--  (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 
--  'Frank', 'Black', 'frank.parent@greenwood.com', '123-456-7890', 'male', '123 Oak Ave, Cityville'),
-- ((SELECT user_id FROM Users WHERE email = 'grace.parent@greenwood.com'), 
--  (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 
--  'Grace', 'Lee', 'grace.parent@greenwood.com', '123-456-7891', 'female', '124 Oak Ave, Cityville'),
-- ((SELECT user_id FROM Users WHERE email = 'henry.parent@riverside.edu'), 
--  (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 
--  'Henry', 'Kim', 'henry.parent@riverside.edu', '123-456-7892', 'male', '456 River Rd, Townsville');

-- -- 4. Subscription_Plans Table
-- INSERT INTO Subscription_Plans 
-- (plan_name, description, monthly_price, yearly_price, max_teachers, max_parents, features, is_active) 
-- VALUES 
-- ('Basic', 'Basic plan with limited features', 29.99, 299.00, 10, 50, 
--  '["10 Teachers", "50 Parents", "Basic Support", "Email Support", "Basic Analytics"]', 
--  TRUE),
-- ('Standard', 'Standard plan with additional features', 59.99, 599.00, 25, 150, 
--  '["25 Teachers", "150 Parents", "Priority Support", "Email & Phone Support", "Advanced Analytics", "Custom Reports"]', 
--  TRUE),
-- ('Premium', 'Premium plan with all features', 99.99, 999.00, NULL, NULL, 
--  '["Unlimited Teachers", "Unlimited Parents", "24/7 Premium Support", "Dedicated Account Manager", "Advanced Analytics", "Custom Reports", "API Access"]', 
--  TRUE);

-- -- 5. Classes Table
-- INSERT INTO Classes (school_id, teacher_id, class_name) VALUES
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), '5th Grade A'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), '5th Grade B'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com'), '6th Grade Science'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'Math 101'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'English Lit'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary'), NULL, '3rd Grade C');

-- -- 6. Students Table
-- INSERT INTO Students (class_id, roll_number, first_name, last_name, date_of_birth, parent_id) VALUES
-- ((SELECT class_id FROM Classes WHERE class_name = '5th Grade A' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'GWA001', 'Liam', 'Davis', '2014-03-15', (SELECT parent_id FROM Parents WHERE email = 'frank.parent@greenwood.com')),
-- ((SELECT class_id FROM Classes WHERE class_name = '5th Grade A' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'GWA002', 'Olivia', 'Martinez', '2014-07-22', (SELECT parent_id FROM Parents WHERE email = 'frank.parent@greenwood.com')),
-- ((SELECT class_id FROM Classes WHERE class_name = '6th Grade Science' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'GWA003', 'Noah', 'Wilson', '2013-11-01', (SELECT parent_id FROM Parents WHERE email = 'grace.parent@greenwood.com')),
-- ((SELECT class_id FROM Classes WHERE class_name = 'Math 101' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'RHS001', 'Emma', 'Taylor', '2012-09-10', (SELECT parent_id FROM Parents WHERE email = 'henry.parent@riverside.edu')),
-- ((SELECT class_id FROM Classes WHERE class_name = 'English Lit' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'RHS002', 'Sophia', 'Anderson', '2012-05-20', (SELECT parent_id FROM Parents WHERE email = 'henry.parent@riverside.edu')),
-- ((SELECT class_id FROM Classes WHERE class_name = '5th Grade B' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'GWA004', 'James', 'Miller', '2014-01-25', (SELECT parent_id FROM Parents WHERE email = 'frank.parent@greenwood.com'));

-- -- 7. Teachers Table
-- INSERT INTO Teachers (name, teacher_id, class_id, qualification, specialization, joining_date, status) VALUES
-- ('Carol White', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '5th Grade A'), 'M.Ed.', 'Mathematics', '2020-08-01', 'Active'),
-- ('Carol White', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '5th Grade B'), 'M.Ed.', 'Mathematics', '2020-08-01', 'Active'),
-- ('David Brown', (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '6th Grade Science'), 'M.Sc.', 'Science', '2019-09-01', 'Active'),
-- ('Eve Green', (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), (SELECT class_id FROM Classes WHERE class_name = 'Math 101'), 'B.Ed.', 'Mathematics', '2021-07-01', 'Active'),
-- ('Eve Green', (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), (SELECT class_id FROM Classes WHERE class_name = 'English Lit'), 'B.Ed.', 'English', '2021-07-01', 'Active');

-- -- 8. Events Table
-- INSERT INTO Events (school_id, event_name, event_date, event_location, event_time, description) VALUES
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Annual Sports Day', '2025-06-10', 'School Field', '09:00:00', 'Join us for a day of sports and fun activities!'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Parent-Teacher Meeting', '2025-06-15', 'Main Hall', '10:00:00', 'Scheduled one-on-one meetings with teachers.'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'School Carnival', '2025-07-01', 'School Grounds', '11:00:00', 'Games, food, and prizes for all ages.'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary'), 'Science Fair', '2025-06-20', 'Science Lab', '10:00:00', 'Showcasing student science projects.'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Summer Camp Enrollment', '2025-05-28', 'Admin Office', '08:00:00', 'Enrollment for summer camp programs.'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'Graduation Ceremony', '2025-07-15', 'Auditorium', '14:00:00', 'Celebrating our graduating class of 2025.');

-- -- 9. Subscriptions Table
-- INSERT INTO Subscriptions (school_id, plan_id, plan_type, start_date, end_date, status, payment_status, transaction_id) VALUES
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Premium'), 'Premium', '2024-09-01', '2025-08-31', 'Active', 'Paid', 'TRANS12345'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Basic'), 'Basic', '2024-10-15', '2025-10-14', 'Active', 'Paid', 'TRANS67890'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Enterprise'), 'Enterprise', '2025-01-01', '2025-12-31', 'Active', 'Paid', 'TRANSABCDE'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Elite Scholars College'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Premium'), 'Premium', '2024-03-01', '2025-02-28', 'Expired', 'Paid', 'TRANSFGHIJ'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Beacon Learning Center'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Basic'), 'Basic', '2025-05-01', '2026-04-30', 'Active', 'Unpaid', 'PENDING123'),
-- ((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Basic'), 'Basic', '2023-09-01', '2024-08-31', 'Expired', 'Paid', 'TRANSOLD45');

-- -- 10. Transactions Table
-- INSERT INTO Transactions (transaction_id, school_id, subscription_plan_id, amount, payment_method, status, description, created_by) VALUES
-- ('TRANS12345', (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Premium'), 999.00, 'Credit Card', 'completed', 'Premium plan yearly subscription', (SELECT user_id FROM Users WHERE email = 'alex.admin@greenwood.com')),
-- ('TRANS67890', (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Basic'), 299.00, 'Credit Card', 'completed', 'Basic plan yearly subscription', (SELECT user_id FROM Users WHERE email = 'brenda.admin@riverside.edu')),
-- ('TRANSABCDE', (SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Enterprise'), 1999.00, 'Bank Transfer', 'completed', 'Enterprise plan yearly subscription', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')),
-- ('TRANSFGHIJ', (SELECT school_id FROM Schools WHERE school_name = 'Elite Scholars College'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Premium'), 999.00, 'Credit Card', 'completed', 'Premium plan yearly subscription', (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com')),
-- ('PENDING123', (SELECT school_id FROM Schools WHERE school_name = 'Beacon Learning Center'), (SELECT plan_id FROM Subscription_Plans WHERE plan_name = 'Basic'), 29.99, 'Credit Card', 'pending', 'Basic plan monthly subscription', (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'));

-- -- 11. Parent_Student_Links Table
-- INSERT INTO Parent_Student_Links (parent_id, student_id) VALUES
-- ((SELECT parent_id FROM Parents WHERE email = 'frank.parent@greenwood.com'), (SELECT student_id FROM Students WHERE first_name = 'Liam' AND last_name = 'Davis')),
-- ((SELECT parent_id FROM Parents WHERE email = 'frank.parent@greenwood.com'), (SELECT student_id FROM Students WHERE first_name = 'Olivia' AND last_name = 'Martinez')),
-- ((SELECT parent_id FROM Parents WHERE email = 'grace.parent@greenwood.com'), (SELECT student_id FROM Students WHERE first_name = 'Olivia' AND last_name = 'Martinez')),
-- ((SELECT parent_id FROM Parents WHERE email = 'henry.parent@riverside.edu'), (SELECT student_id FROM Students WHERE first_name = 'Emma' AND last_name = 'Taylor')),
-- ((SELECT parent_id FROM Parents WHERE email = 'henry.parent@riverside.edu'), (SELECT student_id FROM Students WHERE first_name = 'Sophia' AND last_name = 'Anderson')),
-- ((SELECT parent_id FROM Parents WHERE email = 'frank.parent@greenwood.com'), (SELECT student_id FROM Students WHERE first_name = 'James' AND last_name = 'Miller'));

-- -- 12. Attendance Table
-- INSERT INTO Attendance (student_id, attendance_date, status, teacher_id) VALUES
-- ((SELECT student_id FROM Students WHERE first_name = 'Liam' AND last_name = 'Davis'), '2025-05-20', 'Present', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')),
-- ((SELECT student_id FROM Students WHERE first_name = 'Olivia' AND last_name = 'Martinez'), '2025-05-20', 'Absent', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')),
-- ((SELECT student_id FROM Students WHERE first_name = 'Noah' AND last_name = 'Wilson'), '2025-05-20', 'Present', (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com')),
-- ((SELECT student_id FROM Students WHERE first_name = 'Emma' AND last_name = 'Taylor'), '2025-05-20', 'Present', (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')),
-- ((SELECT student_id FROM Students WHERE first_name = 'Sophia' AND last_name = 'Anderson'), '2025-05-20', 'Absent', (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')),
-- ((SELECT student_id FROM Students WHERE first_name = 'Liam' AND last_name = 'Davis'), '2025-05-21', 'Present', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'));

-- -- 13. Assignments Table
-- INSERT INTO Assignments (teacher_id, class_id, title, description, due_date, points, status) VALUES
-- ((SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '5th Grade A' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Math Homework Ch 5', 'Complete exercises on fractions.', '2025-05-25', 100, 'Active'),
-- ((SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '5th Grade B' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Science Project Outline', 'Outline for volcano project.', '2025-06-01', 150, 'Active'),
-- ((SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '6th Grade Science' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Biology Lab Report', 'Experiment on plant growth.', '2025-05-28', 200, 'Active'),
-- ((SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), (SELECT class_id FROM Classes WHERE class_name = 'Math 101' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Algebra Quiz Prep', 'Review chapters 1-3.', '2025-05-26', 50, 'Active'),
-- ((SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), (SELECT class_id FROM Classes WHERE class_name = 'English Lit' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Essay: Romeo & Juliet', 'Analyze themes in Act 3.', '2025-06-05', 100, 'Active');

-- -- 14. Assignment_Submissions Table
-- INSERT INTO Assignment_Submissions (assignment_id, student_id, submission_date, status) VALUES
-- ((SELECT assignment_id FROM Assignments WHERE title = 'Math Homework Ch 5' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE first_name = 'Liam' AND last_name = 'Davis'), '2025-05-24', 'Submitted'),
-- ((SELECT assignment_id FROM Assignments WHERE title = 'Math Homework Ch 5' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE first_name = 'Olivia' AND last_name = 'Martinez'), NULL, 'Not Submitted'),
-- ((SELECT assignment_id FROM Assignments WHERE title = 'Science Project Outline' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE first_name = 'James' AND last_name = 'Miller'), '2025-05-23', 'Submitted'),
-- ((SELECT assignment_id FROM Assignments WHERE title = 'Biology Lab Report' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE first_name = 'Noah' AND last_name = 'Wilson'), '2025-05-27', 'Submitted'),
-- ((SELECT assignment_id FROM Assignments WHERE title = 'Algebra Quiz Prep' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')), (SELECT student_id FROM Students WHERE first_name = 'Emma' AND last_name = 'Taylor'), '2025-05-24', 'Submitted'),
-- ((SELECT assignment_id FROM Assignments WHERE title = 'Essay: Romeo & Juliet' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')), (SELECT student_id FROM Students WHERE first_name = 'Sophia' AND last_name = 'Anderson'), NULL, 'Not Submitted');

-- -- 15. Performance Table
-- INSERT INTO Performance (student_id, teacher_id, subject, grade, remarks) VALUES
-- ((SELECT student_id FROM Students WHERE first_name = 'Liam' AND last_name = 'Davis'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), 'Mathematics', 'A', 'Excellent understanding of concepts.'),
-- ((SELECT student_id FROM Students WHERE first_name = 'Olivia' AND last_name = 'Martinez'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), 'Mathematics', 'C+', 'Needs to improve on problem-solving.'),
-- ((SELECT student_id FROM Students WHERE first_name = 'Noah' AND last_name = 'Wilson'), (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com'), 'Science', 'B', 'Good effort in practicals.'),
-- ((SELECT student_id FROM Students WHERE first_name = 'Emma' AND last_name = 'Taylor'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'Mathematics', 'A-', 'Consistently high performance.'),
-- ((SELECT student_id FROM Students WHERE first_name = 'Sophia' AND last_name = 'Anderson'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'English', 'B+', 'Shows good analytical skills in essays.'),
-- ((SELECT student_id FROM Students WHERE first_name = 'James' AND last_name = 'Miller'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), 'Science', 'A', 'Very thorough project outline.');

-- -- 16. Event_Notifications Table
-- INSERT INTO Event_Notifications (event_id, recipient_role, message, notification_date) VALUES
-- ((SELECT event_id FROM Events WHERE event_name = 'Annual Sports Day' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Parent', 'Reminder: Annual Sports Day is on June 10th!', '2025-05-23'),
-- ((SELECT event_id FROM Events WHERE event_name = 'Parent-Teacher Meeting' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Parent', 'Sign up for PTM slots by June 10.', '2025-05-22'),
-- ((SELECT event_id FROM Events WHERE event_name = 'School Carnival' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Teacher', 'Volunteers needed for School Carnival setup.', '2025-05-21'),
-- ((SELECT event_id FROM Events WHERE event_name = 'Science Fair' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary')), 'Parent', 'Come and support our young scientists at the Science Fair!', '2025-05-20'),
-- ((SELECT event_id FROM Events WHERE event_name = 'Summer Camp Enrollment' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Parent', 'Summer Camp enrollment opens on May 28th.', '2025-05-25');