"""
Traveloop Flask Application  —  entry point.
MVC structure:
  Model      → backend/models.py
  Controller → backend/controllers/
  View (HTTP)→ backend/routes/
"""
import os
from datetime import timedelta

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from models import db

# ── blueprints ────────────────────────────────────────────────────────────
from routes.auth import auth_bp
from routes.trips import trips_bp
from routes.users import users_bp
# legacy blueprints retained for existing frontend compatibility
from routes.cities import cities_bp
from routes.community import community_bp


def create_app(config_overrides: dict = None) -> Flask:
    app = Flask(__name__)

    # ── config ────────────────────────────────────────────────────────────
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config.update(
        # Database — swap DATABASE_URL env var for production (MySQL / Postgres)
        SQLALCHEMY_DATABASE_URI=os.getenv(
            'DATABASE_URL',
            'sqlite:///' + os.path.join(basedir, 'dev.db'),
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,

        # JWT
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'CHANGE_ME_IN_PRODUCTION'),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=24),

        # CORS origins (comma-separated in env)
        CORS_ORIGINS=os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(','),
    )

    if config_overrides:
        app.config.update(config_overrides)

    # ── extensions ────────────────────────────────────────────────────────
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    db.init_app(app)
    JWTManager(app)

    # ── blueprints ────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(trips_bp,     url_prefix='/api/trips')
    app.register_blueprint(users_bp,     url_prefix='/api/users')
    app.register_blueprint(cities_bp,    url_prefix='/api/cities')
    app.register_blueprint(community_bp, url_prefix='/api/community')

    # ── utility routes ────────────────────────────────────────────────────
    @app.route('/')
    def home():
        return jsonify({
            'service': 'Traveloop API',
            'version': '4',
            'health':  '/health',
            'docs':    'See trip_planner_schema_v4.sql for the data model.',
        })

    @app.route('/health')
    def health():
        return jsonify({'status': 'ok'}), 200

    return app


# ── database bootstrap ────────────────────────────────────────────────────

def seed_database(app: Flask):
    """Insert minimal seed rows if the DB is empty."""
    with app.app_context():
        from models import User
        if User.query.first():
            return

        print('Seeding database …')
        from datetime import datetime, timedelta
        from werkzeug.security import generate_password_hash

        u1 = User(
            name='Traveloop Admin',
            email='admin@traveloop.io',
            password_hash=generate_password_hash('admin123', method='bcrypt')[:60],
            is_active=True,
        )
        u2 = User(
            name='Traveloop Client',
            email='client@traveloop.io',
            password_hash=generate_password_hash('client123', method='bcrypt')[:60],
            is_active=True,
        )
        db.session.add_all([u1, u2])
        db.session.flush()

        from models import Trip
        trips = [
            Trip(user_id=u1.user_id, trip_name='Greek Island Escape',
                 currency='USD', budget=3200, status='planning'),
            Trip(user_id=u2.user_id, trip_name='Tokyo Neon Adventure',
                 currency='JPY', budget=600000, status='planning'),
        ]
        db.session.add_all(trips)
        db.session.commit()
        print('Database seeded.')


# ── run ───────────────────────────────────────────────────────────────────

app = create_app()

with app.app_context():
    db.create_all()
    seed_database(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
