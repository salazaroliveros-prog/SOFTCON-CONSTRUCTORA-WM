from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from jose import jwt
from passlib.hash import pbkdf2_sha256
from passlib.hash import bcrypt as passlib_bcrypt
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def _get_secret_key() -> str:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        raise RuntimeError(
            "Missing SECRET_KEY env var. Set it in backend/.env (do not hardcode in code)."
        )
    return secret.strip().strip('"').strip("'")


def _get_algorithm() -> str:
    value = os.getenv("JWT_ALGORITHM", "HS256")
    return value.strip().strip('"').strip("'")


def _get_expire_minutes() -> int:
    raw = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")
    raw = raw.strip().strip('"').strip("'")
    try:
        value = int(raw)
    except ValueError as exc:
        raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be an integer") from exc
    return value


def hash_password(password: str) -> str:
    return pbkdf2_sha256.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Accept both new PBKDF2 hashes and legacy bcrypt hashes.
    try:
        if hashed_password.startswith("$pbkdf2-sha256$"):
            return pbkdf2_sha256.verify(plain_password, hashed_password)
        if hashed_password.startswith("$2"):
            return passlib_bcrypt.verify(plain_password, hashed_password)
        return pbkdf2_sha256.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(data: dict[str, Any]) -> str:
    to_encode = dict(data)
    expire = datetime.utcnow() + timedelta(minutes=_get_expire_minutes())
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, _get_secret_key(), algorithm=_get_algorithm())


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, _get_secret_key(), algorithms=[_get_algorithm()])


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el acceso",
    )

    try:
        payload = decode_access_token(token)
        username: str | None = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.Usuario).filter(models.Usuario.username == username).first()
    if user is None:
        raise credentials_exception
    if hasattr(user, "is_active") and not bool(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario desactivado",
        )
    if hasattr(user, "is_approved") and not bool(user.is_approved):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario pendiente de aprobación",
        )
    return user


def RoleChecker(allowed_roles: list[str]):
    allowed = set(allowed_roles)

    def role_checker(user: models.Usuario = Depends(get_current_user)) -> models.Usuario:
        if (user.rol or "") not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos suficientes para esta acción",
            )
        return user

    return role_checker
