from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# ============================================================
# USERS  (schema v4 — all fields)
# ============================================================
class User(db.Model):
    __tablename__ = 'user'

    id                        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name                      = db.Column(db.String(100), nullable=False)
    email                     = db.Column(db.String(254), unique=True, nullable=False)
    password                  = db.Column(db.String(256), nullable=False)          # hashed

    # v4 profile fields
    role                      = db.Column(db.String(20), default='client')
    city                      = db.Column(db.String(100), nullable=True)
    avatar_url                = db.Column(db.String(500), nullable=True)
    language_preference       = db.Column(db.String(10), default='en')
    timezone                  = db.Column(db.String(50), default='UTC')
    currency_preference       = db.Column(db.String(3), default='USD')

    # email verification
    email_verified            = db.Column(db.Boolean, default=False)
    email_verified_at         = db.Column(db.DateTime, nullable=True)

    # GDPR soft-delete
    is_deleted                = db.Column(db.Boolean, default=False)
    deleted_at                = db.Column(db.DateTime, nullable=True)

    # suspension
    is_active                 = db.Column(db.Boolean, default=True)
    last_login_at             = db.Column(db.DateTime, nullable=True)

    # brute-force protection
    failed_login_attempts     = db.Column(db.SmallInteger, default=0)
    locked_until              = db.Column(db.DateTime, nullable=True)

    # password reset (SHA-256 hex of raw token — never store raw token)
    password_reset_token      = db.Column(db.String(64), nullable=True)
    password_reset_expires_at = db.Column(db.DateTime, nullable=True)

    created_at                = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at                = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    sessions           = db.relationship('UserSession',     backref='user', lazy=True, cascade='all, delete-orphan')
    trips              = db.relationship('Trip',            backref='user', lazy=True, cascade='all, delete-orphan')
    posts              = db.relationship('CommunityPost',   backref='user', lazy=True, cascade='all, delete-orphan')
    saved_destinations = db.relationship('SavedDestination',backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':                   self.id,
            'name':                 self.name,
            'email':                self.email,
            'role':                 self.role,
            'city':                 self.city,
            'avatar_url':           self.avatar_url,
            'language_preference':  self.language_preference,
            'timezone':             self.timezone,
            'currency_preference':  self.currency_preference,
            'email_verified':       self.email_verified,
            'is_active':            self.is_active,
            'last_login_at':        self.last_login_at.isoformat() if self.last_login_at else None,
            'created_at':           self.created_at.isoformat() if self.created_at else None,
            'updated_at':           self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================================
# USER SESSIONS  (JWT blacklisting / multi-device logout)
# ============================================================
class UserSession(db.Model):
    __tablename__ = 'user_session'

    session_id = db.Column(db.String(36), primary_key=True)   # UUID v4 = JWT jti
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    revoked    = db.Column(db.Boolean, default=False)
    revoked_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'session_id': self.session_id,
            'user_id':    self.user_id,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'revoked':    self.revoked,
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None,
        }


