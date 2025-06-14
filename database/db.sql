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
  admin_email VARCHAR(100)                  -- Email of the school admin
);


-- 2. USERS: All user accounts (Admins, Teachers, Parents)
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique user ID
  school_id INT,                                      -- Links user to a school
  role ENUM('EduConnect_Admin', 'School_Admin', 'Teacher', 'Parent') NOT NULL,  -- User's role
  name VARCHAR(100) NOT NULL,                         -- Full name
  email VARCHAR(100) UNIQUE NOT NULL,                 -- Must be unique for login
  password VARCHAR(255) NOT NULL,                     -- Hashed password (DO NOT store raw text)
  FOREIGN KEY (school_id) REFERENCES Schools(school_id) -- Link to school
);


-- 3. CLASSES: Represents a class/section under a teacher
CREATE TABLE IF NOT EXISTS Classes (
  class_id INT AUTO_INCREMENT PRIMARY KEY,            -- Unique class ID
  school_id INT NOT NULL,                             -- School this class belongs to
  teacher_id INT,                                     -- Teacher responsible for this class
  class_name VARCHAR(50) NOT NULL,                    -- E.g., "Grade 5 - A"
  FOREIGN KEY (school_id) REFERENCES Schools(school_id),
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
);

-- 4. STUDENTS: Students enrolled in a class
CREATE TABLE IF NOT EXISTS Students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,          -- Unique ID for each student
  class_id INT NOT NULL,                              -- Class the student is assigned to
  name VARCHAR(100) NOT NULL,                         -- Student's full name
  date_of_birth DATE,                                 -- Date of birth
  FOREIGN KEY (class_id) REFERENCES Classes(class_id)
);

-- 5. PARENT-STUDENT LINK: Which parent is linked to which student
CREATE TABLE IF NOT EXISTS Parent_Student_Links (
  parent_user_id INT NOT NULL,                        -- User ID of parent
  student_id INT NOT NULL,                            -- Student ID
  PRIMARY KEY (parent_user_id, student_id),           -- Composite key: one parent can link to many students
  FOREIGN KEY (parent_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- -- Step 1: Drop the old foreign key
-- ALTER TABLE Parent_Student_Links
-- DROP FOREIGN KEY parent_student_links_ibfk_1;

-- -- Step 2: Add a new foreign key with ON DELETE CASCADE
-- ALTER TABLE Parent_Student_Links
-- ADD CONSTRAINT fk_parent_user
-- FOREIGN KEY (parent_user_id) REFERENCES Users(user_id) ON DELETE CASCADE;

-- 6. ATTENDANCE: Daily attendance marked by teachers
CREATE TABLE IF NOT EXISTS Attendance (
  student_id INT NOT NULL,                            -- Who was marked
  attendance_date DATE NOT NULL,                      -- When attendance was taken
  status ENUM('Present', 'Absent') NOT NULL,          -- Attendance status
  teacher_id INT NOT NULL,                            -- Who marked the attendance
  PRIMARY KEY (student_id, attendance_date),          -- Prevent duplicate entries
  FOREIGN KEY (student_id) REFERENCES Students(student_id),
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
);

-- 7. ASSIGNMENTS: Work given to a class by a teacher
CREATE TABLE IF NOT EXISTS Assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique ID
  teacher_id INT NOT NULL,                            -- Who assigned it
  class_id INT NOT NULL,                              -- Which class it's for
  title VARCHAR(255) NOT NULL,                        -- Assignment title
  description TEXT,                                   -- Optional details
  due_date DATE,                                      -- Deadline
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id),
  FOREIGN KEY (class_id) REFERENCES Classes(class_id)
);

-- 8. SUBMISSIONS: Tracks who submitted what and when
CREATE TABLE IF NOT EXISTS Assignment_Submissions (
  submission_id INT AUTO_INCREMENT PRIMARY KEY,       -- Unique ID
  assignment_id INT NOT NULL,                         -- The assignment
  student_id INT NOT NULL,                            -- The student
  submission_date DATE,                               -- When it was submitted
  status ENUM('Submitted', 'Not Submitted') NOT NULL, -- Submission status
  FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id),
  FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- 9. PERFORMANCE: Subject grades and feedback per student
