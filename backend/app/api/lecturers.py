# backend/app/routes/lecturers.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db

router = APIRouter(
    prefix="/lecturers",
    tags=["Lecturers"]
)

@router.get("/")
def get_lecturers(db: Session = Depends(get_db)):
    lecturers = db.query(models.Lecturer).all()
    return lecturers

@router.get("/{lecturer_id}")
def get_lecturer(lecturer_id: int, db: Session = Depends(get_db)):
    lecturer = db.query(models.Lecturer).filter(models.Lecturer.lecturer_id == lecturer_id).first()
    if not lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")
    return lecturer
