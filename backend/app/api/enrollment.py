from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Students, Courses, StudentCourse
from app.auth_utils import get_current_user

router = APIRouter()

# ----------------------------
# DB Dependency
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# Verify admin privileges
# ----------------------------
def verify_admin(user: dict):
    if user["role"] != "lecturer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required (lecturer only)"
        )

# ----------------------------
# Enroll a Student in a Course
# ----------------------------
@router.post("/enroll", tags=["Enrollment"])
def enroll_student(
    student_id: int,
    course_id: int,
    semester: str,
    year: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    verify_admin(user)

    # Ensure student and course exist
    student = db.query(Students).filter(Students.student_id == student_id).first()
    course = db.query(Courses).filter(Courses.course_id == course_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Prevent duplicate enrollment
    existing = (
        db.query(StudentCourse)
        .filter(StudentCourse.student_id == student_id, StudentCourse.course_id == course_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this course")

    # Create new enrollment
    enrollment = StudentCourse(
        student_id=student_id,
        course_id=course_id,
        semester=semester,
        year=year
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {
        "message": "✅ Student enrolled successfully",
        "student": student.student_name,
        "course": course.course_name,
        "semester": semester,
        "year": year
    }

# ----------------------------
# View All Enrollments
# ----------------------------
@router.get("/list", tags=["Enrollment"])
def list_enrollments(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    verify_admin(user)

    enrollments = (
        db.query(StudentCourse)
        .join(Students)
        .join(Courses)
        .with_entities(
            StudentCourse.id,
            Students.student_name,
            Courses.course_name,
            StudentCourse.semester,
            StudentCourse.year
        )
        .all()
    )

    return {"total_enrollments": len(enrollments), "enrollments": enrollments}
