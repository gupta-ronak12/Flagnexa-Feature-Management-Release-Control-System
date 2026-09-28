from fastapi import FastAPI
from fastapi.responses import FileResponse

from app.routers.feature_flags import router as feature_flags_router
from app.routers.auth import router as auth_router
from app.routers.environment_override import router as environment_override_router
from app.routers import flag_evaluation
from app.routers import environments
from app.routers import user_groups
from app.routers import targeting_rules


app = FastAPI(
    title="Feature Management System",
    description="Web-based Feature Flag Management System with Release Control Assistance",
    version="1.0.0",
)


# API ROUTES
app.include_router(feature_flags_router)
app.include_router(auth_router)
app.include_router(environment_override_router)
app.include_router(flag_evaluation.router)
app.include_router(environments.router)
app.include_router(user_groups.router)
app.include_router(targeting_rules.router)


# FRONTEND PAGES

@app.get("/")
def root():
    return FileResponse("frontend/login.html")


@app.get("/login")
def login_page():
    return FileResponse("frontend/login.html")


@app.get("/signup")
def signup_page():
    return FileResponse("frontend/signup.html")


@app.get("/home")
def home_page():
    return FileResponse("frontend/home.html")