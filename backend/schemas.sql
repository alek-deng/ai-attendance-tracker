-- ===============================================
-- AI Attendance Tracker Database Schema
-- ===============================================

-- Drop tables if they already exist (for clean re-runs)
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS student_course CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS lecturers CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;

-- ===============================================
-- Faculties Table
-- ===============================================
CREATE TABLE faculties (
    faculty_id SERIAL PRIMARY KEY,
    faculty_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- ===============================================
-- Lecturers Table
-- ===============================================
CREATE TABLE lecturers (
    lecturer_id SERIAL PRIMARY KEY,
    lecturer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    faculty_id INT REFERENCES faculties(faculty_id) ON DELETE SET NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- ===============================================
-- Students Table
-- ===============================================
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    reg_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    year_of_study INT CHECK (year_of_study BETWEEN 1 AND 6),
    faculty_id INT REFERENCES faculties(faculty_id) ON DELETE SET NULL,
    image_path TEXT,
    password_hash VARCHAR(255) NOT NULL
);

-- ===============================================
-- Courses Table
-- ===============================================
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    faculty_id INT REFERENCES faculties(faculty_id) ON DELETE SET NULL,
    lecturer_id INT REFERENCES lecturers(lecturer_id) ON DELETE SET NULL
);

-- ===============================================
-- Student-Course Relationship Table
-- ===============================================
CREATE TABLE student_course (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    semester VARCHAR(20),
    year INT,
    UNIQUE(student_id, course_id)
);

-- ===============================================
-- Attendance Table
-- ===============================================
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Late')),
    recognized_face BOOLEAN DEFAULT FALSE
);

-- ===============================================
-- Attendance Logs Table (System logs for auditing)
-- ===============================================
CREATE TABLE attendance_logs (
    log_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE SET NULL,
    action VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence_score DECIMAL(5,2),
    system_note TEXT
);

-- ===============================================
-- Indexes for faster queries
-- ===============================================
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_lecturer_email ON lecturers(email);
CREATE INDEX idx_course_code ON courses(course_code);
CREATE INDEX idx_attendance_date ON attendance(date);

-- ===============================================
-- Sample data (Optional for testing)
-- ===============================================
INSERT INTO faculties (faculty_name, description)
VALUES
('Computer Science', 'Faculty of Computing and Informatics'),
('Engineering', 'Faculty of Engineering and Technology');

INSERT INTO lecturers (lecturer_name, email, department, faculty_id, password_hash)
VALUES
('Dr. Jane Mwangi', 'jane.mwangi@university.ac.ke', 'Computer Science', 1, 'hashed_password');

INSERT INTO students (student_name, reg_number, email, year_of_study, faculty_id, image_path, password_hash)
VALUES
('Alek Deng', 'CS2021/001', 'alek.deng@students.ac.ke', 3, 1, '/images/alek.jpg', 'hashed_password'),
('Mary Wanjiku', 'CS2021/002', 'mary.wanjiku@students.ac.ke', 3, 1, '/images/mary.jpg', 'hashed_password');

INSERT INTO courses (course_name, course_code, faculty_id, lecturer_id)
VALUES
('Machine Learning', 'CSC3203', 1, 1),
('Database Systems', 'CSC2202', 1, 1);

INSERT INTO student_course (student_id, course_id, semester, year)
VALUES
(1, 1, 'Semester 1', 2025),
(2, 2, 'Semester 1', 2025);
