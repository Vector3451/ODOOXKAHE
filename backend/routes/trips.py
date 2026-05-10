"""
Trip Routes  —  thin HTTP adapter.
Covers: Trips, Destinations, Activities, Bookings, Expenses, PackingItems, TripNotes.
All logic lives in controllers/trip_controller.py.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from controllers import trip_controller as ctrl

trips_bp = Blueprint('trips', __name__)


def _uid():
    return int(get_jwt_identity())


# ── Trips ────────────────────────────────────────────────────────────────

@trips_bp.route('/', methods=['GET'])
@jwt_required()
def get_trips():
    body, status = ctrl.get_trips(_uid())
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip(trip_id):
    body, status = ctrl.get_trip(trip_id, _uid())
    return jsonify(body), status


@trips_bp.route('/shared/<string:share_token>', methods=['GET'])
def get_public_trip(share_token):
    body, status = ctrl.get_public_trip(share_token)
    return jsonify(body), status


@trips_bp.route('/', methods=['POST'])
@jwt_required()
def create_trip():
    body, status = ctrl.create_trip(_uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>', methods=['PATCH'])
@jwt_required()
def update_trip(trip_id):
    body, status = ctrl.update_trip(trip_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    body, status = ctrl.delete_trip(trip_id, _uid())
    return jsonify(body), status


# ── Destinations ─────────────────────────────────────────────────────────

@trips_bp.route('/<int:trip_id>/destinations', methods=['GET'])
@jwt_required()
def get_destinations(trip_id):
    body, status = ctrl.get_destinations(trip_id, _uid())
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>/destinations', methods=['POST'])
@jwt_required()
def create_destination(trip_id):
    body, status = ctrl.create_destination(trip_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/destinations/<int:destination_id>', methods=['PATCH'])
@jwt_required()
def update_destination(destination_id):
    body, status = ctrl.update_destination(destination_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/destinations/<int:destination_id>', methods=['DELETE'])
@jwt_required()
def delete_destination(destination_id):
    body, status = ctrl.delete_destination(destination_id, _uid())
    return jsonify(body), status


# ── Activities ────────────────────────────────────────────────────────────

@trips_bp.route('/<int:trip_id>/activities', methods=['GET'])
@jwt_required()
def get_activities(trip_id):
    body, status = ctrl.get_activities(trip_id, _uid())
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>/activities', methods=['POST'])
@jwt_required()
def create_activity(trip_id):
    body, status = ctrl.create_activity(trip_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/activities/<int:activity_id>', methods=['PATCH'])
@jwt_required()
def update_activity(activity_id):
    body, status = ctrl.update_activity(activity_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/activities/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    body, status = ctrl.delete_activity(activity_id, _uid())
    return jsonify(body), status


# ── Bookings ──────────────────────────────────────────────────────────────

@trips_bp.route('/<int:trip_id>/bookings', methods=['GET'])
@jwt_required()
def get_bookings(trip_id):
    body, status = ctrl.get_bookings(trip_id, _uid())
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>/bookings', methods=['POST'])
@jwt_required()
def create_booking(trip_id):
    body, status = ctrl.create_booking(trip_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/bookings/<int:booking_id>', methods=['PATCH'])
@jwt_required()
def update_booking(booking_id):
    body, status = ctrl.update_booking(booking_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/bookings/<int:booking_id>', methods=['DELETE'])
@jwt_required()
def delete_booking(booking_id):
    body, status = ctrl.delete_booking(booking_id, _uid())
    return jsonify(body), status


# ── Expenses ──────────────────────────────────────────────────────────────

@trips_bp.route('/<int:trip_id>/expenses', methods=['GET'])
@jwt_required()
def get_expenses(trip_id):
    body, status = ctrl.get_expenses(trip_id, _uid())
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>/expenses', methods=['POST'])
@jwt_required()
def create_expense(trip_id):
    body, status = ctrl.create_expense(trip_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/expenses/<int:expense_id>', methods=['PATCH'])
@jwt_required()
def update_expense(expense_id):
    body, status = ctrl.update_expense(expense_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    body, status = ctrl.delete_expense(expense_id, _uid())
    return jsonify(body), status


# ── Packing Items ─────────────────────────────────────────────────────────

@trips_bp.route('/<int:trip_id>/packing', methods=['GET'])
@jwt_required()
def get_packing(trip_id):
    body, status = ctrl.get_packing_items(trip_id, _uid())
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>/packing', methods=['POST'])
@jwt_required()
def create_packing(trip_id):
    body, status = ctrl.create_packing_item(trip_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/packing/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_packing(item_id):
    body, status = ctrl.update_packing_item(item_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/packing/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_packing(item_id):
    body, status = ctrl.delete_packing_item(item_id, _uid())
    return jsonify(body), status


# ── Trip Notes ────────────────────────────────────────────────────────────

@trips_bp.route('/<int:trip_id>/notes', methods=['GET'])
@jwt_required()
def get_notes(trip_id):
    body, status = ctrl.get_notes(trip_id, _uid())
    return jsonify(body), status


@trips_bp.route('/<int:trip_id>/notes', methods=['POST'])
@jwt_required()
def create_note(trip_id):
    body, status = ctrl.create_note(trip_id, _uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@trips_bp.route('/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    body, status = ctrl.delete_note(note_id, _uid())
    return jsonify(body), status