# ============================================================
# TRIPS  (schema v4 — all fields, backward-compat to_dict)
# ============================================================
class Trip(db.Model):
    __tablename__ = 'trip'

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)

    # v4: trip_name. Exposed as both 'title' and 'trip_name' in to_dict for compat.
    title           = db.Column(db.String(150), nullable=False)

    # Legacy string destinations (used by itinerary builder UI)
    destinations    = db.Column(db.String(500), nullable=True, default='')

    start_date      = db.Column(db.DateTime, nullable=True)
    end_date        = db.Column(db.DateTime, nullable=True)

    total_budget    = db.Column(db.Float, default=0.0)
    currency        = db.Column(db.String(3), default='USD')

    status          = db.Column(db.String(20), default='planning')
    # planning | active | completed | cancelled

    cover_image     = db.Column(db.String(500), nullable=True)   # v4: cover_photo_url alias

    is_public       = db.Column(db.Boolean, default=False)
    share_token     = db.Column(db.String(36), unique=True, nullable=True)

    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at      = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    dest_list    = db.relationship('Destination', backref='trip', lazy=True, cascade='all, delete-orphan')
    activities   = db.relationship('Activity',    backref='trip', lazy=True, cascade='all, delete-orphan')
    bookings     = db.relationship('Booking',     backref='trip', lazy=True, cascade='all, delete-orphan')
    expenses     = db.relationship('Expense',     backref='trip', lazy=True, cascade='all, delete-orphan')
    packing_items= db.relationship('PackingItem', backref='trip', lazy=True, cascade='all, delete-orphan')
    notes        = db.relationship('TripNote',    backref='trip', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            # simple fields used by frontend
            'id':           self.id,
            'title':        self.title,
            'trip_name':    self.title,           # v4 alias
            'destinations': self.destinations,
            'startDate':    self.start_date.isoformat() if self.start_date else None,
            'endDate':      self.end_date.isoformat()   if self.end_date   else None,
            'start_date':   self.start_date.isoformat() if self.start_date else None,
            'end_date':     self.end_date.isoformat()   if self.end_date   else None,
            'totalBudget':  self.total_budget,
            'budget':       self.total_budget,    # v4 alias
            'currency':     self.currency,
            'status':       self.status,
            'coverImage':   self.cover_image,
            'cover_photo_url': self.cover_image,  # v4 alias
            'is_public':    self.is_public,
            'share_token':  self.share_token,
            'created_at':   self.created_at.isoformat() if self.created_at else None,
            'updated_at':   self.updated_at.isoformat() if self.updated_at else None,
            '_count': {
                'expenses': len(self.expenses) if self.expenses else 0
            }
        }


# ============================================================
# DESTINATIONS  (new in v4)
# ============================================================
class Destination(db.Model):
    __tablename__ = 'destination'

    id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id        = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    city           = db.Column(db.String(100), nullable=True)
    country        = db.Column(db.String(100), nullable=True)
    country_code   = db.Column(db.String(2),   nullable=True)
    arrival_date   = db.Column(db.Date,        nullable=True)
    departure_date = db.Column(db.Date,        nullable=True)
    sequence_order = db.Column(db.SmallInteger, default=10)
    description    = db.Column(db.String(1000), nullable=True)

    activities = db.relationship('Activity', backref='destination', lazy=True)
    notes      = db.relationship('TripNote', backref='destination', lazy=True)

    def to_dict(self):
        return {
            'id':             self.id,
            'trip_id':        self.trip_id,
            'city':           self.city,
            'country':        self.country,
            'country_code':   self.country_code,
            'arrival_date':   self.arrival_date.isoformat()   if self.arrival_date   else None,
            'departure_date': self.departure_date.isoformat() if self.departure_date else None,
            'sequence_order': self.sequence_order,
            'description':    self.description,
        }


