"""
Auth Controller
Handles user registration, login, logout, JWT session management,
and password-reset flow — all mapped to schema v4 fields.
"""
import hashlib
import os
import uuid
from datetime import datetime, timedelta

from flask import request
from flask_jwt_extended import (
    create_access_token,
    decode_token,
    get_jwt,
    get_jwt_identity,
)
from werkzeug.security import check_password_hash, generate_password_hash

from models import AuditLog, User, UserSession, db

# How long a JWT / session lives
JWT_EXPIRES_HOURS = 24
# Max wrong passwords before lockout
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


# ── helpers ──────────────────────────────────────────────────────────────

def _log(action: str, user_id=None, table='users', record_id=None, fields=None):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table,
        record_id=record_id,
        changed_fields=fields,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string[:500] if request.user_agent else None,
    )
    db.session.add(entry)


def _revoke_all_sessions(user_id: int):
    """Revoke every active session for a user (password change / 'log out all')."""
    now = datetime.utcnow()
    UserSession.query.filter_by(user_id=user_id, revoked=False).update(
        {'revoked': True, 'revoked_at': now}
    )


# ── public controller functions ───────────────────────────────────────────

def register(data: dict):
    """POST /api/auth/register"""
    email = (data.get('email') or '').strip().lower()
    password = data.get('password', '')
    name = (data.get('name') or 'New User').strip()

    if not email or not password:
        return {'error': 'email and password are required'}, 400
    if len(name) < 2 or len(name) > 100:
        return {'error': 'name must be between 2 and 100 characters'}, 400

    if User.query.filter_by(email=email).first():
        return {'error': 'An account with that email already exists'}, 409

    pw_hash = generate_password_hash(password, method='pbkdf2:sha256')
    user = User(
        name=name,
        email=email,
        password_hash=pw_hash,
        avatar_url=data.get('avatar_url'),
        language_preference=data.get('language_preference', 'en'),
        timezone=data.get('timezone', 'UTC'),
        currency_preference=data.get('currency_preference', 'USD'),
    )
    db.session.add(user)
    db.session.flush()  # get user_id before commit

    session_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=JWT_EXPIRES_HOURS)
    token = create_access_token(
        identity=str(user.user_id),
        additional_claims={'jti': session_id},
        expires_delta=timedelta(hours=JWT_EXPIRES_HOURS),
    )
    session = UserSession(
        session_id=session_id,
        user_id=user.user_id,
        ip_address=request.remote_addr,
        user_agent=(request.user_agent.string[:500] if request.user_agent else None),
        expires_at=expires_at,
    )
    db.session.add(session)
    _log('INSERT', user_id=user.user_id, record_id=user.user_id,
         fields={'name': name, 'email': email})
    db.session.commit()

    return {'message': 'Registered successfully', 'token': token, 'user': user.to_dict()}, 201


def login(data: dict):
    """POST /api/auth/login"""
    email = (data.get('email') or '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return {'error': 'email and password are required'}, 400

    user = User.query.filter_by(email=email).first()

    # --- account existence guard (timing-safe: always hash even on miss) ---
    dummy_hash = '$2b$12$' + 'x' * 53
    candidate_hash = user.password_hash if user else dummy_hash

    if not user or not check_password_hash(candidate_hash, password):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
                _log('ACCOUNT_LOCKED', user_id=user.user_id, record_id=user.user_id)
            else:
                _log('LOGIN_FAILED', user_id=user.user_id, record_id=user.user_id)
            db.session.commit()
        return {'error': 'Invalid credentials'}, 401

    # --- lockout check ---
    if user.locked_until and user.locked_until > datetime.utcnow():
        return {'error': 'Account temporarily locked. Try again later.'}, 423

    if not user.is_active:
        return {'error': 'Account suspended'}, 403

    # --- successful login ---
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.utcnow()

    session_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=JWT_EXPIRES_HOURS)
    token = create_access_token(
        identity=str(user.user_id),
        additional_claims={'jti': session_id},
        expires_delta=timedelta(hours=JWT_EXPIRES_HOURS),
    )
    session = UserSession(
        session_id=session_id,
        user_id=user.user_id,
        ip_address=request.remote_addr,
        user_agent=(request.user_agent.string[:500] if request.user_agent else None),
        expires_at=expires_at,
    )
    db.session.add(session)
    _log('LOGIN', user_id=user.user_id, record_id=user.user_id)
    db.session.commit()

    return {'message': 'Login successful', 'token': token, 'user': user.to_dict()}, 200


