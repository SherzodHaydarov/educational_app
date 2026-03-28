from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path

from app.core.security import (
    SESSION_COOKIE,
    make_session_token,
    verify_credentials,
    verify_session_token,
)

BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

router = APIRouter(tags=["Auth"])


@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    # Agar allaqachon kirgan bo'lsa — home ga yo'naltir
    token = request.cookies.get(SESSION_COOKIE)
    if token and verify_session_token(token):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse("login.html", {"request": request, "error": None})


@router.post("/login", response_class=HTMLResponse)
def login_submit(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    if verify_credentials(username, password):
        token = make_session_token(username)
        response = RedirectResponse(url="/", status_code=302)
        response.set_cookie(
            key=SESSION_COOKIE,
            value=token,
            httponly=True,       # JS orqali o'qib bo'lmaydi
            samesite="lax",
            max_age=60 * 60 * 8, # 8 soat
        )
        return response

    return templates.TemplateResponse(
        "login.html",
        {"request": request, "error": "Username yoki parol noto'g'ri"},
        status_code=401,
    )


@router.get("/logout")
def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie(SESSION_COOKIE)
    return response