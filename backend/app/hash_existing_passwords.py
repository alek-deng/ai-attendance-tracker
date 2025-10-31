from app.database import SessionLocal
from app.models import Students, Lecturers
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

def hash_password(password: str):
    return pwd_context.hash(password)

try:
    # ✅ Hash all lecturers’ passwords
    lecturers = db.query(Lecturers).all()
    for lecturer in lecturers:
        if lecturer.password_hash and not lecturer.password_hash.startswith("$2b$"):
            lecturer.password_hash = hash_password(lecturer.password_hash)

    # ✅ Hash all students’ passwords
    students = db.query(Students).all()
    for student in students:
        if student.password_hash and not student.password_hash.startswith("$2b$"):
            student.password_hash = hash_password(student.password_hash)

    db.commit()
    print("✅ Successfully hashed all plaintext passwords.")
except Exception as e:
    print("❌ Error while hashing passwords:", e)
finally:
    db.close()