# ============================================================
# ACTIVITIES  (new in v4)
# ============================================================
class Activity(db.Model):
    __tablename__ = 'activity'

    id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id        = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('destination.id', ondelete='SET NULL'), nullable=True)
    activity_name  = db.Column(db.String(150), nullable=True)
    date           = db.Column(db.Date, nullable=True)
    start_time     = db.Column(db.Time, nullable=True)       # calendar timeline rendering
    location       = db.Column(db.String(200), nullable=True)
    cost           = db.Column(db.Float, nullable=True)
    activity_type  = db.Column(db.String(20), default='other')
    # museum|adventure|food|transport|shopping|tour|nature|entertainment|other
    duration_mins  = db.Column(db.SmallInteger, nullable=True)
    notes          = db.Column(db.String(1000), nullable=True)  # SENSITIVE
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_sensitive=False):
        d = {
            'id':             self.id,
            'trip_id':        self.trip_id,
            'destination_id': self.destination_id,
            'activity_name':  self.activity_name,
            'date':           self.date.isoformat() if self.date else None,
            'start_time':     str(self.start_time) if self.start_time else None,
            'location':       self.location,
            'cost':           self.cost,
            'activity_type':  self.activity_type,
            'duration_mins':  self.duration_mins,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'updated_at':     self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_sensitive:
            d['notes'] = self.notes
        return d


# ============================================================
# BOOKINGS  (new in v4)
# ============================================================
class Booking(db.Model):
    __tablename__ = 'booking'

    id                   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id              = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    booking_type         = db.Column(db.String(20), nullable=True)
    # flight|hotel|car_rental|train|ferry|tour|other
    provider             = db.Column(db.String(150), nullable=True)
    # [ENCRYPTED] reference_number stored as AES-256-GCM ciphertext
    reference_number_enc = db.Column(db.LargeBinary, nullable=True)
    reference_number_iv  = db.Column(db.LargeBinary(16), nullable=True)
    booking_date         = db.Column(db.Date,     nullable=True)
    check_in             = db.Column(db.DateTime, nullable=True)
    check_out            = db.Column(db.DateTime, nullable=True)
    cost                 = db.Column(db.Float, nullable=True)
    currency             = db.Column(db.String(3), default='USD')
    exchange_rate        = db.Column(db.Float, default=1.0)
    base_amount          = db.Column(db.Float, nullable=True)
    status               = db.Column(db.String(20), default='pending')
    # pending|confirmed|cancelled|completed
    expense_id           = db.Column(db.Integer, nullable=True)
    created_at           = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at           = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id':            self.id,
            'trip_id':       self.trip_id,
            'booking_type':  self.booking_type,
            'provider':      self.provider,
            'booking_date':  self.booking_date.isoformat() if self.booking_date else None,
            'check_in':      self.check_in.isoformat()  if self.check_in  else None,
            'check_out':     self.check_out.isoformat() if self.check_out else None,
            'cost':          self.cost,
            'currency':      self.currency,
            'exchange_rate': self.exchange_rate,
            'base_amount':   self.base_amount,
            'status':        self.status,
            'expense_id':    self.expense_id,
            'created_at':    self.created_at.isoformat() if self.created_at else None,
            'updated_at':    self.updated_at.isoformat() if self.updated_at else None,
            # reference_number_enc/iv never returned — app-layer decryption only
        }