CREATE TABLE IF NOT EXISTS Performance (
  performance_id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique record ID
  student_id INT NOT NULL,                            -- Who it's for
  teacher_id INT NOT NULL,                            -- Teacher who graded
  subject VARCHAR(50),                                -- Subject name
  grade VARCHAR(2),                                   -- Grade, e.g., "A+"
  remarks TEXT,                                       -- Optional teacher comments
  FOREIGN KEY (student_id) REFERENCES Students(student_id),
  FOREIGN KEY (teacher_id) REFERENCES Users(user_id)
);

-- 10. EVENTS: Upcoming or past school events
CREATE TABLE IF NOT EXISTS Events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,            -- Event ID
  school_id INT NOT NULL,                             -- Which school is hosting
  event_name VARCHAR(100),                            -- Title of the event
  event_date DATE,                                    -- Date it occurs
  event_time TIME,                                    -- Time it occurs
  event_location VARCHAR(255),                        -- Where it occurs
  description TEXT,                                   -- What it's about
  FOREIGN KEY (school_id) REFERENCES Schools(school_id)
);

-- 11. EVENT NOTIFICATIONS: Notices sent about events
CREATE TABLE IF NOT EXISTS Event_Notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,     -- Unique ID
  event_id INT NOT NULL,                              -- Related event
  recipient_role ENUM('Teacher', 'Parent', 'Student'),-- Who gets the notification
  message TEXT,                                       -- Message content
  notification_date DATE,                             -- When it was sent
  FOREIGN KEY (event_id) REFERENCES Events(event_id)
);

-- 12. SUBSCRIPTIONS: Tracks schools' plan and payment
CREATE TABLE IF NOT EXISTS Subscriptions (
  subscription_id INT AUTO_INCREMENT PRIMARY KEY,     -- Unique subscription ID
  school_id INT NOT NULL,                             -- Which school
  plan_type ENUM('Basic', 'Premium', 'Enterprise') NOT NULL, -- Plan tier
  start_date DATE,                                    -- When it starts
  end_date DATE,                                      -- When it ends
  status ENUM('Active', 'Expired') NOT NULL,          -- Status of subscription
  payment_status ENUM('Paid', 'Unpaid') NOT NULL,     -- Whether it's paid
  transaction_id VARCHAR(255),                        -- Payment reference
  FOREIGN KEY (school_id) REFERENCES Schools(school_id)
);

