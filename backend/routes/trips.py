from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models import db, Trip, Expense

trips_bp = Blueprint('trips', __name__)


@trips_bp.route('/', methods=['GET'])
@trips_bp.route('', methods=['GET'])
def get_trips():
    # Try to get user-specific trips if authenticated, else return all
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        user_id = None

    if user_id:
        trips = Trip.query.filter_by(user_id=int(user_id)).all()
    else:
        trips = Trip.query.all()

    return jsonify({
        "trips": [t.to_dict() for t in trips],
        "total": len(trips)
    }), 200


@trips_bp.route('/', methods=['POST'])
@trips_bp.route('', methods=['POST'])
@jwt_required()
def create_trip():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    # Accept both camelCase (legacy) and snake_case (v4) field names
    title = data.get('title') or data.get('trip_name', 'Untitled Trip')
    destinations = data.get('destinations', '')
    start_date = data.get('startDate') or data.get('start_date')
    end_date = data.get('endDate') or data.get('end_date')
    total_budget = data.get('totalBudget') or data.get('budget', 0.0)
    status = data.get('status', 'planning')
    cover_image = data.get('coverImage') or data.get('cover_photo_url')

    new_trip = Trip(
        user_id=user_id,
        title=title,
        destinations=destinations,
        total_budget=total_budget,
        status=status,
        cover_image=cover_image,
    )

    # Handle date parsing gracefully
    if start_date:
        try:
            from datetime import datetime
            new_trip.start_date = datetime.fromisoformat(str(start_date).replace('Z', ''))
        except Exception:
            pass
    if end_date:
        try:
            from datetime import datetime
            new_trip.end_date = datetime.fromisoformat(str(end_date).replace('Z', ''))
        except Exception:
            pass

    db.session.add(new_trip)
    db.session.commit()

    return jsonify({"message": "Trip created", "trip": new_trip.to_dict()}), 201


@trips_bp.route('/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    return jsonify({"trip": trip.to_dict()}), 200


@trips_bp.route('/<int:trip_id>', methods=['PATCH'])
@jwt_required()
def update_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    data = request.get_json() or {}

    if 'title' in data or 'trip_name' in data:
        trip.title = data.get('title') or data.get('trip_name')
    if 'destinations' in data:
        trip.destinations = data['destinations']
    if 'status' in data:
        trip.status = data['status']
    if 'totalBudget' in data or 'budget' in data:
        trip.total_budget = data.get('totalBudget') or data.get('budget')
    if 'coverImage' in data or 'cover_photo_url' in data:
        trip.cover_image = data.get('coverImage') or data.get('cover_photo_url')

    db.session.commit()
    return jsonify({"message": "Trip updated", "trip": trip.to_dict()}), 200


@trips_bp.route('/<int:trip_id>', methods=['DELETE'])
@jwt_required()
def delete_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    db.session.delete(trip)
    db.session.commit()
    return jsonify({"message": "Trip deleted"}), 200


@trips_bp.route('/<int:trip_id>/expenses', methods=['GET'])
def get_trip_expenses(trip_id):
    expenses = Expense.query.filter_by(trip_id=trip_id).all()
    return jsonify({
        "expenses": [e.to_dict() for e in expenses],
        "total": len(expenses)
    }), 200


@trips_bp.route('/<int:trip_id>/expenses', methods=['POST'])
@jwt_required()
def add_expense(trip_id):
    data = request.get_json() or {}
    new_expense = Expense(
        trip_id=trip_id,
        date=data.get('date', ''),
        description=data.get('description', ''),
        category=data.get('category', 'Other'),
        city=data.get('city', ''),
        unit_cost=float(data.get('unitCost') or data.get('unit_cost', 0)),
        qty=int(data.get('qty', 1))
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({"message": "Expense added", "expense": new_expense.to_dict()}), 201
