from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='client')
    city = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'city': self.city
        }

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    destinations = db.Column(db.String(200), nullable=False)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    total_budget = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='planning')
    cover_image = db.Column(db.String(300), nullable=True)
    
    user = db.relationship('User', backref='trips')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'destinations': self.destinations,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'totalBudget': self.total_budget,
            'status': self.status,
            'coverImage': self.cover_image,
            '_count': {
                'expenses': 0
            }
        }

class City(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(300), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'country': self.country,
            'region': self.region,
            'description': self.description,
            'image': self.image
        }

class CommunityPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='posts')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'image': self.image,
            'author': self.user.to_dict(),
            '_count': {
                'likes': 0,
                'comments': 0
            }
        }

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    unit_cost = db.Column(db.Float, nullable=False)
    qty = db.Column(db.Integer, default=1)
    
    trip = db.relationship('Trip', backref='expenses')

    def to_dict(self):
        return {
            'id': self.id,
            'tripId': self.trip_id,
            'date': self.date,
            'description': self.description,
            'category': self.category,
            'city': self.city,
            'unitCost': self.unit_cost,
            'qty': self.qty
        }

