
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import auth, attendance, admin  # ✅ Added Admin module

# ------------------------------------------------------------
# APP METADATA
# ------------------------------------------------------------
app = FastAPI(
    title="AI Attendance Tracker API",
    description="""
An AI-powered attendance tracking system integrating facial recognition, 
CommCare data sync, and Power BI dashboards.
This API supports authentication, attendance management, 
and admin-level analytics and controls.
""",
    version="1.1.0",
    contact={
        "name": "AI Attendance Tracker Dev Team",
        "email": "support@aiattendance.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# ------------------------------------------------------------
# CORS SETUP (important for React frontend & Power BI integration)
# ------------------------------------------------------------
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-frontend-domain.com",  # Optional: add your hosted frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# ROUTE REGISTRATION
# ------------------------------------------------------------
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])  # ✅ Added Admin routes

# ------------------------------------------------------------
# GLOBAL EXCEPTION HANDLER (clean and standardized responses)
# ------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error. Please contact support.",
            "error": str(exc),
            "path": str(request.url),
        },
    )

# ------------------------------------------------------------
# HEALTH CHECK ROUTE
# ------------------------------------------------------------
@app.get("/", tags=["Root"])
def read_root():
    """
    Root endpoint — confirms API is live and reachable.
    """
    return {
        "message": "✅ Welcome to the AI Attendance Tracker API",
        "status": "running",
        "docs_url": "/docs",
        "version": "1.1.0"
    }
