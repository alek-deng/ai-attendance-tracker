from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Attendance, Students, Courses
from app.auth_utils import get_current_user

router = APIRouter()

# Dependency: database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# Protected endpoint for marking attendance (lecturer only)
# ----------------------------
@router.post("/mark")
def mark_attendance(
    student_id: int,
    course_id: int,
    status: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    # Role-based restriction
    if user["role"] != "lecturer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Lecturer only")

    # Check if student & course exist
    student = db.query(Students).filter(Students.student_id == student_id).first()
    course = db.query(Courses).filter(Courses.course_id == course_id).first()

    if not student or not course:
        raise HTTPException(status_code=404, detail="Student or Course not found")

    attendance = Attendance(student_id=student_id, course_id=course_id, status=status)
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return {"message": "Attendance marked successfully", "attendance_id": attendance.attendance_id}


# ----------------------------
# Protected endpoint for viewing attendance (student only)
# ----------------------------
@router.get("/my-attendance")
def view_my_attendance(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if user["role"] != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Students only")

    student = db.query(Students).filter(Students.email == user["sub"]).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    attendance_records = db.query(Attendance).filter(Attendance.student_id == student.student_id).all()
    return {"email": user["sub"], "records": attendance_records}
