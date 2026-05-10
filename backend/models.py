from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# ============================================================
# USERS
# ============================================================
class User(db.Model):
    __tablename__ = 'users'

    user_id                   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name                      = db.Column(db.String(100), nullable=False)
    email                     = db.Column(db.String(254), unique=True, nullable=False)
    password_hash             = db.Column(db.String(60), nullable=False)           # bcrypt, 60 chars
    avatar_url                = db.Column(db.String(500), nullable=True)
    language_preference       = db.Column(db.String(10), default='en')
    timezone                  = db.Column(db.String(50), default='UTC')
    currency_preference       = db.Column(db.String(3), default='USD')
    email_verified            = db.Column(db.Boolean, default=False)
    email_verified_at         = db.Column(db.DateTime, nullable=True)
    is_deleted                = db.Column(db.Boolean, default=False)
    deleted_at                = db.Column(db.DateTime, nullable=True)
    is_active                 = db.Column(db.Boolean, default=True)
    last_login_at             = db.Column(db.DateTime, nullable=True)
    failed_login_attempts     = db.Column(db.SmallInteger, default=0)
    locked_until              = db.Column(db.DateTime, nullable=True)
    # [SENSITIVE] — password reset: stored as SHA-256 hex of raw token
    password_reset_token      = db.Column(db.String(64), nullable=True)
    password_reset_expires_at = db.Column(db.DateTime, nullable=True)
    created_at                = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at                = db.Column(db.DateTime, default=datetime.utcnow,
                                          onupdate=datetime.utcnow)

    # Relationships
    sessions          = db.relationship('UserSession', backref='user', lazy=True,
                                        cascade='all, delete-orphan')
    trips             = db.relationship('Trip', backref='user', lazy=True,
                                        cascade='all, delete-orphan')
    saved_destinations = db.relationship('SavedDestination', backref='user', lazy=True,
                                          cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'user_id':             self.user_id,
            'name':                self.name,
            'email':               self.email,
            'avatar_url':          self.avatar_url,
            'language_preference': self.language_preference,
            'timezone':            self.timezone,
            'currency_preference': self.currency_preference,
            'email_verified':      self.email_verified,
            'email_verified_at':   self.email_verified_at.isoformat() if self.email_verified_at else None,
            'is_active':           self.is_active,
            'last_login_at':       self.last_login_at.isoformat() if self.last_login_at else None,
            'created_at':          self.created_at.isoformat() if self.created_at else None,
            'updated_at':          self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================================
# USER SESSIONS  (JWT blacklisting / multi-device)
# ============================================================
class UserSession(db.Model):
    __tablename__ = 'user_sessions'

    session_id = db.Column(db.String(36), primary_key=True)   # UUID v4, = JWT jti
    user_id    = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'),
                           nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)       # supports IPv6
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
# TRIPS
# ============================================================
class Trip(db.Model):
    __tablename__ = 'trips'

    trip_id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'),
                               nullable=False)
    trip_name     = db.Column(db.String(150), nullable=False)
    start_date    = db.Column(db.Date, nullable=True)
    end_date      = db.Column(db.Date, nullable=True)
    budget        = db.Column(db.Numeric(10, 2), nullable=True)
    currency      = db.Column(db.String(3), default='USD')
    status        = db.Column(db.Enum('planning', 'active', 'completed', 'cancelled',
                                       name='trip_status'), default='planning')
    cover_photo_url = db.Column(db.String(500), nullable=True)
    is_public     = db.Column(db.Boolean, default=False)
    share_token   = db.Column(db.String(36), unique=True, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    destinations  = db.relationship('Destination', backref='trip', lazy=True,
                                     cascade='all, delete-orphan')
    activities    = db.relationship('Activity', backref='trip', lazy=True,
                                     cascade='all, delete-orphan')
    bookings      = db.relationship('Booking', backref='trip', lazy=True,
                                     cascade='all, delete-orphan')
    expenses      = db.relationship('Expense', backref='trip', lazy=True,
                                     cascade='all, delete-orphan')
    packing_items = db.relationship('PackingItem', backref='trip', lazy=True,
                                     cascade='all, delete-orphan')
    notes         = db.relationship('TripNote', backref='trip', lazy=True,
                                     cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'trip_id':       self.trip_id,
            'user_id':       self.user_id,
            'trip_name':     self.trip_name,
            'start_date':    self.start_date.isoformat() if self.start_date else None,
            'end_date':      self.end_date.isoformat() if self.end_date else None,
            'budget':        float(self.budget) if self.budget is not None else None,
            'currency':      self.currency,
            'status':        self.status,
            'cover_photo_url': self.cover_photo_url,
            'is_public':     self.is_public,
            'share_token':   self.share_token,
            'created_at':    self.created_at.isoformat() if self.created_at else None,
            'updated_at':    self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================================
# DESTINATIONS
# ============================================================
class Destination(db.Model):
    __tablename__ = 'destinations'

    destination_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id        = db.Column(db.Integer, db.ForeignKey('trips.trip_id', ondelete='CASCADE'),
                                nullable=False)
    city           = db.Column(db.String(100), nullable=True)
    country        = db.Column(db.String(100), nullable=True)
    country_code   = db.Column(db.String(2), nullable=True)
    arrival_date   = db.Column(db.Date, nullable=True)
    departure_date = db.Column(db.Date, nullable=True)
    sequence_order = db.Column(db.SmallInteger, default=10)
    description    = db.Column(db.String(1000), nullable=True)

    # Relationships
    activities = db.relationship('Activity', backref='destination', lazy=True)
    notes      = db.relationship('TripNote', backref='destination', lazy=True)

    def to_dict(self):
        return {
            'destination_id': self.destination_id,
            'trip_id':        self.trip_id,
            'city':           self.city,
            'country':        self.country,
            'country_code':   self.country_code,
            'arrival_date':   self.arrival_date.isoformat() if self.arrival_date else None,
            'departure_date': self.departure_date.isoformat() if self.departure_date else None,
            'sequence_order': self.sequence_order,
            'description':    self.description,
        }


# ============================================================
# ACTIVITIES
# ============================================================
class Activity(db.Model):
    __tablename__ = 'activities'

    activity_id    = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id        = db.Column(db.Integer, db.ForeignKey('trips.trip_id', ondelete='CASCADE'),
                                nullable=False)
    destination_id = db.Column(db.Integer,
                                db.ForeignKey('destinations.destination_id', ondelete='SET NULL'),
                                nullable=True)
    activity_name  = db.Column(db.String(150), nullable=True)
    date           = db.Column(db.Date, nullable=True)
    start_time     = db.Column(db.Time, nullable=True)          # calendar timeline rendering
    location       = db.Column(db.String(200), nullable=True)
    cost           = db.Column(db.Numeric(10, 2), nullable=True)
    activity_type  = db.Column(db.Enum(
                        'museum', 'adventure', 'food', 'transport', 'shopping',
                        'tour', 'nature', 'entertainment', 'other',
                        name='activity_type'), default='other')
    duration_mins  = db.Column(db.SmallInteger, nullable=True)  # calendar block height
    notes          = db.Column(db.String(1000), nullable=True)  # [SENSITIVE - NOT IN AI VIEW]
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_sensitive=False):
        d = {
            'activity_id':    self.activity_id,
            'trip_id':        self.trip_id,
            'destination_id': self.destination_id,
            'activity_name':  self.activity_name,
            'date':           self.date.isoformat() if self.date else None,
            'start_time':     str(self.start_time) if self.start_time else None,
            'location':       self.location,
            'cost':           float(self.cost) if self.cost is not None else None,
            'activity_type':  self.activity_type,
            'duration_mins':  self.duration_mins,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'updated_at':     self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_sensitive:
            d['notes'] = self.notes
        return d


# ============================================================
# BOOKINGS
# ============================================================
class Booking(db.Model):
    __tablename__ = 'bookings'

    booking_id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id              = db.Column(db.Integer, db.ForeignKey('trips.trip_id', ondelete='CASCADE'),
                                      nullable=False)
    booking_type         = db.Column(db.Enum(
                              'flight', 'hotel', 'car_rental', 'train', 'ferry', 'tour', 'other',
                              name='booking_type'), nullable=True)
    provider             = db.Column(db.String(150), nullable=True)
    # [ENCRYPTED] reference_number stored as AES-256-GCM ciphertext (Base64 blob + IV)
    reference_number_enc = db.Column(db.LargeBinary, nullable=True)   # TINYBLOB
    reference_number_iv  = db.Column(db.LargeBinary(16), nullable=True)  # BINARY(16)
    booking_date         = db.Column(db.Date, nullable=True)
    check_in             = db.Column(db.DateTime, nullable=True)
    check_out            = db.Column(db.DateTime, nullable=True)
    cost                 = db.Column(db.Numeric(10, 2), nullable=True)
    currency             = db.Column(db.String(3), default='USD')
    exchange_rate        = db.Column(db.Numeric(10, 6), default=1.000000)
    base_amount          = db.Column(db.Numeric(10, 2), nullable=True)
    status               = db.Column(db.Enum(
                              'pending', 'confirmed', 'cancelled', 'completed',
                              name='booking_status'), default='pending')
    expense_id           = db.Column(db.Integer, nullable=True)  # forward FK resolved via alter
    created_at           = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at           = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_sensitive=False):
        d = {
            'booking_id':   self.booking_id,
            'trip_id':      self.trip_id,
            'booking_type': self.booking_type,
            'provider':     self.provider,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'check_in':     self.check_in.isoformat() if self.check_in else None,
            'check_out':    self.check_out.isoformat() if self.check_out else None,
            'cost':         float(self.cost) if self.cost is not None else None,
            'currency':     self.currency,
            'exchange_rate': float(self.exchange_rate) if self.exchange_rate is not None else None,
            'base_amount':  float(self.base_amount) if self.base_amount is not None else None,
            'status':       self.status,
            'expense_id':   self.expense_id,
            'created_at':   self.created_at.isoformat() if self.created_at else None,
            'updated_at':   self.updated_at.isoformat() if self.updated_at else None,
        }
        # reference_number_enc/iv are NEVER returned; decryption is app-layer only
        return d


# ============================================================
# EXPENSES
# ============================================================
class Expense(db.Model):
    __tablename__ = 'expenses'

    expense_id    = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id       = db.Column(db.Integer, db.ForeignKey('trips.trip_id', ondelete='CASCADE'),
                               nullable=False)
    category      = db.Column(db.Enum(
                       'accommodation', 'food', 'transport', 'activity',
                       'shopping', 'health', 'visa', 'other',
                       name='expense_category'), nullable=True)
    amount        = db.Column(db.Numeric(10, 2), nullable=True)
    currency      = db.Column(db.String(3), default='USD')
    exchange_rate = db.Column(db.Numeric(10, 6), default=1.000000)
    base_amount   = db.Column(db.Numeric(10, 2), nullable=True)
    expense_date  = db.Column(db.Date, nullable=True)
    description   = db.Column(db.String(300), nullable=True)  # [SENSITIVE - NOT IN AI VIEW]
    booking_id    = db.Column(db.Integer,
                               db.ForeignKey('bookings.booking_id', ondelete='SET NULL'),
                               nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_sensitive=False):
        d = {
            'expense_id':    self.expense_id,
            'trip_id':       self.trip_id,
            'category':      self.category,
            'amount':        float(self.amount) if self.amount is not None else None,
            'currency':      self.currency,
            'exchange_rate': float(self.exchange_rate) if self.exchange_rate is not None else None,
            'base_amount':   float(self.base_amount) if self.base_amount is not None else None,
            'expense_date':  self.expense_date.isoformat() if self.expense_date else None,
            'booking_id':    self.booking_id,
            'created_at':    self.created_at.isoformat() if self.created_at else None,
            'updated_at':    self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_sensitive:
            d['description'] = self.description
        return d


# ============================================================
# PACKING ITEMS
# ============================================================
class PackingItem(db.Model):
    __tablename__ = 'packing_items'

    item_id    = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id    = db.Column(db.Integer, db.ForeignKey('trips.trip_id', ondelete='CASCADE'),
                            nullable=False)
    item_name  = db.Column(db.String(100), nullable=False)
    category   = db.Column(db.String(50), nullable=True)
    quantity   = db.Column(db.SmallInteger, default=1)
    is_packed  = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'item_id':    self.item_id,
            'trip_id':    self.trip_id,
            'item_name':  self.item_name,
            'category':   self.category,
            'quantity':   self.quantity,
            'is_packed':  self.is_packed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================================
# TRIP NOTES  (encrypted content)
# ============================================================
class TripNote(db.Model):
    __tablename__ = 'trip_notes'

    note_id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    trip_id        = db.Column(db.Integer, db.ForeignKey('trips.trip_id', ondelete='CASCADE'),
                                nullable=False)
    destination_id = db.Column(db.Integer,
                                db.ForeignKey('destinations.destination_id', ondelete='SET NULL'),
                                nullable=True)
    # [ENCRYPTED] content stored as AES-256-GCM ciphertext (Base64 blob + IV)
    content_enc    = db.Column(db.LargeBinary, nullable=False)   # BLOB
    content_iv     = db.Column(db.LargeBinary(16), nullable=False)  # BINARY(16)
    is_sensitive   = db.Column(db.Boolean, default=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        # content_enc/iv never returned; caller handles decryption
        return {
            'note_id':        self.note_id,
            'trip_id':        self.trip_id,
            'destination_id': self.destination_id,
            'is_sensitive':   self.is_sensitive,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'updated_at':     self.updated_at.isoformat() if self.updated_at else None,
        }


# ============================================================
# SAVED DESTINATIONS
# ============================================================
class SavedDestination(db.Model):
    __tablename__ = 'saved_destinations'

    user_id      = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'),
                              primary_key=True)
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

    log_id        = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id       = db.Column(db.Integer, nullable=True)   # intentionally no FK
    action        = db.Column(db.Enum(
                       'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
                       'LOGIN_FAILED', 'ACCOUNT_LOCKED',
                       'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
                       'SESSION_REVOKED',
                       name='audit_action'), nullable=False)
    table_name    = db.Column(db.String(50), nullable=False)
    record_id     = db.Column(db.Integer, nullable=True)
    changed_fields = db.Column(db.JSON, nullable=True)     # never stores passwords / enc blobs
    ip_address    = db.Column(db.String(45), nullable=True)
    user_agent    = db.Column(db.String(500), nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'log_id':         self.log_id,
            'user_id':        self.user_id,
            'action':         self.action,
            'table_name':     self.table_name,
            'record_id':      self.record_id,
            'changed_fields': self.changed_fields,
            'ip_address':     self.ip_address,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
        }
