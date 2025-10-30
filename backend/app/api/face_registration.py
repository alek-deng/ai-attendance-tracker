from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Students
from app.auth_utils import get_current_user  # ✅ Added
import os
import shutil

router = APIRouter()

# ----------------------------
# Database dependency
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# Verify admin / lecturer privileges
# ----------------------------
def verify_admin(user: dict):
    if user["role"] != "lecturer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required (lecturer only)"
        )

# ----------------------------
# FACE REGISTRATION ENDPOINT
# ----------------------------
@router.post("/register-face", tags=["Facial Recognition"])
async def register_face(
    student_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)  # ✅ Require auth
):
    """
    📸 Upload a student's face photo, save it in /faces/,
    and update the student's image path in the database.
    Accessible only by lecturers/admins.
    """
    # Verify access
    verify_admin(user)

    # Find the student
    student = db.query(Students).filter(Students.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    faces_dir = "faces"
    os.makedirs(faces_dir, exist_ok=True)

    # Create safe filename
    file_ext = os.path.splitext(file.filename)[1]
    safe_name = f"{student.student_name.replace(' ', '_').lower()}{file_ext}"
    save_path = os.path.join(faces_dir, safe_name)

    try:
        # Save uploaded image
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Update DB with image path
        student.image_path = save_path
        db.commit()
        db.refresh(student)

        return {
            "message": "✅ Face registered successfully",
            "student": {
                "id": student.student_id,
                "name": student.student_name,
                "email": student.email,
            },
            "saved_path": save_path,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
