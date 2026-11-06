-- =====================================================================
-- SkillMate – Student Skill Exchange and Peer Learning System
-- Relational Database Management System (RDBMS) - MySQL Schema & Academic SQL
-- Designed for Academic Coursework, Database Labs, and Full-Stack Demonstrations
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. DATABASE CREATION (DDL)
-- ---------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS skillmate_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skillmate_db;

-- ---------------------------------------------------------------------
-- 2. TABLE DEFINITIONS (DDL) WITH INTEGRITY CONSTRAINTS & INDEXES
-- ---------------------------------------------------------------------

-- Drop existing tables in reverse dependency order (safe script rerun)
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS learning_requests;
DROP TABLE IF EXISTS teaching_videos;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS administrators;
DROP TABLE IF EXISTS students;

-- Table 1: students
-- Stores peer learner and teacher profiles (one account can teach and learn)
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year_of_study VARCHAR(50) NOT NULL,
    profile_photo TEXT,
    bio TEXT,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_dept (department),
    INDEX idx_student_email (email)
) ENGINE=InnoDB;

-- Table 2: skills
-- Master list of academic and technical skills cataloged by category
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM(
        'Programming',
        'Database',
        'Web Development',
        'Mathematics',
        'Science',
        'Communication',
        'Design',
        'Other Skills'
    ) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'BookOpen',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skill_category (category)
) ENGINE=InnoDB;

