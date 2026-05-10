from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Trip

trips_bp = Blueprint('trips', __name__)

@trips_bp.route('/', methods=['GET'])
@jwt_required(optional=True)
def get_trips():
    # In a real app we might filter by user_id
    # user_id = get_jwt_identity()
    # For demonstration, we'll return all trips or generic trips
    trips = Trip.query.all()
    return jsonify({
        "trips": [t.to_dict() for t in trips],
        "total": len(trips)
    }), 200

@trips_bp.route('/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    return jsonify({"trip": trip.to_dict()}), 200

from flask import request
from models import db, Expense

@trips_bp.route('/<int:trip_id>/expenses', methods=['GET'])
def get_trip_expenses(trip_id):
    expenses = Expense.query.filter_by(trip_id=trip_id).all()
    return jsonify({
        "expenses": [e.to_dict() for e in expenses],
        "total": len(expenses)
    }), 200

@trips_bp.route('/<int:trip_id>/expenses', methods=['POST'])
@jwt_required(optional=True)
def add_expense(trip_id):
    data = request.json
    new_expense = Expense(
        trip_id=trip_id,
        date=data.get('date'),
        description=data.get('description'),
        category=data.get('category'),
        city=data.get('city'),
        unit_cost=data.get('unitCost'),
        qty=data.get('qty', 1)
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({"message": "Expense added successfully", "expense": new_expense.to_dict()}), 201
