from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from deepface import DeepFace
from app.database import SessionLocal
from app.models import Students, Attendance
from app.auth_utils import get_current_user  # ✅ Added
from datetime import datetime
import cv2
import numpy as np
import os

router = APIRouter()

# ----------------------------
# Database Dependency
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# FACE RECOGNITION ENDPOINT
# ----------------------------
@router.post("/recognize-face", tags=["Facial Recognition"])
async def recognize_face(
    file: UploadFile = File(...),
    course_id: int = None,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)  # ✅ Require login
):
    try:
        # Read uploaded image
        image_data = await file.read()
        np_image = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

        # Define faces folder
        known_faces_folder = "faces"
        if not os.path.exists(known_faces_folder):
            raise HTTPException(status_code=404, detail="No registered faces found")

        best_match = None
        highest_similarity = 0

        # Loop through stored faces
        for student in db.query(Students).filter(Students.image_path.isnot(None)).all():
            if not os.path.exists(student.image_path):
                continue

            try:
                result = DeepFace.verify(frame, student.image_path, model_name="VGG-Face", enforce_detection=False)
                similarity = result.get("distance", 1)
                if similarity < 0.4:  # lower = closer match
                    best_match = student
                    highest_similarity = 1 - similarity
                    break
            except Exception:
                continue

        if not best_match:
            raise HTTPException(status_code=404, detail="No face match found")

        # Record attendance
        existing_record = (
            db.query(Attendance)
            .filter(
                Attendance.student_id == best_match.student_id,
                Attendance.course_id == course_id,
                Attendance.date == datetime.now().date()
            )
            .first()
        )

        if existing_record:
            existing_record.status = "Present"
        else:
            new_record = Attendance(
                student_id=best_match.student_id,
                course_id=course_id,
                date=datetime.now().date(),
                time_in=datetime.now().time(),
                status="Present",
                recognized_face=True
            )
            db.add(new_record)

        db.commit()

        return {
            "message": "✅ Face recognized successfully",
            "student": {
                "id": best_match.student_id,
                "name": best_match.student_name,
                "email": best_match.email
            },
            "confidence": round(highest_similarity, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
