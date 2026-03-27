from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api import courses, payments, students, teachers
from app.db.database import Base, engine
import app.models  # noqa: F401  Ensures model metadata is imported before create_all.

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Educational Center Management")

BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

app.include_router(students.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(teachers.router, prefix="/api")
app.include_router(payments.router, prefix="/api")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        "home.html",
        {
            "request": request,
            "center_name": "Bright Future Educational Center",
            "center_address": "1600 Amphitheatre Parkway, Mountain View, CA",
            "map_embed_url": (
                "https://www.google.com/maps?q=1600+Amphitheatre+Parkway,+Mountain+View,+CA"
                "&output=embed"
            ),
        },
    )


@app.get("/students", response_class=HTMLResponse)
def students_page(request: Request):
    return templates.TemplateResponse("students.html", {"request": request})


@app.get("/courses", response_class=HTMLResponse)
def courses_page(request: Request):
    return templates.TemplateResponse("courses.html", {"request": request})


@app.get("/payments", response_class=HTMLResponse)
def payments_page(request: Request):
    return templates.TemplateResponse("payments.html", {"request": request})
