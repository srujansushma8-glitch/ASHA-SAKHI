"""
Authentication and Authorization module for ASHA Sakhi.
Implements cryptographically signed JWT tokens, secure PBKDF2 password hashing,
role-based access controls, and endpoint security dependencies.
"""

import os
import secrets
import hashlib
import hmac
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Callable, Set
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger("asha_sakhi.auth")

# Process-lifetime ephemeral key for development if JWT_SECRET_KEY is omitted in non-prod
_EPHEMERAL_DEV_SECRET: Optional[str] = None


def get_jwt_secret_key() -> str:
    """
    Retrieves the JWT secret key from environment variables or application settings.
    In production mode, strictly raises a RuntimeError if missing.
    In development mode, generates a secure process-lifetime ephemeral key if unset.
    """
    global _EPHEMERAL_DEV_SECRET
    key = (settings.JWT_SECRET_KEY or os.getenv("JWT_SECRET_KEY", "")).strip()
    if key:
        return key

    # Strict check for production environment
    if settings.APP_ENV.lower() in ("production", "prod"):
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY environment variable is required in production mode."
        )

    # Safe development fallback: generate cryptographically random 256-bit key
    if not _EPHEMERAL_DEV_SECRET:
        _EPHEMERAL_DEV_SECRET = secrets.token_urlsafe(32)
        logger.warning(
            "JWT_SECRET_KEY not set in environment. Generated ephemeral secret key for development session."
        )
    return _EPHEMERAL_DEV_SECRET


def hash_password(plain_password: str, iterations: int = 100_000) -> str:
    """
    Securely hashes a plaintext password using PBKDF2-HMAC-SHA256 with a unique salt.
    Format: pbkdf2_sha256${iterations}${salt_hex}${hash_hex}
    """
    if not plain_password:
        raise ValueError("Password cannot be empty.")
    salt = secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    )
    return f"pbkdf2_sha256${iterations}${salt}${derived.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Constant-time verification of a candidate plaintext password against a PBKDF2 hash.
    Protects against timing attacks.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = parts[2]
        expected_hex = parts[3]
        derived = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations,
        )
        return hmac.compare_digest(derived.hex(), expected_hex)
    except Exception:
        return False


# Preconfigured demo users with PBKDF2-HMAC-SHA256 hashed passwords (password: "password")
_DEFAULT_DEMO_HASH = "pbkdf2_sha256$100000$9b3f4e2a1d8c7b6a5f0e3d2c1b4a9f8e$8b8709a026564fc6e8729a906bf64bd3348084999d9b6e2a60fb9f29b8169ab6"

DEMO_USERS: Dict[str, Dict[str, Any]] = {
    "asha": {
        "username": "asha",
        "role": "asha",
        "name": "ASHA Field Worker (Sharada Bai)",
        "password_hash": _DEFAULT_DEMO_HASH,
    },
    "supervisor": {
        "username": "supervisor",
        "role": "supervisor",
        "name": "ANM Field Supervisor (Pushpalatha)",
        "password_hash": _DEFAULT_DEMO_HASH,
    },
    "anm": {
        "username": "anm",
        "role": "supervisor",
        "name": "ANM Field Supervisor (Pushpalatha)",
        "password_hash": _DEFAULT_DEMO_HASH,
    },
    "medical_officer": {
        "username": "medical_officer",
        "role": "medical_officer",
        "name": "PHC Medical Officer (Dr. Rajesh)",
        "password_hash": _DEFAULT_DEMO_HASH,
    },
    "mo": {
        "username": "mo",
        "role": "medical_officer",
        "name": "PHC Medical Officer (Dr. Rajesh)",
        "password_hash": _DEFAULT_DEMO_HASH,
    },
}

# Role hierarchy: higher privilege roles satisfy requirements for lower privilege roles
ROLE_HIERARCHY: Dict[str, Set[str]] = {
    "medical_officer": {"medical_officer", "supervisor", "asha", "mo", "anm"},
    "mo": {"medical_officer", "supervisor", "asha", "mo", "anm"},
    "supervisor": {"supervisor", "asha", "anm"},
    "anm": {"supervisor", "asha", "anm"},
    "asha": {"asha"},
}


# Request & Response Schemas
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Username")
    password: str = Field(..., min_length=1, description="Password")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    name: Optional[str] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a cryptographically signed JWT access token with exp, iat, and nbf."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,
        "jti": secrets.token_hex(16),
    })
    secret_key = get_jwt_secret_key()
    return jwt.encode(to_encode, secret_key, algorithm=settings.JWT_ALGORITHM)


security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and validates the Bearer JWT token.
    Raises HTTP 401 if token is missing, invalid, or expired.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials.strip()
    secret_key = get_jwt_secret_key()
    try:
        payload = jwt.decode(token, secret_key, algorithms=[settings.JWT_ALGORITHM])
        username: Optional[str] = payload.get("sub")
        role: Optional[str] = payload.get("role")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing subject.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {
            "username": username,
            "role": role or "asha",
            "name": payload.get("name", username),
        }
    except jwt.ExpiredSignatureError:
        logger.info("Authentication rejected: Expired token signature.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        logger.warning("Authentication rejected: Invalid JWT token signature or claims.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(*allowed_roles: str) -> Callable:
    """Dependency factory that restricts access to users with specified or higher roles."""
    async def role_checker(
        current_user: Dict[str, Any] = Depends(get_current_user)
    ) -> Dict[str, Any]:
        user_role = current_user.get("role", "asha")
        effective_roles = ROLE_HIERARCHY.get(user_role, {user_role})
        if not any(r in effective_roles for r in allowed_roles):
            logger.warning(
                f"Forbidden access: user '{current_user.get('username')}' with role '{user_role}' "
                f"denied access to resource requiring roles: {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """
    Authenticates users with valid credentials and issues signed JWT tokens.
    In production or if ENABLE_DEMO_AUTH is False, demo authentication is blocked.
    """
    # Check demo auth configuration
    if not settings.ENABLE_DEMO_AUTH or settings.APP_ENV.lower() in ("production", "prod"):
        logger.warning(
            f"Authentication rejected: demo authentication disabled in {settings.APP_ENV} mode."
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Demo authentication is disabled in production.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not req.password or not req.password.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Valid password is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username_key = req.username.lower().strip()
    user = DEMO_USERS.get(username_key)
    if not user:
        logger.warning(f"Failed login attempt for unknown user '{username_key}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify secure PBKDF2 password hash (no plaintext comparison, no demo bypasses)
    if not verify_password(req.password, user["password_hash"]):
        logger.warning(f"Failed login attempt for user '{username_key}' - invalid password.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={
            "sub": user["username"],
            "role": user["role"],
            "name": user["name"],
        }
    )
    logger.info(f"Successful authentication for user '{user['username']}' with role '{user['role']}'")
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user["role"],
        username=user["username"],
        name=user["name"],
    )


@router.get("/me")
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns authenticated user profile."""
    return {
        "username": current_user["username"],
        "role": current_user["role"],
        "name": current_user.get("name", current_user["username"]),
    }


@router.get("/supervisor-only")
async def supervisor_only_endpoint(
    user: Dict[str, Any] = Depends(require_role("supervisor")),
):
    """Endpoint accessible only by supervisor and higher (medical officer) roles."""
    return {"message": "Supervisor access granted", "user": user["username"], "role": user["role"]}


@router.get("/medical-officer-only")
async def medical_officer_only_endpoint(
    user: Dict[str, Any] = Depends(require_role("medical_officer")),
):
    """Endpoint accessible only by medical officer role."""
    return {"message": "Medical officer access granted", "user": user["username"], "role": user["role"]}
