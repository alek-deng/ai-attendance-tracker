# backend/app/routes/students.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

# GET all students
@router.get("/")
def get_students(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return students

# GET a single student by ID
@router.get("/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
