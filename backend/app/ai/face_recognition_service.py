from deepface import DeepFace
import cv2
import os
import uuid
from datetime import datetime
from app.database import SessionLocal
from app.models import Students, Attendance

# ------------------------------------------------------------
# DIRECTORY SETUP
# ------------------------------------------------------------
# Folders for known faces and captured images
KNOWN_FACES_DIR = "images/faces"
CAPTURED_DIR = "images/captured"

# Make sure the folders exist
os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
os.makedirs(CAPTURED_DIR, exist_ok=True)

# ------------------------------------------------------------
# DATABASE CONNECTION
# ------------------------------------------------------------
db = SessionLocal()

# ------------------------------------------------------------
# FACE RECOGNITION LOGIC
# ------------------------------------------------------------
def recognize_face():
    """
    Capture a face from webcam, compare it with known faces in the system,
    and mark attendance automatically if a match is found.
    """

    # Open camera (0 = default webcam)
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()

    if not ret:
        cap.release()
        return {"status": "error", "message": "Unable to access camera"}

    # Save captured frame temporarily
    captured_path = os.path.join(CAPTURED_DIR, f"{uuid.uuid4()}.jpg")
    cv2.imwrite(captured_path, frame)
    cap.release()

    try:
        # Loop through known faces
        for file in os.listdir(KNOWN_FACES_DIR):
            known_path = os.path.join(KNOWN_FACES_DIR, file)

            # Compare face with DeepFace
            result = DeepFace.verify(
                img1_path=captured_path,
                img2_path=known_path,
                model_name="VGG-Face",  # You can use "Facenet" or "ArcFace" too
                enforce_detection=False
            )

            if result["verified"]:
                student_name = os.path.splitext(file)[0].replace("_", " ")
                print(f"✅ Match found: {student_name}")

                # Find student in database
                student = db.query(Students).filter(Students.student_name == student_name).first()

                if student:
                    # Create attendance record
                    new_record = Attendance(
                        student_id=student.student_id,
                        course_id=1,  # temporary placeholder
                        date=datetime.now().date(),
                        time_in=datetime.now().time(),
                        status="Present",
                        recognized_face=True
                    )
                    db.add(new_record)
                    db.commit()

                    return {
                        "status": "success",
                        "student": student_name,
                        "confidence": round(result["distance"], 4)
                    }

        return {"status": "not_found", "message": "No face match found"}

    except Exception as e:
        return {"status": "error", "message": str(e)}
