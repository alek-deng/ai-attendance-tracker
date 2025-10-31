# backend/app/routes/courses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)

@router.get("/")
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(models.Course).all()
    return courses

@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
