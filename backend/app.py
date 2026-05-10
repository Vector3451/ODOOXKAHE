from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import (db, User, UserSession, Trip, Destination, Activity,
                    Booking, Expense, PackingItem, TripNote,
                    SavedDestination, AuditLog, City, CommunityPost)
from routes.auth import auth_bp
from routes.trips import trips_bp
from routes.cities import cities_bp
from routes.community import community_bp
from routes.admin import admin_bp
from routes.ai import ai_bp
import os

app = Flask(__name__)

# Configuration
basedir = os.path.abspath(os.path.dirname(__name__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'dev.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-in-production'

# Initialize extensions
CORS(app)
db.init_app(app)
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(trips_bp, url_prefix='/api/trips')
app.register_blueprint(cities_bp, url_prefix='/api/cities')
app.register_blueprint(community_bp, url_prefix='/api/community')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(ai_bp, url_prefix='/api/ai')

@app.route('/')
def home():
    return jsonify({
        "message": "Backend API is running. Please access the application through the frontend UI (typically http://localhost:5173).",
        "health_check": "/health"
    })

@app.route('/health')
def health():
    return jsonify({"status": "ok", "message": "Flask Traveloop API is running"})

@app.route('/api/stats')
def get_stats():
    # Public stats for the landing page
    total_trips = Trip.query.count()
    total_countries = City.query.with_entities(City.country).distinct().count()
    total_users = User.query.count()
    total_posts = CommunityPost.query.count()
    
    return jsonify({
        "trips": total_trips,
        "countries": total_countries,
        "users": total_users,
        "posts": total_posts
    }), 200

def seed_database():
    if User.query.first() is not None:
        return # already seeded
        
    print("Seeding database with initial data...")
    from werkzeug.security import generate_password_hash
    from datetime import datetime, timedelta

    # Create dummy users
    u1 = User(name="Traveloop Admin", email="admin@traveloop.io", password=generate_password_hash("admin123"), role="admin", city="San Francisco")
    u2 = User(name="Traveloop Client", email="client@traveloop.io", password=generate_password_hash("client123"), role="client", city="New York")
    db.session.add_all([u1, u2])
    db.session.commit()

    # Create dummy destinations
    cities = [
        City(name="Santorini", country="Greece", region="Europe", description="Whitewashed cliffs above the Aegean Sea.", image="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2000&auto=format&fit=crop"),
        City(name="Bali", country="Indonesia", region="Asia", description="Rice terraces, temples and sunset surf.", image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2000&auto=format&fit=crop"),
        City(name="Tokyo", country="Japan", region="Asia", description="Neon-lit streets and timeless culture.", image="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2000&auto=format&fit=crop"),
        City(name="Swiss Alps", country="Switzerland", region="Europe", description="Snowy peaks and alpine villages.", image="https://images.unsplash.com/photo-1531234907107-16017b2b0042?q=80&w=2000&auto=format&fit=crop")
    ]
    db.session.add_all(cities)
    db.session.commit()

    # Create dummy trips
    trips = [
        Trip(user_id=u1.id, title="Greek Island Escape", destinations="Santorini, Greece", start_date=datetime.utcnow() + timedelta(days=10), end_date=datetime.utcnow() + timedelta(days=17), total_budget=3200, status="upcoming", cover_image=cities[0].image),
        Trip(user_id=u2.id, title="Tokyo Neon Adventure", destinations="Tokyo, Japan", start_date=datetime.utcnow() + timedelta(days=30), end_date=datetime.utcnow() + timedelta(days=40), total_budget=4500, status="planning", cover_image=cities[2].image),
        Trip(user_id=u1.id, title="Alpine Winter", destinations="Zermatt, Switzerland", start_date=datetime.utcnow() - timedelta(days=60), end_date=datetime.utcnow() - timedelta(days=53), total_budget=4100, status="completed", cover_image=cities[3].image)
    ]
    db.session.add_all(trips)
    db.session.commit()

    # Create dummy community posts
    posts = [
        CommunityPost(user_id=u1.id, content="Caught the most unreal sunset tonight. The colors don't even feel real.", image=cities[0].image),
        CommunityPost(user_id=u2.id, content="Neon nights and ramen. Living the dream.", image=cities[2].image)
    ]
    db.session.add_all(posts)
    db.session.commit()
    
    # Create dummy expenses for the first trip
    expenses = [
        Expense(trip_id=trips[0].id, date="Jun 12", description="Flights: SFO → ATH (Round trip)", category="Transport", city="San Francisco", unit_cost=980, qty=1),
        Expense(trip_id=trips[0].id, date="Jun 12", description="Hotel Oia Palace — 4 nights", category="Accommodation", city="Santorini", unit_cost=280, qty=4),
        Expense(trip_id=trips[0].id, date="Jun 13", description="Sunset Catamaran Cruise", category="Activity", city="Santorini", unit_cost=95, qty=2),
        Expense(trip_id=trips[0].id, date="Jun 14", description="Fine Dining at Ammoudi Bay", category="Food", city="Santorini", unit_cost=120, qty=1),
    ]
    db.session.add_all(expenses)
    db.session.commit()

    print("Database seeded successfully!")

with app.app_context():
    db.create_all()
    seed_database()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