# ============================================================
# EXPENSES  (schema v4 — full fields)
# ============================================================
class Expense(db.Model):
    __tablename__ = 'expense'

    id            = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id       = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)

    # v4 fields
    category      = db.Column(db.String(50), nullable=True, default='other')
    # accommodation|food|transport|activity|shopping|health|visa|other
    amount        = db.Column(db.Float, nullable=True)
    currency      = db.Column(db.String(3), default='USD')
    exchange_rate = db.Column(db.Float, default=1.0)
    base_amount   = db.Column(db.Float, nullable=True)
    expense_date  = db.Column(db.Date, nullable=True)
    description   = db.Column(db.String(300), nullable=True)   # SENSITIVE
    booking_id    = db.Column(db.Integer, nullable=True)

    # legacy fields kept for invoice / seed data compatibility
    date          = db.Column(db.String(50), nullable=True, default='')
    city          = db.Column(db.String(100), nullable=True, default='')
    unit_cost     = db.Column(db.Float, nullable=True, default=0.0)
    qty           = db.Column(db.Integer, default=1)

    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_sensitive=False):
        d = {
            'id':            self.id,
            'tripId':        self.trip_id,
            'category':      self.category,
            'amount':        self.amount,
            'currency':      self.currency,
            'exchange_rate': self.exchange_rate,
            'base_amount':   self.base_amount,
            'expense_date':  self.expense_date.isoformat() if self.expense_date else None,
            'booking_id':    self.booking_id,
            # legacy invoice fields
            'date':          self.date,
            'city':          self.city,
            'unitCost':      self.unit_cost,
            'qty':           self.qty,
            'created_at':    self.created_at.isoformat() if self.created_at else None,
            'updated_at':    self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_sensitive:
            d['description'] = self.description
        return d


# ============================================================
# PACKING ITEMS  (new in v4)
# ============================================================
class PackingItem(db.Model):
    __tablename__ = 'packing_item'

    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id    = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    item_name  = db.Column(db.String(100), nullable=False)
    category   = db.Column(db.String(50), nullable=True)
    quantity   = db.Column(db.SmallInteger, default=1)
    is_packed  = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'trip_id':    self.trip_id,
            'item_name':  self.item_name,
            'category':   self.category,
            'quantity':   self.quantity,
            'is_packed':  self.is_packed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================================
# TRIP NOTES  (encrypted — new in v4)
# ============================================================
class TripNote(db.Model):
    __tablename__ = 'trip_note'

    id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id        = db.Column(db.Integer, db.ForeignKey('trip.id', ondelete='CASCADE'), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('destination.id', ondelete='SET NULL'), nullable=True)
    # [ENCRYPTED] AES-256-GCM ciphertext — app layer encrypts before INSERT
    content_enc    = db.Column(db.LargeBinary, nullable=True)
    content_iv     = db.Column(db.LargeBinary(16), nullable=True)
    is_sensitive   = db.Column(db.Boolean, default=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        # content_enc/iv never returned — caller handles decryption
        return {
            'id':             self.id,
            'trip_id':        self.trip_id,
            'destination_id': self.destination_id,
            'is_sensitive':   self.is_sensitive,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'updated_at':     self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================================
# SAVED DESTINATIONS  (new in v4)
# ============================================================
class SavedDestination(db.Model):
    __tablename__ = 'saved_destination'

    user_id      = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True)
    city_name    = db.Column(db.String(100), primary_key=True)
    country_code = db.Column(db.String(2), nullable=True)
    saved_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'user_id':      self.user_id,
            'city_name':    self.city_name,
            'country_code': self.country_code,
            'saved_at':     self.saved_at.isoformat() if self.saved_at else None,
        }


# ============================================================
# AUDIT LOG  (no FK on user_id — rows survive user deletion)
# ============================================================
class AuditLog(db.Model):
    __tablename__ = 'audit_log'

    id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id        = db.Column(db.Integer, nullable=True)   # intentionally no FK
    action         = db.Column(db.String(50), nullable=False)
    # INSERT|UPDATE|DELETE|LOGIN|LOGOUT|LOGIN_FAILED|ACCOUNT_LOCKED
    # PASSWORD_RESET_REQUESTED|PASSWORD_RESET_COMPLETED|SESSION_REVOKED
    table_name     = db.Column(db.String(50), nullable=False)
    record_id      = db.Column(db.Integer, nullable=True)
    changed_fields = db.Column(db.JSON, nullable=True)    # never stores passwords/enc blobs
    ip_address     = db.Column(db.String(45), nullable=True)
    user_agent     = db.Column(db.String(500), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':             self.id,
            'user_id':        self.user_id,
            'action':         self.action,
            'table_name':     self.table_name,
            'record_id':      self.record_id,
            'changed_fields': self.changed_fields,
            'ip_address':     self.ip_address,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
        }


# ============================================================
# CITY  (app-specific, not in schema v4 — kept for explore/search)
# ============================================================
class City(db.Model):
    __tablename__ = 'city'

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name        = db.Column(db.String(100), nullable=False)
    country     = db.Column(db.String(100), nullable=False)
    region      = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image       = db.Column(db.String(300), nullable=True)

    def to_dict(self):
        return {
            'id':          self.id,
            'name':        self.name,
            'country':     self.country,
            'region':      self.region,
            'description': self.description,
            'image':       self.image,
        }


# ============================================================
# COMMUNITY POST  (app-specific, not in schema v4)
# ============================================================
class CommunityPost(db.Model):
    __tablename__ = 'community_post'

    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    content    = db.Column(db.Text, nullable=False)
    image      = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':      self.id,
            'content': self.content,
            'image':   self.image,
            'author':  self.user.to_dict() if self.user else None,
            '_count':  {'likes': 0, 'comments': 0},
        }
