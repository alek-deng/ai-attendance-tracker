from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Boolean, Text, DECIMAL, CheckConstraint, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


# ==========================================
# Faculties Table
# ==========================================
class Faculties(Base):
    __tablename__ = "faculties"

    faculty_id = Column(Integer, primary_key=True, index=True)
    faculty_name = Column(String(100), nullable=False)
    description = Column(Text)

    lecturers = relationship("Lecturers", back_populates="faculty")
    students = relationship("Students", back_populates="faculty")
    courses = relationship("Courses", back_populates="faculty")


# ==========================================
# Lecturers Table
# ==========================================
class Lecturers(Base):
    __tablename__ = "lecturers"

    lecturer_id = Column(Integer, primary_key=True, index=True)
    lecturer_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    department = Column(String(100))
    faculty_id = Column(Integer, ForeignKey("faculties.faculty_id"))
    password_hash = Column(String(255), nullable=False)

    faculty = relationship("Faculties", back_populates="lecturers")
    courses = relationship("Courses", back_populates="lecturer")


# ==========================================
# Students Table
# ==========================================
class Students(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(100), nullable=False)
    reg_number = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    year_of_study = Column(Integer)
    faculty_id = Column(Integer, ForeignKey("faculties.faculty_id"))
    image_path = Column(Text)
    password_hash = Column(String(255), nullable=False)

    faculty = relationship("Faculties", back_populates="students")
    student_courses = relationship("StudentCourse", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")


# ==========================================
# Courses Table
# ==========================================
class Courses(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(100), nullable=False)
    course_code = Column(String(20), unique=True, nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculties.faculty_id"))
    lecturer_id = Column(Integer, ForeignKey("lecturers.lecturer_id"))

    faculty = relationship("Faculties", back_populates="courses")
    lecturer = relationship("Lecturers", back_populates="courses")
    student_courses = relationship("StudentCourse", back_populates="course")
    attendance = relationship("Attendance", back_populates="course")


# ==========================================
# Student-Course Relationship Table
# ==========================================
class StudentCourse(Base):
    __tablename__ = "student_course"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    course_id = Column(Integer, ForeignKey("courses.course_id"))
    semester = Column(String(20))
    year = Column(Integer)

    student = relationship("Students", back_populates="student_courses")
    course = relationship("Courses", back_populates="student_courses")


# ==========================================
# Attendance Table
# ==========================================
class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    course_id = Column(Integer, ForeignKey("courses.course_id"))
    date = Column(Date, nullable=False)
    time_in = Column(Time)
    time_out = Column(Time)
    status = Column(String(20))
    recognized_face = Column(Boolean, default=False)

    student = relationship("Students", back_populates="attendance")
    course = relationship("Courses", back_populates="attendance")


# ==========================================
# Attendance Logs Table
# ==========================================
class AttendanceLogs(Base):
    __tablename__ = "attendance_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    course_id = Column(Integer, ForeignKey("courses.course_id"))
    action = Column(String(50))
    timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    confidence_score = Column(DECIMAL(5, 2))
    system_note = Column(Text)
