# SkillMate – Student Skill Exchange and Peer Learning System

> **Tagline:** Learn together. Teach together. Grow together.  
> **Coursework:** Full-Stack Web Development & Relational Database Management Systems (RDBMS)  
> **Backend & Database:** Node.js, Express, MySQL 8.0 (InnoDB), `mysql2/promise`  
> **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons  

---

## 🌟 Executive Summary

SkillMate is a full-stack academic peer learning and skill exchange web application designed for university students. On SkillMate, **a single student account acts as both a teacher and a learner**. Students can register their technical/academic competencies, record and upload short **1–3 minute teaching demonstration videos**, search for peer mentors, schedule collision-free tutoring sessions, and evaluate completed sessions using 1–5 star ratings and reviews.

---

## 🏗️ System Architecture & Technology Stack

```
                   +---------------------------------------------+
                   |           SkillMate Frontend (SPA)         |
                   |      React 19 + TypeScript + Tailwind       |
                   |   Plus Jakarta Sans Typography & UI Icons   |
                   +----------------------+----------------------+
                                          |
                                HTTP / REST APIs
                               (JSON & Multipart)
                                          |
                                          v
                   +---------------------------------------------+
                   |           SkillMate Backend Engine          |
                   |         Node.js + Express 4 + Multer        |
                   |       Bcrypt Password Hashing & CORS        |
                   +----------------------+----------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         +-------------------------+             +--------------------------+
         |     Live MySQL 8.0      |             | Persistent Fallback DB   |
         |      (Port: 3306)       |             |  (Strict Relational RDBMS |
         |   InnoDB / schema.sql   |             |   Constraints & Engine)  |
         +-------------------------+             +--------------------------+
                      |                                       |
                      +-------------------+-------------------+
                                          |
                                          v
                            +----------------------------+
                            |  Uploaded 1-3 Min Videos   |
                            |   Directory: uploads/videos|
                            +----------------------------+
```

---

## 🗄️ MySQL Database Design & Relational Tables

The system schema is fully defined in `/schema.sql` with primary keys, foreign-key cascades, check constraints, unique constraints, and B-Tree indexes across 8 relational tables:

1. **`students`**: User identity, Student ID number (unique), full name, department, year of study, profile photo, bio, bcrypt password hash, and roles (`student`, `admin`).
2. **`skills`**: Master taxonomy of skills across 8 categories: *Programming, Database, Web Development, Mathematics, Science, Communication, Design, Other Skills*.
3. **`student_skills`**: Junction table mapping student profiles to skills, with proficiency (`Beginner`, `Intermediate`, `Advanced`), and role type (`Teaching`, `Learning`, `Both`).
4. **`teaching_videos`**: Metadata and file URLs for 1–3 minute demonstration videos (MP4 and WebM, max 100MB) with duration, views count, and subject mapping.
5. **`learning_requests`**: Peer-to-peer tutoring proposals initiated by learners with requested subject, preferred date/time, and status (`pending`, `accepted`, `rejected`).
6. **`sessions`**: Confirmed peer tutoring appointments with collision prevention (ensures mentors do not overlap during booked slots), physical room or meeting link, and status (`Requested`, `Accepted`, `Completed`, `Cancelled`).
7. **`feedback`**: Post-session evaluation ratings (1–5 gold stars) and written reviews. Unique constraint on `session_id` ensures one feedback per completed session.
8. **`administrators`**: Auditing personnel with elevated privileges to inspect students, moderate videos, manage skills catalog, and reset demo data.

---

## 💻 Academic SQL Demonstrations (DDL, DML, DQL, DCL, TCL)

### 1. DDL (Data Definition Language)
```sql
CREATE DATABASE IF NOT EXISTS skillmate_db;
USE skillmate_db;

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

### 2. DQL (Data Query Language with Multi-Table Joins & Grouping)
```sql
-- Retrieve peer mentors with their average rating, total videos, and skills:
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
ORDER BY avg_rating DESC;
```

### 3. Collision Prevention DQL (Time Overlap Verification)
```sql
-- Prevents double booking a mentor at the same time:
SELECT * FROM sessions
WHERE mentor_id = 1
  AND session_date = '2026-11-10'
  AND status IN ('Requested', 'Accepted')
  AND (
      ('16:00:00' >= start_time AND '16:00:00' < end_time) OR
      ('17:00:00' > start_time AND '17:00:00' <= end_time) OR
      (start_time >= '16:00:00' AND end_time <= '17:00:00')
  );
