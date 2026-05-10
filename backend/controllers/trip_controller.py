"""
Trip Controller
Full CRUD for Trips, Destinations, Activities, Bookings, Expenses,
PackingItems, TripNotes — all fields from schema v4.
"""
import uuid
from datetime import date, datetime

from models import (
    Activity,
    AuditLog,
    Booking,
    Destination,
    Expense,
    PackingItem,
    Trip,
    TripNote,
    db,
)
from flask import request


# ── helpers ──────────────────────────────────────────────────────────────

def _log(action, user_id=None, table='trips', record_id=None, fields=None):
    db.session.add(AuditLog(
        user_id=user_id,
        action=action,
        table_name=table,
        record_id=record_id,
        changed_fields=fields,
        ip_address=request.remote_addr,
        user_agent=(request.user_agent.string[:500] if request.user_agent else None),
    ))


def _parse_date(val):
    if not val:
        return None
    if isinstance(val, date):
        return val
    return datetime.strptime(val, '%Y-%m-%d').date()


def _parse_datetime(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    return datetime.fromisoformat(val)


# ════════════════════════════════════════════════════════════════
# TRIPS
# ════════════════════════════════════════════════════════════════

def get_trips(user_id: int):
    trips = Trip.query.filter_by(user_id=user_id).order_by(Trip.created_at.desc()).all()
    return {'trips': [t.to_dict() for t in trips], 'total': len(trips)}, 200


def get_trip(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    return {'trip': trip.to_dict()}, 200


def get_public_trip(share_token: str):
    trip = Trip.query.filter_by(share_token=share_token, is_public=True).first()
    if not trip:
        return {'error': 'Trip not found or not public'}, 404
    return {'trip': trip.to_dict()}, 200


def create_trip(user_id: int, data: dict):
    if not data.get('trip_name'):
        return {'error': 'trip_name is required'}, 400

    is_public = bool(data.get('is_public', False))
    share_token = str(uuid.uuid4()) if is_public else None

    trip = Trip(
        user_id=user_id,
        trip_name=data['trip_name'][:150],
        start_date=_parse_date(data.get('start_date')),
        end_date=_parse_date(data.get('end_date')),
        budget=data.get('budget'),
        currency=data.get('currency', 'USD')[:3],
        status=data.get('status', 'planning'),
        cover_photo_url=data.get('cover_photo_url'),
        is_public=is_public,
        share_token=share_token,
    )
    db.session.add(trip)
    db.session.flush()
    _log('INSERT', user_id=user_id, record_id=trip.trip_id,
         fields={'trip_name': trip.trip_name})
    db.session.commit()
    return {'trip': trip.to_dict()}, 201


def update_trip(trip_id: int, user_id: int, data: dict):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404

    allowed = ('trip_name', 'start_date', 'end_date', 'budget', 'currency',
               'status', 'cover_photo_url', 'is_public')
    changed = {}
    for f in allowed:
        if f not in data:
            continue
        if f in ('start_date', 'end_date'):
            setattr(trip, f, _parse_date(data[f]))
        else:
            setattr(trip, f, data[f])
        changed[f] = data[f]

    # keep share_token consistent with is_public
    if 'is_public' in data:
        if data['is_public'] and not trip.share_token:
            trip.share_token = str(uuid.uuid4())
        elif not data['is_public']:
            trip.share_token = None

    _log('UPDATE', user_id=user_id, record_id=trip_id, fields=changed)
    db.session.commit()
    return {'trip': trip.to_dict()}, 200


def delete_trip(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    _log('DELETE', user_id=user_id, record_id=trip_id)
    db.session.delete(trip)
    db.session.commit()
    return {'message': 'Trip deleted'}, 200


# ════════════════════════════════════════════════════════════════
# DESTINATIONS
# ════════════════════════════════════════════════════════════════

def get_destinations(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    dests = Destination.query.filter_by(trip_id=trip_id).order_by(
        Destination.sequence_order).all()
    return {'destinations': [d.to_dict() for d in dests]}, 200


def create_destination(trip_id: int, user_id: int, data: dict):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    dest = Destination(
        trip_id=trip_id,
        city=data.get('city'),
        country=data.get('country'),
        country_code=(data.get('country_code') or '')[:2] or None,
        arrival_date=_parse_date(data.get('arrival_date')),
        departure_date=_parse_date(data.get('departure_date')),
        sequence_order=data.get('sequence_order', 10),
        description=data.get('description'),
    )
    db.session.add(dest)
    db.session.flush()
    _log('INSERT', user_id=user_id, table='destinations', record_id=dest.destination_id)
    db.session.commit()
    return {'destination': dest.to_dict()}, 201


def update_destination(destination_id: int, user_id: int, data: dict):
    dest = Destination.query.join(Trip).filter(
        Destination.destination_id == destination_id,
        Trip.user_id == user_id,
    ).first()
    if not dest:
        return {'error': 'Destination not found'}, 404

    for f in ('city', 'country', 'country_code', 'sequence_order', 'description'):
        if f in data:
            setattr(dest, f, data[f])
    for f in ('arrival_date', 'departure_date'):
        if f in data:
            setattr(dest, f, _parse_date(data[f]))

    _log('UPDATE', user_id=user_id, table='destinations', record_id=destination_id)
    db.session.commit()
    return {'destination': dest.to_dict()}, 200


def delete_destination(destination_id: int, user_id: int):
    dest = Destination.query.join(Trip).filter(
        Destination.destination_id == destination_id,
        Trip.user_id == user_id,
    ).first()
    if not dest:
        return {'error': 'Destination not found'}, 404
    _log('DELETE', user_id=user_id, table='destinations', record_id=destination_id)
    db.session.delete(dest)
    db.session.commit()
    return {'message': 'Destination deleted'}, 200


# ════════════════════════════════════════════════════════════════
# ACTIVITIES
# ════════════════════════════════════════════════════════════════

def get_activities(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    acts = Activity.query.filter_by(trip_id=trip_id).order_by(
        Activity.date, Activity.start_time).all()
    return {'activities': [a.to_dict(include_sensitive=True) for a in acts]}, 200


def create_activity(trip_id: int, user_id: int, data: dict):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    act = Activity(
        trip_id=trip_id,
        destination_id=data.get('destination_id'),
        activity_name=data.get('activity_name'),
        date=_parse_date(data.get('date')),
        start_time=data.get('start_time'),      # 'HH:MM:SS' string; SQLAlchemy coerces
        location=data.get('location'),
        cost=data.get('cost'),
        activity_type=data.get('activity_type', 'other'),
        duration_mins=data.get('duration_mins'),
        notes=data.get('notes'),
    )
    db.session.add(act)
    db.session.flush()
    _log('INSERT', user_id=user_id, table='activities', record_id=act.activity_id)
    db.session.commit()
    return {'activity': act.to_dict(include_sensitive=True)}, 201


def update_activity(activity_id: int, user_id: int, data: dict):
    act = Activity.query.join(Trip).filter(
        Activity.activity_id == activity_id,
        Trip.user_id == user_id,
    ).first()
    if not act:
        return {'error': 'Activity not found'}, 404

    scalar_fields = ('destination_id', 'activity_name', 'start_time', 'location',
                     'cost', 'activity_type', 'duration_mins', 'notes')
    for f in scalar_fields:
        if f in data:
            setattr(act, f, data[f])
    if 'date' in data:
        act.date = _parse_date(data['date'])

    _log('UPDATE', user_id=user_id, table='activities', record_id=activity_id)
    db.session.commit()
    return {'activity': act.to_dict(include_sensitive=True)}, 200


def delete_activity(activity_id: int, user_id: int):
    act = Activity.query.join(Trip).filter(
        Activity.activity_id == activity_id,
        Trip.user_id == user_id,
    ).first()
    if not act:
        return {'error': 'Activity not found'}, 404
    _log('DELETE', user_id=user_id, table='activities', record_id=activity_id)
    db.session.delete(act)
    db.session.commit()
    return {'message': 'Activity deleted'}, 200


# ════════════════════════════════════════════════════════════════
# BOOKINGS
# ════════════════════════════════════════════════════════════════

def get_bookings(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    bookings = Booking.query.filter_by(trip_id=trip_id).order_by(Booking.check_in).all()
    return {'bookings': [b.to_dict() for b in bookings]}, 200


def create_booking(trip_id: int, user_id: int, data: dict):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    booking = Booking(
        trip_id=trip_id,
        booking_type=data.get('booking_type'),
        provider=data.get('provider'),
        booking_date=_parse_date(data.get('booking_date')),
        check_in=_parse_datetime(data.get('check_in')),
        check_out=_parse_datetime(data.get('check_out')),
        cost=data.get('cost'),
        currency=data.get('currency', 'USD')[:3],
        exchange_rate=data.get('exchange_rate', 1.0),
        base_amount=data.get('base_amount'),
        status=data.get('status', 'pending'),
        expense_id=data.get('expense_id'),
        # reference_number_enc/iv set by app encryption layer, not here
    )
    db.session.add(booking)
    db.session.flush()
    _log('INSERT', user_id=user_id, table='bookings', record_id=booking.booking_id)
    db.session.commit()
    return {'booking': booking.to_dict()}, 201


def update_booking(booking_id: int, user_id: int, data: dict):
    booking = Booking.query.join(Trip).filter(
        Booking.booking_id == booking_id,
        Trip.user_id == user_id,
    ).first()
    if not booking:
        return {'error': 'Booking not found'}, 404

    scalar_fields = ('booking_type', 'provider', 'cost', 'currency',
                     'exchange_rate', 'base_amount', 'status', 'expense_id')
    for f in scalar_fields:
        if f in data:
            setattr(booking, f, data[f])
    for f in ('booking_date',):
        if f in data:
            setattr(booking, f, _parse_date(data[f]))
    for f in ('check_in', 'check_out'):
        if f in data:
            setattr(booking, f, _parse_datetime(data[f]))

    _log('UPDATE', user_id=user_id, table='bookings', record_id=booking_id)
    db.session.commit()
    return {'booking': booking.to_dict()}, 200


def delete_booking(booking_id: int, user_id: int):
    booking = Booking.query.join(Trip).filter(
        Booking.booking_id == booking_id,
        Trip.user_id == user_id,
    ).first()
    if not booking:
        return {'error': 'Booking not found'}, 404
    _log('DELETE', user_id=user_id, table='bookings', record_id=booking_id)
    db.session.delete(booking)
    db.session.commit()
    return {'message': 'Booking deleted'}, 200


# ════════════════════════════════════════════════════════════════
# EXPENSES
# ════════════════════════════════════════════════════════════════

def get_expenses(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    expenses = Expense.query.filter_by(trip_id=trip_id).order_by(Expense.expense_date).all()
    return {'expenses': [e.to_dict(include_sensitive=True) for e in expenses]}, 200


def create_expense(trip_id: int, user_id: int, data: dict):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    expense = Expense(
        trip_id=trip_id,
        category=data.get('category'),
        amount=data.get('amount'),
        currency=data.get('currency', 'USD')[:3],
        exchange_rate=data.get('exchange_rate', 1.0),
        base_amount=data.get('base_amount'),
        expense_date=_parse_date(data.get('expense_date')),
        description=data.get('description'),
        booking_id=data.get('booking_id'),
    )
    db.session.add(expense)
    db.session.flush()
    _log('INSERT', user_id=user_id, table='expenses', record_id=expense.expense_id)
    db.session.commit()
    return {'expense': expense.to_dict(include_sensitive=True)}, 201


def update_expense(expense_id: int, user_id: int, data: dict):
    expense = Expense.query.join(Trip).filter(
        Expense.expense_id == expense_id,
        Trip.user_id == user_id,
    ).first()
    if not expense:
        return {'error': 'Expense not found'}, 404

    scalar_fields = ('category', 'amount', 'currency', 'exchange_rate',
                     'base_amount', 'description', 'booking_id')
    for f in scalar_fields:
        if f in data:
            setattr(expense, f, data[f])
    if 'expense_date' in data:
        expense.expense_date = _parse_date(data['expense_date'])

    _log('UPDATE', user_id=user_id, table='expenses', record_id=expense_id)
    db.session.commit()
    return {'expense': expense.to_dict(include_sensitive=True)}, 200


def delete_expense(expense_id: int, user_id: int):
    expense = Expense.query.join(Trip).filter(
        Expense.expense_id == expense_id,
        Trip.user_id == user_id,
    ).first()
    if not expense:
        return {'error': 'Expense not found'}, 404
    _log('DELETE', user_id=user_id, table='expenses', record_id=expense_id)
    db.session.delete(expense)
    db.session.commit()
    return {'message': 'Expense deleted'}, 200


# ════════════════════════════════════════════════════════════════
# PACKING ITEMS
# ════════════════════════════════════════════════════════════════

def get_packing_items(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    items = PackingItem.query.filter_by(trip_id=trip_id).order_by(PackingItem.category).all()
    return {'packing_items': [i.to_dict() for i in items]}, 200


def create_packing_item(trip_id: int, user_id: int, data: dict):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    if not data.get('item_name'):
        return {'error': 'item_name is required'}, 400
    item = PackingItem(
        trip_id=trip_id,
        item_name=data['item_name'][:100],
        category=data.get('category'),
        quantity=max(1, min(99, int(data.get('quantity', 1)))),
        is_packed=bool(data.get('is_packed', False)),
    )
    db.session.add(item)
    db.session.flush()
    _log('INSERT', user_id=user_id, table='packing_items', record_id=item.item_id)
    db.session.commit()
    return {'packing_item': item.to_dict()}, 201


def update_packing_item(item_id: int, user_id: int, data: dict):
    item = PackingItem.query.join(Trip).filter(
        PackingItem.item_id == item_id,
        Trip.user_id == user_id,
    ).first()
    if not item:
        return {'error': 'Packing item not found'}, 404

    for f in ('item_name', 'category', 'quantity', 'is_packed'):
        if f in data:
            setattr(item, f, data[f])

    _log('UPDATE', user_id=user_id, table='packing_items', record_id=item_id)
    db.session.commit()
    return {'packing_item': item.to_dict()}, 200


def delete_packing_item(item_id: int, user_id: int):
    item = PackingItem.query.join(Trip).filter(
        PackingItem.item_id == item_id,
        Trip.user_id == user_id,
    ).first()
    if not item:
        return {'error': 'Packing item not found'}, 404
    _log('DELETE', user_id=user_id, table='packing_items', record_id=item_id)
    db.session.delete(item)
    db.session.commit()
    return {'message': 'Item deleted'}, 200


# ════════════════════════════════════════════════════════════════
# TRIP NOTES  (encrypted — app layer handles enc/dec)
# ════════════════════════════════════════════════════════════════

def get_notes(trip_id: int, user_id: int):
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    notes = TripNote.query.filter_by(trip_id=trip_id).order_by(TripNote.created_at).all()
    return {'notes': [n.to_dict() for n in notes]}, 200


def create_note(trip_id: int, user_id: int, data: dict):
    """
    Expects 'content_enc' (Base64 string) and 'content_iv' (hex string)
    from the app encryption layer.
    """
    trip = Trip.query.filter_by(trip_id=trip_id, user_id=user_id).first()
    if not trip:
        return {'error': 'Trip not found'}, 404
    if not data.get('content_enc') or not data.get('content_iv'):
        return {'error': 'content_enc and content_iv are required'}, 400

    import base64
    note = TripNote(
        trip_id=trip_id,
        destination_id=data.get('destination_id'),
        content_enc=base64.b64decode(data['content_enc']),
        content_iv=bytes.fromhex(data['content_iv']),
        is_sensitive=bool(data.get('is_sensitive', False)),
    )
    db.session.add(note)
    db.session.flush()
    _log('INSERT', user_id=user_id, table='trip_notes', record_id=note.note_id)
    db.session.commit()
    return {'note': note.to_dict()}, 201


def delete_note(note_id: int, user_id: int):
    note = TripNote.query.join(Trip).filter(
        TripNote.note_id == note_id,
        Trip.user_id == user_id,
    ).first()
    if not note:
        return {'error': 'Note not found'}, 404
    _log('DELETE', user_id=user_id, table='trip_notes', record_id=note_id)
    db.session.delete(note)
    db.session.commit()
    return {'message': 'Note deleted'}, 200
