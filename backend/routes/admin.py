from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Trip, City
from functools import wraps
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.role != 'admin':
                return jsonify({"message": "Admin privileges required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

@admin_bp.route('/analytics', methods=['GET'])
@admin_required()
def analytics():
    # 1. Total counts
    total_users = User.query.count()
    total_trips = Trip.query.count()
    active_trips = Trip.query.filter_by(status='upcoming').count()
    
    # Revenue mock (since we don't have a payments table yet)
    # We sum the budget of all trips as an estimate of "value managed"
    revenue = db.session.query(db.func.sum(Trip.total_budget)).scalar() or 0
    total_countries = City.query.with_entities(City.country).distinct().count()

    # 2. Pie Data (Mock categorization for now since category isn't in Trip model, we'll randomize or assign based on status)
    pieData = [
        {"name": "Upcoming", "value": active_trips},
        {"name": "Completed", "value": Trip.query.filter_by(status='completed').count()},
        {"name": "Planning", "value": Trip.query.filter_by(status='planning').count()}
    ]

    # 3. Line Data (Growth Trends over last 6 months)
    # Group trips and users by month created (mocked since SQLite grouping by month is tricky, we'll build a synthetic line data based on real counts)
    base_users = max(10, total_users // 2)
    base_trips = max(5, total_trips // 2)
    lineData = [
        {"month": "Jan", "trips": base_trips, "users": base_users},
        {"month": "Feb", "trips": base_trips + 2, "users": base_users + 1},
        {"month": "Mar", "trips": base_trips + 5, "users": base_users + 4},
        {"month": "Apr", "trips": total_trips, "users": total_users}
    ]

    # 4. Bar Data (Regional breakdown based on cities)
    regions = db.session.query(City.region, db.func.count(City.id)).group_by(City.region).all()
    barData = [{"region": r[0] or "Unknown", "trips": r[1] * 10, "revenue": r[1] * 1000} for r in regions]
    if not barData:
        barData = [{"region": "Global", "trips": total_trips, "revenue": revenue}]

    # 5. Recent Users
    recent = User.query.order_by(User.created_at.desc()).limit(5).all()
    recentUsers = []
    for u in recent:
        recentUsers.append({
            "name": u.name,
            "email": u.email,
            "trips": len(u.trips),
            "status": "Active" if u.role == "client" else "Admin"
        })

    return jsonify({
        "stats": {
            "totalUsers": total_users,
            "activeTrips": active_trips,
            "revenue": revenue,
            "countries": total_countries
        },
        "pieData": pieData,
        "lineData": lineData,
        "barData": barData,
        "recentUsers": recentUsers
    })
