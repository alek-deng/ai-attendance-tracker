-- =============================================
-- MOCK DATA GENERATION FOR ATTENDANCE SYSTEM
-- =============================================

-- Make sure you’re connected to the right DB
-- \c attendance_tracker

-- Insert Faculties
INSERT INTO faculty (name, code, description) VALUES
('School of Computing', 'SOC', 'Computing and Information Technology'),
('School of Engineering', 'SOE', 'Engineering and Technology'),
('School of Business', 'SOB', 'Business and Management Studies');

-- Insert Courses
INSERT INTO course (faculty_id, name, code, duration_years)
SELECT id, name || ' Program', 
       CASE WHEN code='SOC' THEN 'CSE' 
            WHEN code='SOE' THEN 'ENG' 
            WHEN code='SOB' THEN 'BUS' END || LPAD((row_number() OVER()), 3, '0'),
       4
FROM faculty;

-- Insert Units (2 per course)
INSERT INTO unit (course_id, name, code, year_of_study, semester_offered, credits)
SELECT c.id, 'Unit ' || g, 'U' || floor(random() * 1000)::INT,
       (floor(random() * 4) + 1)::INT,
       (ARRAY['fall','spring','summer'])[floor(random() * 3 + 1)],
       3
FROM course c, generate_series(1, 2) g;

-- Insert Users (Admins)
INSERT INTO "user" (email, password_hash, role, first_name, last_name)
VALUES 
('admin1@school.com', 'hashed_pass', 'admin', 'Admin', 'One'),
('admin2@school.com', 'hashed_pass', 'admin', 'Admin', 'Two'),
('admin3@school.com', 'hashed_pass', 'admin', 'Admin', 'Three'),
('admin4@school.com', 'hashed_pass', 'admin', 'Admin', 'Four');

-- Insert Lecturers
INSERT INTO "user" (email, password_hash, role, first_name, last_name)
SELECT 'lecturer' || g || '@school.com', 'hashed_pass', 'lecturer', 
       'Lecturer', g::text
FROM generate_series(1, 15) g;

INSERT INTO lecturer (user_id, faculty_id, staff_number, specialization)
SELECT u.id, f.id, 'L' || floor(random() * 9000 + 1000)::INT, 
       'Specialization ' || f.name
FROM "user" u
JOIN faculty f ON f.id = (
    SELECT id FROM faculty ORDER BY random() LIMIT 1
)
WHERE u.role = 'lecturer';

-- Insert Students
INSERT INTO "user" (email, password_hash, role, first_name, last_name)
SELECT 'student' || g || '@school.com', 'hashed_pass', 'student',
       'Student', g::text
FROM generate_series(1, 100) g;

INSERT INTO student (user_id, course_id, faculty_id, registration_number, year_of_study, enrollment_date, expected_graduation_date)
SELECT u.id, c.id, c.faculty_id, 
       'REG' || floor(random() * 900000 + 100000)::INT,
       (floor(random() * 4) + 1),
       CURRENT_DATE - (INTERVAL '1 year' * floor(random() * 3)),
       CURRENT_DATE + INTERVAL '2 years'
FROM "user" u
JOIN course c ON c.id = (SELECT id FROM course ORDER BY random() LIMIT 1)
WHERE u.role = 'student';

-- Create Class Sessions
INSERT INTO class_session (unit_id, lecturer_id, session_date, start_time, end_time, room_number)
SELECT u.id, l.id, CURRENT_DATE - (INTERVAL '1 day' * floor(random() * 30)),
       '09:00', '10:30', 'Room ' || floor(random() * 20 + 1)
FROM unit u
JOIN lecturer l ON true
LIMIT 30;

-- Enroll Students in Units
INSERT INTO unit_enrollment (student_id, unit_id, academic_year, semester)
SELECT s.id, u.id, '2024/2025',
       (ARRAY['fall','spring','summer'])[floor(random() * 3 + 1)]
FROM student s, unit u
WHERE random() < 0.3;

-- Simulate Attendance Logs
INSERT INTO attendance (student_id, class_session_id, status, check_in_time, verification_method, confidence_score)
SELECT s.id, cs.id,
       (ARRAY['present','absent','late','excused'])[floor(random() * 4 + 1)],
       CURRENT_TIMESTAMP - (INTERVAL '1 hour' * floor(random() * 3)),
       (ARRAY['facial_recognition','manual','rfid'])[floor(random() * 3 + 1)],
       round((random() * 0.4 + 0.6)::numeric, 3)
FROM student s, class_session cs
WHERE random() < 0.4;

-- Simulate AI Recognition Logs
INSERT INTO ai_recognition_log (class_session_id, student_id, confidence_score, is_successful, image_url)
SELECT cs.id, s.id, 
       round((random() * 0.5 + 0.5)::numeric, 3),
       (random() > 0.1),
       'https://example.com/images/' || s.id || '.jpg'
FROM class_session cs, student s
WHERE random() < 0.1;