```

### 4. DCL (Data Control Language)
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON skillmate_db.* TO 'skillmate_user'@'localhost' IDENTIFIED BY 'student_password';
FLUSH PRIVILEGES;
```

### 5. TCL (Transaction Control Language)
```sql
START TRANSACTION;
  INSERT INTO sessions (mentor_id, learner_id, skill_id, title, session_date, start_time, end_time, location_type, status)
  VALUES (1, 5, 3, 'React Mentorship Session', '2026-11-20', '15:00:00', '16:00:00', 'Online Meeting', 'Accepted');
  UPDATE learning_requests SET status = 'accepted' WHERE id = 1;
COMMIT;
-- If any error occurs:
-- ROLLBACK;
```

---

## ☕ Java Swing JDBC Academic Implementation Guide

For the separate Java Swing desktop presentation and viva examination, use the following template to connect to `skillmate_db`:

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class SkillMateJDBC {
    private static final String URL = "jdbc:mysql://localhost:3306/skillmate_db?useSSL=false&allowPublicKeyRetrieval=true";
    private static final String USER = "root";
    private static final String PASSWORD = ""; // MySQL password

    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {
                System.out.println("✅ Connected to MySQL Database!");
                
                String query = "SELECT student_id_number, full_name, department FROM students";
                PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery();
                
                while (rs.next()) {
                    System.out.println(rs.getString("student_id_number") + " | " + 
                                       rs.getString("full_name") + " | " + 
                                       rs.getString("department"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

---

## 🚀 Setup & Execution Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=""
DB_NAME=skillmate_db
PORT=3000
```

### 2. MySQL Server Setup
Ensure MySQL is running (via XAMPP, WAMP, Docker, or native mysqld).
Run the schema script:
```bash
mysql -u root -p < schema.sql
```

### 3. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with Express backend API endpoints and Vite frontend.

---

## 🔑 Demo Login Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Mentor (React & Algorithms)** | Aarav Sharma | `aarav.sharma@skillmate.edu` | `student123` |
| **Mentor (MySQL & SQL Tuning)** | Priya Patel | `priya.patel@skillmate.edu` | `student123` |
| **Learner (First-Year Student)** | Vikram Malhotra | `vikram.m@skillmate.edu` | `student123` |
| **System Administrator** | Admin Staff | `admin@skillmate.edu` | `admin123` |

---

## 🧪 Testing the 10 User Journeys

1. **Register & Log In**: Click "Join SkillMate" or "Sign In" and create a student account with Student ID and department.
2. **Add a Skill**: Navigate to **My Skills**, click "Register New Skill", pick category, proficiency, and role (`Teaching`, `Learning`, or `Both`).
3. **Upload Teaching Video (Special Feature)**: Navigate to **Teaching Videos**, click "Upload 1–3 Min Demo", enter subject and title, and upload an MP4/WebM file, record via webcam, or test a demo stream.
4. **Find a Peer Mentor**: Go to **Find a Peer Mentor**, search by topic (e.g., "SQL" or "React"), filter by department, and inspect mentor badges.
5. **Watch Teaching Demo Video**: Click "Watch Demo" to launch the video player modal and observe the mentor's teaching style.
6. **Send Learning Request**: Click "Request Learning Session", choose preferred date and time, and submit your proposal.
7. **Accept Request**: Switch to the mentor's account (via the quick navbar demo switcher), navigate to **Learning Requests**, and click "Accept & Auto-Schedule".
8. **View Scheduled Session**: Navigate to **Session Scheduling** to view the confirmed booking on the calendar without time conflicts.
9. **Complete Session**: Click "Mark Done" once the peer tutoring lesson concludes.
10. **Rate & Submit Review**: Click "Rate & Review Peer" and submit a 1–5 star rating with written feedback. Observe the mentor's updated average rating immediately.