-- 13. SUBSCRIPTION_PLANS: Defines the details of available subscription plans
CREATE TABLE IF NOT EXISTS Subscription_Plans (
  plan_id INT AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(50) NOT NULL,           -- e.g., 'Basic', 'Standard', 'Premium'
  monthly_price DECIMAL(10,2) NOT NULL,     -- Monthly price in USD
  yearly_price DECIMAL(10,2) NOT NULL,      -- Yearly price in USD (discounted)
  max_teachers INT,                         -- NULL means unlimited
  max_parents INT,                          -- NULL means unlimited
  features TEXT,                            -- JSON array of features
  is_active BOOLEAN DEFAULT TRUE,           -- Whether the plan is available for subscription
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================
-- PERFORMANCE INDEXES (for faster queries)
-- ======================================================
CREATE INDEX IF NOT EXISTS idx_attendance_student   ON Attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher   ON Attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assign  ON Assignment_Submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON Assignment_Submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_perf_student        ON Performance(student_id);
CREATE INDEX IF NOT EXISTS idx_perf_teacher        ON Performance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_users_school        ON Users(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher     ON Classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_school      ON Classes(school_id);

-- ======================================================
-- USEFUL VIEWS (for reports and dashboards)
-- ======================================================

-- View 1: Attendance per student
CREATE VIEW IF NOT EXISTS View_Student_Attendance AS
SELECT 
  s.name AS student_name,
  a.attendance_date,
  a.status
FROM Students s
JOIN Attendance a ON s.student_id = a.student_id;

-- View 2: Grades per subject
CREATE VIEW IF NOT EXISTS View_Student_Performance AS
SELECT 
  s.name AS student_name,
  p.subject,
  p.grade
FROM Students s
JOIN Performance p ON s.student_id = p.student_id;

-- View 3: Assignment submissions
CREATE VIEW IF NOT EXISTS View_Assignment_Submissions AS
SELECT 
  s.name AS student_name,
  a.title AS assignment_title,
  sub.status AS submission_status
FROM Students s
JOIN Assignment_Submissions sub ON s.student_id = sub.student_id
JOIN Assignments a ON sub.assignment_id = a.assignment_id;



-- ======================================================
-- INSERT SAMPLE DATA
-- ======================================================

-- 1. Schools Table
INSERT INTO Schools (school_name, address, contact_number, email, admin_name, admin_email) VALUES
('Greenwood Academy', '123 Oak Ave, Cityville', '111-222-3333', 'info.greenwood@example.com', 'Misher Mubarik', 'mishermubarik01@gmail.com'),
('Riverside High School', '456 River Rd, Townsville', '444-555-6666', 'contact@riverside.edu', 'Brenda SchoolAdmin', 'brenda.admin@riverside.edu'),
('Bright Minds Elementary', '789 Pine Ln, Villageton', '777-888-9999', 'admin@brightminds.org', 'Carol White', 'carol.teacher@greenwood.com'),
('Elite Scholars College', '101 University Dr, Metro City', '000-111-2222', 'admissions@elitescholars.net', 'David Brown', 'david.teacher@greenwood.com'),
('Beacon Learning Center', '202 Light St, Suburbia', '333-444-5555', 'support@beacon.school', 'Eve Green', 'eve.teacher@riverside.edu');

-- 2. Users Table
-- user_id is AUTO_INCREMENT and should not be included in the INSERT list.
-- Columns: school_id, role, name, email, password
INSERT INTO Users (school_id, role, name, email, password) VALUES
(NULL, 'EduConnect_Admin', 'Misher Mubarik', 'mishermubarik01@gmail.com', 'misher123'), -- EduConnect Admin 1
(NULL, 'EduConnect_Admin', 'Sadia Mehmood', 'saadianasir1001@gmail.com', 'sadia123'), -- EduConnect Admin 2
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'School_Admin', 'Alex SchoolAdmin', 'alex.admin@greenwood.com', 'greenwoodadmin'), -- School Admin for Greenwood
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'School_Admin', 'Brenda SchoolAdmin', 'brenda.admin@riverside.edu', 'riversideadmin'), -- School Admin for Riverside
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Teacher', 'Carol White', 'carol.teacher@greenwood.com', 'teacherpass1'), -- Teacher at Greenwood
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Teacher', 'David Brown', 'david.teacher@greenwood.com', 'teacherpass2'), -- Teacher at Greenwood
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'Teacher', 'Eve Green', 'eve.teacher@riverside.edu', 'teacherpass3'), -- Teacher at Riverside
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Parent', 'Frank Black', 'frank.parent@greenwood.com', 'parentpass1'), -- Parent linked to Greenwood
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Parent', 'Grace Lee', 'grace.parent@greenwood.com', 'parentpass2'), -- Parent linked to Greenwood
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'Parent', 'Henry Kim', 'henry.parent@riverside.edu', 'parentpass3'); -- Parent linked to Riverside

