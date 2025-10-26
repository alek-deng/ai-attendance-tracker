-- ===============================================
-- AI Attendance Tracker Sample Data Seeder
-- ===============================================

TRUNCATE TABLE attendance_logs, attendance, student_course, courses, students, lecturers, faculties RESTART IDENTITY CASCADE;

-- ===============================================
-- 1️⃣ Insert Faculties
-- ===============================================
INSERT INTO faculties (faculty_name, description)
VALUES
('Computer Science', 'Faculty of Computing and Informatics'),
('Engineering', 'Faculty of Engineering and Technology'),
('Business', 'Faculty of Business and Management'),
('Education', 'Faculty of Education and Human Development'),
('Health Sciences', 'Faculty of Health and Medical Studies');

-- ===============================================
-- 2️⃣ Insert Lecturers
-- ===============================================
INSERT INTO lecturers (lecturer_name, email, department, faculty_id, password_hash)
SELECT 
    'Lecturer ' || i,
    'lecturer' || i || '@university.ac.ke',
    CASE 
        WHEN (i % 5) = 1 THEN 'Computer Science'
        WHEN (i % 5) = 2 THEN 'Engineering'
        WHEN (i % 5) = 3 THEN 'Business'
        WHEN (i % 5) = 4 THEN 'Education'
        ELSE 'Health Sciences'
    END,
    (i % 5) + 1,
    'hash123'
FROM generate_series(1, 20) AS s(i);

-- ===============================================
-- 3️⃣ Insert Students
-- ===============================================
INSERT INTO students (student_name, reg_number, email, year_of_study, faculty_id, image_path, password_hash)
SELECT
    'Student ' || i,
    'REG' || to_char(i, 'FM000'),
    'student' || i || '@students.ac.ke',
    (i % 4) + 1,
    (i % 5) + 1,
    '/images/student' || i || '.jpg',
    'hash123'
FROM generate_series(1, 100) AS s(i);

-- ===============================================
-- 4️⃣ Insert Courses
-- ===============================================
INSERT INTO courses (course_name, course_code, faculty_id, lecturer_id)
SELECT
    CASE 
        WHEN (i % 5) = 1 THEN 'Introduction to Programming'
        WHEN (i % 5) = 2 THEN 'Data Structures'
        WHEN (i % 5) = 3 THEN 'Database Systems'
        WHEN (i % 5) = 4 THEN 'Machine Learning'
        ELSE 'Computer Networks'
    END || ' ' || i,
    'CSE' || to_char(i, 'FM000'),
    (i % 5) + 1,
    (i % 20) + 1
FROM generate_series(1, 20) AS s(i);

-- ===============================================
-- 5️⃣ Link Students to Courses
-- ===============================================
INSERT INTO student_course (student_id, course_id, semester, year)
SELECT 
    s.i,
    (s.i % 20) + 1,
    CASE 
        WHEN (s.i % 2) = 0 THEN 'Semester 1'
        ELSE 'Semester 2'
    END,
    2025
FROM generate_series(1, 100) AS s(i);

-- ===============================================
-- 6️⃣ Simulate Attendance Records
-- ===============================================
INSERT INTO attendance (student_id, course_id, date, time_in, time_out, status, recognized_face)
SELECT
    (random() * 99 + 1)::INT,
    (random() * 19 + 1)::INT,
    CURRENT_DATE - (random() * 30)::INT,
    '08:00'::TIME + (random() * INTERVAL '15 minutes'),
    '09:00'::TIME + (random() * INTERVAL '15 minutes'),
    CASE 
        WHEN random() < 0.8 THEN 'Present'
        WHEN random() < 0.9 THEN 'Late'
        ELSE 'Absent'
    END,
    (random() > 0.2)
FROM generate_series(1, 200) AS s(i);

-- ===============================================
-- 7️⃣ Insert Attendance Logs
-- ===============================================
INSERT INTO attendance_logs (student_id, course_id, action, timestamp, confidence_score, system_note)
SELECT
    (random() * 99 + 1)::INT,
    (random() * 19 + 1)::INT,
    CASE 
        WHEN random() < 0.5 THEN 'Face recognized'
        ELSE 'Recognition failed'
    END,
    NOW() - (random() * INTERVAL '10 days'),
    round((random() * 100)::NUMERIC, 2),
    'Auto-generated log entry for demo'
FROM generate_series(1, 200) AS s(i);
