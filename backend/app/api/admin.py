from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import SessionLocal
from app.models import Students, Lecturers, Courses, Attendance, Faculties
from app.auth_utils import get_current_user

router = APIRouter()

# Password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ----------------------------
# DB Session Dependency
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# Utility: Verify admin privileges
# ----------------------------
def verify_admin(user: dict):
    if user["role"] != "lecturer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required (lecturer only)"
        )

# ----------------------------
# 1️⃣ View All Students
# ----------------------------
@router.get("/students", tags=["Admin"])
def list_students(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    verify_admin(user)
    students = db.query(Students).all()
    return {"total_students": len(students), "students": students}

# ----------------------------
# 2️⃣ View All Lecturers
# ----------------------------
@router.get("/lecturers", tags=["Admin"])
def list_lecturers(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    verify_admin(user)
    lecturers = db.query(Lecturers).all()
    return {"total_lecturers": len(lecturers), "lecturers": lecturers}

# ----------------------------
# 3️⃣ Create a New Student
# ----------------------------
@router.post("/create-student", tags=["Admin"])
def create_student(
    student_name: str,
    reg_number: str,
    email: str,
    year_of_study: int,
    faculty_id: int,
    password: str,
    image_path: str = None,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    verify_admin(user)

    # Check for duplicate
    existing_email = db.query(Students).filter(Students.email == email).first()
    existing_reg = db.query(Students).filter(Students.reg_number == reg_number).first()
    if existing_email or existing_reg:
        raise HTTPException(status_code=400, detail="Email or registration number already exists")

    hashed_password = pwd_context.hash(password)

    new_student = Students(
        student_name=student_name,
        reg_number=reg_number,
        email=email,
        year_of_study=year_of_study,
        faculty_id=faculty_id,
        image_path=image_path,
        password_hash=hashed_password
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {
        "message": "✅ Student created successfully",
        "student": {
            "id": new_student.student_id,
            "name": new_student.student_name,
            "email": new_student.email,
            "faculty_id": new_student.faculty_id,
        }
    }

# ----------------------------
# 4️⃣ Create a New Lecturer
# ----------------------------
@router.post("/create-lecturer", tags=["Admin"])
def create_lecturer(
    lecturer_name: str,
    email: str,
    department: str,
    faculty_id: int,
    password: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    verify_admin(user)

    # Check for duplicate email
    existing_email = db.query(Lecturers).filter(Lecturers.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = pwd_context.hash(password)

    new_lecturer = Lecturers(
        lecturer_name=lecturer_name,
        email=email,
        department=department,
        faculty_id=faculty_id,
        password_hash=hashed_password
    )

    db.add(new_lecturer)
    db.commit()
    db.refresh(new_lecturer)

    return {
        "message": "✅ Lecturer created successfully",
        "lecturer": {
            "id": new_lecturer.lecturer_id,
            "name": new_lecturer.lecturer_name,
            "email": new_lecturer.email,
            "department": new_lecturer.department,
        }
    }

# ----------------------------
# 5️⃣ Attendance Summary
# ----------------------------
@router.get("/attendance-summary", tags=["Admin"])
def attendance_summary(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    verify_admin(user)
    results = (
        db.query(
            Courses.course_name,
            Courses.course_code,
            Faculties.faculty_name,
        )
        .join(Faculties, Courses.faculty_id == Faculties.faculty_id)
        .all()
    )

    summary = []
    for course_name, course_code, faculty_name in results:
        total_records = db.query(Attendance).join(Courses).filter(Courses.course_code == course_code).count()
        present = (
            db.query(Attendance)
            .join(Courses)
            .filter(Courses.course_code == course_code, Attendance.status == "Present")
            .count()
        )
        late = (
            db.query(Attendance)
            .join(Courses)
            .filter(Courses.course_code == course_code, Attendance.status == "Late")
            .count()
        )
        absent = (
            db.query(Attendance)
            .join(Courses)
            .filter(Courses.course_code == course_code, Attendance.status == "Absent")
            .count()
        )
        summary.append({
            "course_name": course_name,
            "course_code": course_code,
            "faculty_name": faculty_name,
            "total_records": total_records,
            "present": present,
            "late": late,
            "absent": absent,
            "attendance_rate": round(((present + late) / total_records * 100) if total_records else 0, 2)
        })

    return {"summary": summary}