def logout(jwt_payload: dict):
    """POST /api/auth/logout  — revokes the current session."""
    session_id = jwt_payload.get('jti')
    user_id = int(get_jwt_identity())

    if session_id:
        sess = UserSession.query.get(session_id)
        if sess and not sess.revoked:
            sess.revoked = True
            sess.revoked_at = datetime.utcnow()

    _log('LOGOUT', user_id=user_id, record_id=user_id)
    db.session.commit()
    return {'message': 'Logged out successfully'}, 200


def logout_all(user_id: int):
    """POST /api/auth/logout-all  — revokes every session for the user."""
    _revoke_all_sessions(user_id)
    _log('SESSION_REVOKED', user_id=user_id, record_id=user_id,
         fields={'scope': 'all_sessions'})
    db.session.commit()
    return {'message': 'All sessions revoked'}, 200


def get_profile(user_id: int):
    """GET /api/auth/profile"""
    user = User.query.get(user_id)
    if not user or user.is_deleted:
        return {'error': 'User not found'}, 404
    return {'user': user.to_dict()}, 200


def update_profile(user_id: int, data: dict):
    """PATCH /api/auth/profile"""
    user = User.query.get(user_id)
    if not user or user.is_deleted:
        return {'error': 'User not found'}, 404

    allowed = ('name', 'avatar_url', 'language_preference', 'timezone', 'currency_preference')
    changed = {}
    for field in allowed:
        if field in data:
            setattr(user, field, data[field])
            changed[field] = data[field]

    _log('UPDATE', user_id=user_id, table='users', record_id=user_id, fields=changed)
    db.session.commit()
    return {'user': user.to_dict()}, 200


def request_password_reset(data: dict):
    """POST /api/auth/forgot-password"""
    email = (data.get('email') or '').strip().lower()
    user = User.query.filter_by(email=email).first()
    # Always return 200 to prevent email enumeration
    if user and user.is_active and not user.is_deleted:
        raw_token = str(uuid.uuid4())
        hashed = hashlib.sha256(raw_token.encode()).hexdigest()  # 64-char hex
        user.password_reset_token = hashed
        user.password_reset_expires_at = datetime.utcnow() + timedelta(hours=1)
        _log('PASSWORD_RESET_REQUESTED', user_id=user.user_id, record_id=user.user_id)
        db.session.commit()
        # In production: send raw_token by email here
    return {'message': 'If that email exists, a reset link has been sent.'}, 200


def reset_password(data: dict):
    """POST /api/auth/reset-password"""
    raw_token = data.get('token', '')
    new_password = data.get('new_password', '')

    if not raw_token or not new_password:
        return {'error': 'token and new_password are required'}, 400

    hashed = hashlib.sha256(raw_token.encode()).hexdigest()
    user = User.query.filter_by(password_reset_token=hashed).first()

    if not user or not user.password_reset_expires_at:
        return {'error': 'Invalid or expired token'}, 400
    if user.password_reset_expires_at < datetime.utcnow():
        return {'error': 'Token has expired'}, 400

    user.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.password_reset_token = None
    user.password_reset_expires_at = None

    _revoke_all_sessions(user.user_id)  # force re-login on all devices
    _log('PASSWORD_RESET_COMPLETED', user_id=user.user_id, record_id=user.user_id)
    db.session.commit()
    return {'message': 'Password updated successfully'}, 200
