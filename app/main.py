from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api import courses, payments, students, teachers
from app.api import auth
from app.core.security import SESSION_COOKIE, verify_session_token
from app.db.database import Base, engine
import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Educational Center Management")

BASE_DIR = Path(__file__).resolve().parent

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# ── Auth middleware ───────────────────────────────────────────
OPEN_PATHS = {"/login", "/logout"}

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path

    # Static fayllar va ochiq yo'llar — tekshirmasdan o'tkazish
    if path.startswith("/static") or path in OPEN_PATHS:
        return await call_next(request)

    # Session cookie tekshirish
    token = request.cookies.get(SESSION_COOKIE)
    if not token or not verify_session_token(token):
        return RedirectResponse(url="/login", status_code=302)

    return await call_next(request)

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(students.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(teachers.router, prefix="/api")
app.include_router(payments.router, prefix="/api")


# ── Pages ─────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("home.html", {
        "request": request,
        "center_name": "Bright Future Educational Center",
        "center_address": "Educational center, Karshi city, Kashkadarya region, Uzbekistan",
    })


@app.get("/students", response_class=HTMLResponse)
def students_page(request: Request):
    return templates.TemplateResponse("students.html", {"request": request})


@app.get("/courses", response_class=HTMLResponse)
def courses_page(request: Request):
    return templates.TemplateResponse("courses.html", {"request": request})


@app.get("/payments", response_class=HTMLResponse)
def payments_page(request: Request):
    return templates.TemplateResponse("payments.html", {"request": request})