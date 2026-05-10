"""
User Controller
Saved destinations, soft-delete, account management.
"""
from models import AuditLog, SavedDestination, User, db
from flask import request


def _log(action, user_id=None, table='users', record_id=None, fields=None):
    db.session.add(AuditLog(
        user_id=user_id,
        action=action,
        table_name=table,
        record_id=record_id,
        changed_fields=fields,
        ip_address=request.remote_addr,
        user_agent=(request.user_agent.string[:500] if request.user_agent else None),
    ))


# ════════════════════════════════════════════════════════════════
# SAVED DESTINATIONS
# ════════════════════════════════════════════════════════════════

def get_saved_destinations(user_id: int):
    saved = SavedDestination.query.filter_by(user_id=user_id).order_by(
        SavedDestination.saved_at.desc()).all()
    return {'saved_destinations': [s.to_dict() for s in saved]}, 200


def save_destination(user_id: int, data: dict):
    city_name = (data.get('city_name') or '').strip()
    if not city_name:
        return {'error': 'city_name is required'}, 400

    existing = SavedDestination.query.filter_by(
        user_id=user_id, city_name=city_name).first()
    if existing:
        return {'message': 'Already saved', 'saved_destination': existing.to_dict()}, 200

    entry = SavedDestination(
        user_id=user_id,
        city_name=city_name[:100],
        country_code=(data.get('country_code') or '')[:2] or None,
    )
    db.session.add(entry)
    _log('INSERT', user_id=user_id, table='saved_destinations',
         fields={'city_name': city_name})
    db.session.commit()
    return {'saved_destination': entry.to_dict()}, 201


def remove_saved_destination(user_id: int, city_name: str):
    entry = SavedDestination.query.filter_by(
        user_id=user_id, city_name=city_name).first()
    if not entry:
        return {'error': 'Saved destination not found'}, 404
    _log('DELETE', user_id=user_id, table='saved_destinations',
         fields={'city_name': city_name})
    db.session.delete(entry)
    db.session.commit()
    return {'message': 'Removed from saved destinations'}, 200


# ════════════════════════════════════════════════════════════════
# ACCOUNT MANAGEMENT
# ════════════════════════════════════════════════════════════════

def soft_delete_account(user_id: int):
    """
    GDPR right-to-erasure: anonymise PII fields then set is_deleted = True.
    The row is kept for audit-trail purposes (SOC 2).
    """
    user = User.query.get(user_id)
    if not user or user.is_deleted:
        return {'error': 'User not found'}, 404

    import uuid
    anon = f'deleted_{uuid.uuid4().hex}'
    user.name = anon[:100]
    user.email = f'{anon}@deleted.invalid'
    user.avatar_url = None
    user.password_hash = 'x' * 60          # invalidate login
    user.password_reset_token = None
    user.password_reset_expires_at = None
    user.is_deleted = True
    user.is_active = False
    from datetime import datetime
    user.deleted_at = datetime.utcnow()

    # revoke all sessions
    from models import UserSession
    from datetime import datetime as dt
    UserSession.query.filter_by(user_id=user_id, revoked=False).update(
        {'revoked': True, 'revoked_at': dt.utcnow()})

    _log('DELETE', user_id=user_id, table='users', record_id=user_id)
    db.session.commit()
    return {'message': 'Account deleted'}, 200
