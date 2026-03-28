import hashlib
import hmac
import os
from functools import lru_cache

from dotenv import load_dotenv
from fastapi import Cookie, HTTPException
from fastapi.responses import RedirectResponse

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "EduCenter")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Volidam@")
SESSION_COOKIE = "edu_session"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_session_token(username: str) -> str:
    msg = f"{username}:{SECRET_KEY}"
    return hmac.new(SECRET_KEY.encode(), msg.encode(), hashlib.sha256).hexdigest()


def verify_credentials(username: str, password: str) -> bool:
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD


def verify_session_token(token: str) -> bool:
    expected = make_session_token(ADMIN_USERNAME)
    return hmac.compare_digest(token, expected)


def require_auth(edu_session: str | None = Cookie(default=None)) -> str:
    if not edu_session or not verify_session_token(edu_session):
        raise HTTPException(status_code=302, headers={"Location": "/login"})
    return edu_session