-- 3. Classes Table
-- Columns: school_id, teacher_id, class_name
INSERT INTO Classes (school_id, teacher_id, class_name) VALUES
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), '5th Grade A'),
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), '5th Grade B'), -- Carol teaches another class
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com'), '6th Grade Science'),
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'Math 101'),
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'English Lit'),
((SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary'), NULL, '3rd Grade C'); -- Class with no teacher yet (teacher_id is nullable)

-- 4. Students Table
-- Columns: class_id, name, date_of_birth
INSERT INTO Students (class_id, name, date_of_birth) VALUES
((SELECT class_id FROM Classes WHERE class_name = '5th Grade A' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Liam Davis', '2014-03-15'),
((SELECT class_id FROM Classes WHERE class_name = '5th Grade A' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Olivia Martinez', '2014-07-22'),
((SELECT class_id FROM Classes WHERE class_name = '6th Grade Science' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Noah Wilson', '2013-11-01'),
((SELECT class_id FROM Classes WHERE class_name = 'Math 101' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Emma Taylor', '2012-09-10'),
((SELECT class_id FROM Classes WHERE class_name = 'English Lit' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Sophia Anderson', '2012-05-20'),
((SELECT class_id FROM Classes WHERE class_name = '5th Grade B' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'James Miller', '2014-01-25');

-- 5. Parent_Student_Links Table
-- Columns: parent_user_id, student_id
INSERT INTO Parent_Student_Links (parent_user_id, student_id) VALUES
((SELECT user_id FROM Users WHERE email = 'frank.parent@greenwood.com'), (SELECT student_id FROM Students WHERE name = 'Liam Davis')),
((SELECT user_id FROM Users WHERE email = 'frank.parent@greenwood.com'), (SELECT student_id FROM Students WHERE name = 'Olivia Martinez')),
((SELECT user_id FROM Users WHERE email = 'grace.parent@greenwood.com'), (SELECT student_id FROM Students WHERE name = 'Olivia Martinez')), -- Grace is also parent of Olivia
((SELECT user_id FROM Users WHERE email = 'henry.parent@riverside.edu'), (SELECT student_id FROM Students WHERE name = 'Emma Taylor')),
((SELECT user_id FROM Users WHERE email = 'henry.parent@riverside.edu'), (SELECT student_id FROM Students WHERE name = 'Sophia Anderson')),
((SELECT user_id FROM Users WHERE email = 'frank.parent@greenwood.com'), (SELECT student_id FROM Students WHERE name = 'James Miller'));

-- 6. Attendance Table
-- Columns: student_id, attendance_date, status, teacher_id
INSERT INTO Attendance (student_id, attendance_date, status, teacher_id) VALUES
((SELECT student_id FROM Students WHERE name = 'Liam Davis'), '2025-05-20', 'Present', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')),
((SELECT student_id FROM Students WHERE name = 'Olivia Martinez'), '2025-05-20', 'Absent', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')),
((SELECT student_id FROM Students WHERE name = 'Noah Wilson'), '2025-05-20', 'Present', (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com')),
((SELECT student_id FROM Students WHERE name = 'Emma Taylor'), '2025-05-20', 'Present', (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')),
((SELECT student_id FROM Students WHERE name = 'Sophia Anderson'), '2025-05-20', 'Absent', (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')),
((SELECT student_id FROM Students WHERE name = 'Liam Davis'), '2025-05-21', 'Present', (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'));

-- 7. Assignments Table
-- Columns: teacher_id, class_id, title, description, due_date
INSERT INTO Assignments (teacher_id, class_id, title, description, due_date) VALUES
((SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '5th Grade A' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Math Homework Ch 5', 'Complete exercises on fractions.', '2025-05-25'),
((SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '5th Grade B' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Science Project Outline', 'Outline for volcano project.', '2025-06-01'),
((SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com'), (SELECT class_id FROM Classes WHERE class_name = '6th Grade Science' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Biology Lab Report', 'Experiment on plant growth.', '2025-05-28'),
((SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), (SELECT class_id FROM Classes WHERE class_name = 'Math 101' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Algebra Quiz Prep', 'Review chapters 1-3.', '2025-05-26'),
((SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), (SELECT class_id FROM Classes WHERE class_name = 'English Lit' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Essay: Romeo & Juliet', 'Analyze themes in Act 3.', '2025-06-05');

-- 8. Assignment_Submissions Table
-- Columns: assignment_id, student_id, submission_date, status
INSERT INTO Assignment_Submissions (assignment_id, student_id, submission_date, status) VALUES
((SELECT assignment_id FROM Assignments WHERE title = 'Math Homework Ch 5' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE name = 'Liam Davis'), '2025-05-24', 'Submitted'),
((SELECT assignment_id FROM Assignments WHERE title = 'Math Homework Ch 5' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE name = 'Olivia Martinez'), NULL, 'Not Submitted'),
((SELECT assignment_id FROM Assignments WHERE title = 'Science Project Outline' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE name = 'James Miller'), '2025-05-23', 'Submitted'),
((SELECT assignment_id FROM Assignments WHERE title = 'Biology Lab Report' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com')), (SELECT student_id FROM Students WHERE name = 'Noah Wilson'), '2025-05-27', 'Submitted'),
((SELECT assignment_id FROM Assignments WHERE title = 'Algebra Quiz Prep' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')), (SELECT student_id FROM Students WHERE name = 'Emma Taylor'), '2025-05-24', 'Submitted'),
((SELECT assignment_id FROM Assignments WHERE title = 'Essay: Romeo & Juliet' AND teacher_id = (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu')), (SELECT student_id FROM Students WHERE name = 'Sophia Anderson'), NULL, 'Not Submitted');

-- 9. Performance Table
-- Columns: student_id, teacher_id, subject, grade, remarks
INSERT INTO Performance (student_id, teacher_id, subject, grade, remarks) VALUES
((SELECT student_id FROM Students WHERE name = 'Liam Davis'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), 'Mathematics', 'A', 'Excellent understanding of concepts.'),
((SELECT student_id FROM Students WHERE name = 'Olivia Martinez'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), 'Mathematics', 'C+', 'Needs to improve on problem-solving.'),
((SELECT student_id FROM Students WHERE name = 'Noah Wilson'), (SELECT user_id FROM Users WHERE email = 'david.teacher@greenwood.com'), 'Science', 'B', 'Good effort in practicals.'),
((SELECT student_id FROM Students WHERE name = 'Emma Taylor'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'Mathematics', 'A-', 'Consistently high performance.'),
((SELECT student_id FROM Students WHERE name = 'Sophia Anderson'), (SELECT user_id FROM Users WHERE email = 'eve.teacher@riverside.edu'), 'English', 'B+', 'Shows good analytical skills in essays.'),
((SELECT student_id FROM Students WHERE name = 'James Miller'), (SELECT user_id FROM Users WHERE email = 'carol.teacher@greenwood.com'), 'Science', 'A', 'Very thorough project outline.');

-- 10. Events Table
-- Columns: school_id, event_name, event_date, description
INSERT INTO Events (school_id, event_name, event_date, description) VALUES
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Annual Sports Day', '2025-06-10', 'Join us for a day of sports and fun activities!'),
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Parent-Teacher Meeting', '2025-06-15', 'Scheduled one-on-one meetings with teachers.'),
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'School Carnival', '2025-07-01', 'Games, food, and prizes for all ages.'),
((SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary'), 'Science Fair', '2025-06-20', 'Showcasing student science projects.'),
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Summer Camp Enrollment', '2025-05-28', 'Enrollment for summer camp programs.'),
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'Graduation Ceremony', '2025-07-15', 'Celebrating our graduating class of 2025.');

-- 11. Event_Notifications Table
-- Columns: event_id, recipient_role, message, notification_date
INSERT INTO Event_Notifications (event_id, recipient_role, message, notification_date) VALUES
((SELECT event_id FROM Events WHERE event_name = 'Annual Sports Day' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Parent', 'Reminder: Annual Sports Day is on June 10th!', '2025-05-23'),
((SELECT event_id FROM Events WHERE event_name = 'Parent-Teacher Meeting' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Parent', 'Sign up for PTM slots by June 10.', '2025-05-22'),
((SELECT event_id FROM Events WHERE event_name = 'School Carnival' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Riverside High School')), 'Teacher', 'Volunteers needed for School Carnival setup.', '2025-05-21'),
((SELECT event_id FROM Events WHERE event_name = 'Science Fair' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary')), 'Parent', 'Come and support our young scientists at the Science Fair!', '2025-05-20'),
((SELECT event_id FROM Events WHERE event_name = 'Summer Camp Enrollment' AND school_id = (SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy')), 'Parent', 'Summer Camp enrollment opens on May 28th.', '2025-05-25');

-- 12. Subscriptions Table
-- Columns: school_id, plan_type, start_date, end_date, status, payment_status, transaction_id
INSERT INTO Subscriptions (school_id, plan_type, start_date, end_date, status, payment_status, transaction_id) VALUES
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Premium', '2024-09-01', '2025-08-31', 'Active', 'Paid', 'TRANS12345'),
((SELECT school_id FROM Schools WHERE school_name = 'Riverside High School'), 'Basic', '2024-10-15', '2025-10-14', 'Active', 'Paid', 'TRANS67890'),
((SELECT school_id FROM Schools WHERE school_name = 'Bright Minds Elementary'), 'Enterprise', '2025-01-01', '2025-12-31', 'Active', 'Paid', 'TRANSABCDE'),
((SELECT school_id FROM Schools WHERE school_name = 'Elite Scholars College'), 'Premium', '2024-03-01', '2025-02-28', 'Expired', 'Paid', 'TRANSFGHIJ'),
((SELECT school_id FROM Schools WHERE school_name = 'Beacon Learning Center'), 'Basic', '2025-05-01', '2026-04-30', 'Active', 'Unpaid', 'PENDING123'),
((SELECT school_id FROM Schools WHERE school_name = 'Greenwood Academy'), 'Basic', '2023-09-01', '2024-08-31', 'Expired', 'Paid', 'TRANSOLD45');


-- Insert the initial plans based on the image
INSERT INTO Subscription_Plans 
(plan_name, monthly_price, yearly_price, max_teachers, max_parents, features, is_active) 
VALUES 
('Basic', 29.99, 299.00, 10, 50, 
 '["10 Teachers", "50 Parents", "Basic Support", "Email Support", "Basic Analytics"]', 
 TRUE),
('Standard', 59.99, 599.00, 25, 150, 
 '["25 Teachers", "150 Parents", "Priority Support", "Email & Phone Support", "Advanced Analytics", "Custom Reports"]', 
 TRUE),
('Premium', 99.99, 999.00, NULL, NULL, 
 '["Unlimited Teachers", "Unlimited Parents", "24/7 Premium Support", "Dedicated Account Manager", "Advanced Analytics", "Custom Reports", "API Access"]', 
 TRUE);

-- Create a view for active subscription plans
CREATE VIEW View_Active_Subscription_Plans AS
SELECT * FROM Subscription_Plans WHERE is_active = TRUE;

-- Stored procedure for managing subscription plans (only accessible by EduConnect_Admin)
DELIMITER //

CREATE PROCEDURE Manage_Subscription_Plan(
    IN p_admin_id INT,
    IN p_plan_id INT,
    IN p_plan_name VARCHAR(50),
    IN p_monthly_price DECIMAL(10,2),
    IN p_yearly_price DECIMAL(10,2),
    IN p_max_teachers INT,
    IN p_max_parents INT,
    IN p_features TEXT,
    IN p_is_active BOOLEAN,
    IN p_action VARCHAR(10) -- 'INSERT', 'UPDATE', 'DELETE'
)
BEGIN
    DECLARE is_admin BOOLEAN;
    
    -- Check if user is EduConnect_Admin
    SELECT COUNT(*) > 0 INTO is_admin
    FROM Users 
    WHERE user_id = p_admin_id AND role = 'EduConnect_Admin';
    
    IF is_admin THEN
        IF p_action = 'INSERT' THEN
            INSERT INTO Subscription_Plans 
            (plan_name, monthly_price, yearly_price, max_teachers, max_parents, features, is_active)
            VALUES 
            (p_plan_name, p_monthly_price, p_yearly_price, 
             NULLIF(p_max_teachers, 0), NULLIF(p_max_parents, 0), 
             p_features, p_is_active);
             
        ELSEIF p_action = 'UPDATE' THEN
            UPDATE Subscription_Plans
            SET plan_name = p_plan_name,
                monthly_price = p_monthly_price,
                yearly_price = p_yearly_price,
                max_teachers = NULLIF(p_max_teachers, 0),
                max_parents = NULLIF(p_max_parents, 0),
                features = p_features,
                is_active = p_is_active,
                updated_at = CURRENT_TIMESTAMP
            WHERE plan_id = p_plan_id;
            
        ELSEIF p_action = 'DELETE' THEN
            -- Soft delete by marking as inactive
            UPDATE Subscription_Plans
            SET is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE plan_id = p_plan_id;
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Only EduConnect_Admin can manage subscription plans';
    END IF;
END //

DELIMITER ;

-- ======================================================
-- TRANSACTIONS TABLE
-- Purpose: Track all payment transactions in the system
-- ======================================================

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
    invoice_number VARCHAR(50),                      -- Invoice number for reference
    billing_cycle ENUM('monthly', 'yearly'),         -- Billing cycle for subscription payments
    metadata JSON,                                   -- Additional metadata in JSON format
    created_by INT NOT NULL,                         -- User who initiated the transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the transaction was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update timestamp
    
    -- Foreign key constraints
    FOREIGN KEY (school_id) REFERENCES Schools(school_id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_plan_id) REFERENCES Subscription_Plans(plan_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for better query performance
CREATE INDEX idx_transactions_school_id ON Transactions(school_id);
CREATE INDEX idx_transactions_status ON Transactions(status);
CREATE INDEX idx_transactions_created_at ON Transactions(created_at);

-- View for active transactions (completed payments)
CREATE VIEW View_Active_Transactions AS
SELECT * FROM Transactions WHERE status = 'completed';

-- Stored procedure for creating a new transaction (only accessible by EduConnect_Admin)
DELIMITER //

CREATE PROCEDURE Create_Transaction(
    IN p_admin_id INT,
    IN p_school_id INT,
    IN p_subscription_plan_id INT,
    IN p_amount DECIMAL(10, 2),
    IN p_currency VARCHAR(3),
    IN p_payment_method VARCHAR(50),
    IN p_payment_gateway VARCHAR(50),
    IN p_gateway_transaction_id VARCHAR(100),
    IN p_status VARCHAR(20),
    IN p_description TEXT,
    IN p_billing_cycle VARCHAR(10),
    IN p_metadata JSON
)
BEGIN
    DECLARE is_admin BOOLEAN;
    DECLARE new_transaction_id VARCHAR(50);
    
    -- Check if user is EduConnect_Admin
    SELECT COUNT(*) > 0 INTO is_admin
    FROM Users 
    WHERE user_id = p_admin_id AND role = 'EduConnect_Admin';
    
    IF is_admin THEN
        -- Generate a unique transaction ID if not provided
        IF p_gateway_transaction_id IS NULL THEN
            SET new_transaction_id = CONCAT('TXN', DATE_FORMAT(NOW(), '%Y%m%d'), '-', 
                                          LPAD(FLOOR(RAND() * 10000), 4, '0'));
        ELSE
            SET new_transaction_id = p_gateway_transaction_id;
        END IF;
        
        -- Insert the new transaction
        INSERT INTO Transactions (
            transaction_id,
            school_id,
            subscription_plan_id,
            amount,
            currency,
            payment_method,
            payment_gateway,
            gateway_transaction_id,
            status,
            description,
            billing_cycle,
            metadata,
            created_by
        ) VALUES (
            new_transaction_id,
            p_school_id,
            p_subscription_plan_id,
            p_amount,
            p_currency,
            p_payment_method,
            p_payment_gateway,
            p_gateway_transaction_id,
            p_status,
            p_description,
            p_billing_cycle,
            p_metadata,
            p_admin_id
        );
        
        -- Return the new transaction ID
        SELECT new_transaction_id AS transaction_id;
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Only EduConnect_Admin can create transactions';
    END IF;
END //

DELIMITER ;