-- Table 3: student_skills
-- Junction table mapping students to their registered skills with proficiency and role
CREATE TABLE student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    role_type ENUM('Teaching', 'Learning', 'Both') NOT NULL DEFAULT 'Both',
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_skill (student_id, skill_id),
    CONSTRAINT fk_student_skills_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_skills_skill
        FOREIGN KEY (skill_id) REFERENCES skills(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Table 4: teaching_videos
-- Student-uploaded 1-3 minute teaching demonstrations (MP4/WebM)
CREATE TABLE teaching_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_id INT NULL,
    title VARCHAR(200) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration_seconds INT NOT NULL DEFAULT 120,
    file_format VARCHAR(30) NOT NULL DEFAULT 'video/mp4',
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_videos_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_videos_skill
        FOREIGN KEY (skill_id) REFERENCES skills(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_video_subject (subject_name),
    INDEX idx_video_student (student_id)
) ENGINE=InnoDB;

-- Table 5: learning_requests
-- Peer-to-peer session proposals initiated by learners
CREATE TABLE learning_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    learner_id INT NOT NULL,
    mentor_id INT NOT NULL,
    skill_id INT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    preferred_date DATE,
    preferred_time VARCHAR(50),
    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    response_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_learner
        FOREIGN KEY (learner_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_requests_mentor
        FOREIGN KEY (mentor_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_requests_skill
        FOREIGN KEY (skill_id) REFERENCES skills(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_req_learner (learner_id),
    INDEX idx_req_mentor (mentor_id),
    INDEX idx_req_status (status)
) ENGINE=InnoDB;

-- Table 6: sessions
-- Confirmed and scheduled peer tutoring appointments with collision prevention
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NULL,
    mentor_id INT NOT NULL,
    learner_id INT NOT NULL,
    skill_id INT NULL,
    title VARCHAR(200) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_link VARCHAR(500),
    location_type ENUM('Online Meeting', 'Library Study Room', 'Lab 4B', 'Campus Lounge') NOT NULL DEFAULT 'Online Meeting',
    status ENUM('Requested', 'Accepted', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Accepted',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_request
        FOREIGN KEY (request_id) REFERENCES learning_requests(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_sessions_mentor
        FOREIGN KEY (mentor_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sessions_learner
        FOREIGN KEY (learner_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sessions_skill
        FOREIGN KEY (skill_id) REFERENCES skills(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_session_date_time (session_date, start_time),
    INDEX idx_session_mentor (mentor_id),
    INDEX idx_session_learner (learner_id)
) ENGINE=InnoDB;

-- Table 7: feedback
-- Post-session evaluation ratings (1-5 stars) and reviews
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL UNIQUE,
    reviewer_id INT NOT NULL,
    recipient_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_session
        FOREIGN KEY (session_id) REFERENCES sessions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_feedback_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_feedback_recipient
        FOREIGN KEY (recipient_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_feedback_recipient (recipient_id),
    INDEX idx_feedback_rating (rating)
) ENGINE=InnoDB;

-- Table 8: administrators
-- Platform administrators with privileges to audit students, videos, and stats
CREATE TABLE administrators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    permissions VARCHAR(255) NOT NULL DEFAULT 'ALL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. SEED DATA POPULATION (DML)
-- ---------------------------------------------------------------------

-- Insert Default Administrators (Password is: admin123)
INSERT INTO administrators (username, email, password_hash, full_name, permissions) VALUES
('admin', 'admin@skillmate.edu', '$2b$10$wT8mQ3L3xV7fWpT5K4lEbeFk9aY0Z6r4P3tC8/x.e8qV1h.K8N3Qy', 'System Administrator', 'ALL');

-- Insert Sample Students (Password for all demo accounts: student123)
-- Hash: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
INSERT INTO students (id, student_id_number, full_name, email, password_hash, department, year_of_study, profile_photo, bio, role) VALUES
(1, 'STU-2024-001', 'Aarav Sharma', 'aarav.sharma@skillmate.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Computer Science & Engineering', '3rd Year', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Passionate full-stack developer who loves teaching React, Node.js, and Data Structures. Let us debug together!', 'student'),
(2, 'STU-2024-002', 'Priya Patel', 'priya.patel@skillmate.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Information Technology', '4th Year', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Database architect & SQL enthusiast. Specializes in MySQL indexing, ER Modeling, and query optimization.', 'student'),
(3, 'STU-2024-003', 'Rohan Verma', 'rohan.verma@skillmate.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Electronics & Communication', '2nd Year', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 'Math geek & competitive programmer. Teaching Calculus, Discrete Math, and C++ algorithms.', 'student'),
(4, 'STU-2024-004', 'Ananya Iyer', 'ananya.iyer@skillmate.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Design & Media', '3rd Year', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'UI/UX Designer who believes in empathetic user interfaces. Teaching Figma component design and design systems.', 'student'),
(5, 'STU-2024-005', 'Vikram Malhotra', 'vikram.m@skillmate.edu', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Mechanical Engineering', '2nd Year', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Looking to learn Web Development and Python while sharing knowledge in Physics and CAD Modeling.', 'student');

-- Insert Curated Academic Skills
INSERT INTO skills (id, name, category, description, icon_name) VALUES
(1, 'Data Structures & Algorithms', 'Programming', 'Arrays, Linked Lists, Trees, Graphs, Sorting, Dynamic Programming in C++ & Java', 'Code'),
(2, 'MySQL & Relational Databases', 'Database', 'Schema Design, Normalization, SQL Joins, Triggers, Indexes, Query Tuning', 'Database'),
(3, 'React & Modern Frontend', 'Web Development', 'Components, Hooks, State Management, Tailwind CSS, Vite & Next.js', 'Globe'),
(4, 'Calculus & Linear Algebra', 'Mathematics', 'Derivatives, Matrix Transformations, Vector Spaces, Optimization', 'Calculator'),
(5, 'Figma & UI/UX Prototyping', 'Design', 'Auto-Layout, Component Sets, Interactive Wireframes, Design Tokens', 'Palette'),
(6, 'Technical Communication', 'Communication', 'Presentation Skills, Viva Preparation, Technical Writing & Resume Reviews', 'MessageSquare'),
(7, 'Node.js & Express REST APIs', 'Web Development', 'Backend Routing, Middleware, Authentication, Multer file uploads', 'Server'),
(8, 'Python for Data Science', 'Science', 'NumPy, Pandas, Matplotlib, exploratory data analysis and basic ML', 'Cpu');

-- Insert Student Skills Relationships
INSERT INTO student_skills (student_id, skill_id, proficiency, role_type, notes) VALUES
(1, 1, 'Advanced', 'Teaching', 'Specializes in graph traversals and DP problems'),
(1, 3, 'Advanced', 'Both', 'Happy to teach React and learn backend optimizations'),
(2, 2, 'Advanced', 'Teaching', 'Can explain indexing, B-Trees and 3NF normalization clearly'),
(2, 8, 'Intermediate', 'Learning', 'Want to master Python for advanced database querying'),
(3, 1, 'Advanced', 'Teaching', 'Competitive programming tutor'),
(3, 4, 'Advanced', 'Teaching', 'Calculus exam preparation tutor'),
(4, 5, 'Advanced', 'Teaching', 'Figma expert, design systems lead'),
(4, 3, 'Beginner', 'Learning', 'Learning HTML/CSS to build design systems'),
(5, 3, 'Beginner', 'Learning', 'Eager to build a personal project portfolio');

-- Insert Teaching Demonstration Videos (1-3 min short explanations)
INSERT INTO teaching_videos (id, student_id, skill_id, title, subject_name, description, video_url, thumbnail_url, duration_seconds, file_format, file_size_bytes, views_count) VALUES
(1, 1, 3, 'Understanding React useEffect Hook in 2 Minutes', 'React & Web Dev', 'A crystal-clear breakdown of component lifecycles, dependency arrays, and cleanup functions with real examples.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80', 120, 'video/mp4', 15400000, 142),
(2, 2, 2, 'Mastering SQL INNER vs LEFT JOIN with Venn Diagrams', 'Database & SQL', 'Learn how relational joins match records and how NULL values behave when joining customer and order tables.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80', 140, 'video/mp4', 18200000, 289),
(3, 3, 1, 'Binary Search: Eliminating Half the Search Space', 'Algorithms', 'Why logarithmic time complexity O(log N) is lightning fast. Visual walkthrough with sorted arrays.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1516116211227-bbc10c283a04?auto=format&fit=crop&w=600&q=80', 105, 'video/mp4', 12100000, 215),
(4, 4, 5, 'Figma Auto-Layout & Constraints Essentials', 'UI/UX Design', 'Build responsive mobile cards that adapt automatically to content changes without breaking padding.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', 160, 'video/mp4', 19800000, 178);

-- Insert Learning Requests
INSERT INTO learning_requests (id, learner_id, mentor_id, skill_id, subject, message, preferred_date, preferred_time, status, response_note) VALUES
(1, 5, 1, 3, 'Help setting up React props & state', 'Hi Aarav, I watched your 2-min demo video on React! I am building my first web app and struggling with state passing. Could we schedule a 45-min peer session?', '2026-11-10', '16:00', 'accepted', 'Glad you enjoyed the video! Looking forward to helping you with state management.'),
(2, 4, 2, 2, 'SQL Subqueries & Join Tuning', 'Hi Priya! I need assistance understanding how to query nested categories for an e-commerce dashboard.', '2026-11-12', '14:30', 'accepted', 'Sure thing! Bring your queries and we will step through the execution plans.'),
(3, 1, 4, 5, 'Portfolio Design Review & Feedback', 'Hi Ananya, could you review my web app interface wireframes in Figma?', '2026-11-14', '17:00', 'pending', NULL);

-- Insert Scheduled Sessions
INSERT INTO sessions (id, request_id, mentor_id, learner_id, skill_id, title, session_date, start_time, end_time, meeting_link, location_type, status, notes) VALUES
(1, 1, 1, 5, 3, 'React State & Props Hands-On Workshop', '2026-11-10', '16:00:00', '17:00:00', 'https://meet.google.com/skm-peer-001', 'Online Meeting', 'Accepted', 'Learner will have VS Code ready with a sample Vite app'),
(2, 2, 2, 4, 2, 'SQL Normalization & Complex Joins', '2026-11-04', '14:30:00', '15:30:00', 'https://meet.google.com/skm-peer-002', 'Library Study Room', 'Completed', 'Covered 1NF, 2NF, 3NF and multi-table left joins with practical examples'),
(3, NULL, 3, 5, 1, 'Binary Search Trees Quick Prep', '2026-11-11', '10:00:00', '11:00:00', 'https://meet.google.com/skm-peer-003', 'Lab 4B', 'Accepted', 'Midterm preparation peer session');

-- Insert Feedback & Ratings
INSERT INTO feedback (id, session_id, reviewer_id, recipient_id, rating, review_text) VALUES
(1, 2, 4, 2, 5, 'Priya was fantastic! She explained database normalization using a real library catalogue example. The 1 hour peer session saved me days of confusion!');

-- ---------------------------------------------------------------------
-- 4. ACADEMIC SQL COMMAND DEMONSTRATIONS (DDL, DML, DQL, DCL, TCL)
-- ---------------------------------------------------------------------

-- [DQL]: Data Query Language Examples
-- Q1: Retrieve student mentors with their average rating, total videos, and skills
SELECT 
    s.id AS student_id,
    s.full_name,
    s.department,
    s.year_of_study,
    COALESCE(AVG(f.rating), 5.0) AS avg_rating,
    COUNT(DISTINCT f.id) AS total_reviews,
    COUNT(DISTINCT v.id) AS total_videos,
    GROUP_CONCAT(DISTINCT sk.name ORDER BY sk.name SEPARATOR ', ') AS teaching_skills
FROM students s
LEFT JOIN student_skills ss ON s.id = ss.student_id AND ss.role_type IN ('Teaching', 'Both')
LEFT JOIN skills sk ON ss.skill_id = sk.id
LEFT JOIN feedback f ON s.id = f.recipient_id
LEFT JOIN teaching_videos v ON s.id = v.student_id
WHERE s.role = 'student'
GROUP BY s.id, s.full_name, s.department, s.year_of_study
ORDER BY avg_rating DESC, total_videos DESC;

-- Q2: Check for conflicting sessions for a mentor on a given date (Booking Integrity)
SELECT * FROM sessions
WHERE mentor_id = 1
  AND session_date = '2026-11-10'
  AND status IN ('Requested', 'Accepted')
  AND (
      ('16:00:00' >= start_time AND '16:00:00' < end_time) OR
      ('17:00:00' > start_time AND '17:00:00' <= end_time) OR
      (start_time >= '16:00:00' AND end_time <= '17:00:00')
  );

-- [DML]: Data Manipulation Language Examples
-- INSERT: Add a new student skill
-- INSERT INTO student_skills (student_id, skill_id, proficiency, role_type) VALUES (5, 2, 'Beginner', 'Learning');
-- UPDATE: Update session status to Completed
-- UPDATE sessions SET status = 'Completed' WHERE id = 1;
-- DELETE: Remove a rejected request
-- DELETE FROM learning_requests WHERE id = 999 AND status = 'rejected';

-- [DCL]: Data Control Language Commands
-- GRANT SELECT, INSERT, UPDATE, DELETE ON skillmate_db.* TO 'skillmate_user'@'localhost' IDENTIFIED BY 'secure_password';
-- FLUSH PRIVILEGES;
-- REVOKE DROP, ALTER ON skillmate_db.* FROM 'skillmate_user'@'localhost';

-- [TCL]: Transaction Control Language Commands
-- Demonstrating Atomic Booking:
-- START TRANSACTION;
--   INSERT INTO sessions (mentor_id, learner_id, skill_id, title, session_date, start_time, end_time, location_type, status)
--   VALUES (1, 5, 3, 'React Mentorship Session', '2026-11-20', '15:00:00', '16:00:00', 'Online Meeting', 'Accepted');
--   UPDATE learning_requests SET status = 'accepted' WHERE id = 1;
-- COMMIT;
-- -- If conflict occurs:
-- -- ROLLBACK;
