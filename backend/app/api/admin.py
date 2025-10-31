
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import SessionLocal
from app.models import Students, Lecturers, Courses, Attendance, Faculties
from app.auth_utils import get_current_user
from datetime import datetime, date, time

router = APIRouter()
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
def verify_admin(user: dict, db: Session):
    """
    Ensures the current user is a lecturer with admin privileges.
    """
    lecturer = db.query(Lecturers).filter(Lecturers.email == user["email"]).first()
    if not lecturer or not lecturer.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )


# ----------------------------
# 1️⃣ View All Students
# ----------------------------
@router.get("/students", tags=["Admin"])
def list_students(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    verify_admin(user, db)
    students = db.query(Students).all()
    return {"total_students": len(students), "students": students}


# ----------------------------
# 2️⃣ View All Lecturers
# ----------------------------
@router.get("/lecturers", tags=["Admin"])
def list_lecturers(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    verify_admin(user, db)
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
    user: dict = Depends(get_current_user),
):
    verify_admin(user, db)

    # Check for duplicate
    if db.query(Students).filter(
        (Students.email == email) | (Students.reg_number == reg_number)
    ).first():
        raise HTTPException(
            status_code=400, detail="Email or registration number already exists"
        )

    hashed_password = pwd_context.hash(password)
    new_student = Students(
        student_name=student_name,
        reg_number=reg_number,
        email=email,
        year_of_study=year_of_study,
        faculty_id=faculty_id,
        image_path=image_path,
        password_hash=hashed_password,
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return {"message": "✅ Student created successfully", "student": new_student}


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
    is_admin: bool = False,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    verify_admin(user, db)

    if db.query(Lecturers).filter(Lecturers.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = pwd_context.hash(password)
    new_lecturer = Lecturers(
        lecturer_name=lecturer_name,
        email=email,
        department=department,
        faculty_id=faculty_id,
        password_hash=hashed_password,
        is_admin=is_admin,
    )
    db.add(new_lecturer)
    db.commit()
    db.refresh(new_lecturer)

    return {"message": "✅ Lecturer created successfully", "lecturer": new_lecturer}


# ----------------------------
# 5️⃣ Attendance Summary
# ----------------------------
@router.get("/attendance-summary", tags=["Admin"])
def attendance_summary(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    verify_admin(user, db)

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
        total_records = (
            db.query(Attendance)
            .join(Courses)
            .filter(Courses.course_code == course_code)
            .count()
        )
        present = (
            db.query(Attendance)
            .join(Courses)
            .filter(
                Courses.course_code == course_code, Attendance.status == "Present"
            )
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

        summary.append(
            {
                "course_name": course_name,
                "course_code": course_code,
                "faculty_name": faculty_name,
                "total_records": total_records,
                "present": present,
                "late": late,
                "absent": absent,
                "attendance_rate": round(
                    ((present + late) / total_records * 100) if total_records else 0, 2
                ),
            }
        )
    return {"summary": summary}


# ----------------------------
# 6️⃣ Add / Delete Attendance (Admin Control)
# ----------------------------
@router.post("/attendance/add", tags=["Admin"])
def add_attendance(
    student_id: int,
    course_id: int,
    status: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    verify_admin(user, db)

    record = Attendance(
        student_id=student_id,
        course_id=course_id,
        date=date.today(),
        time_in=datetime.now().time(),
        status=status,
        recognized_face=False,
        verified_by_admin=True,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {"message": "✅ Attendance added manually", "data": record}


@router.delete("/attendance/delete/{attendance_id}", tags=["Admin"])
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    verify_admin(user, db)
    record = (
        db.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    db.delete(record)
    db.commit()
    return {"message": "🗑️ Attendance record deleted successfully"}
