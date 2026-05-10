from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "User already exists"}), 409

    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data.get('name', 'New User'),
        email=data['email'],
        password=hashed_password,
        city=data.get('city')
    )
    
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))
    
    return jsonify({
        "message": "Registered successfully",
        "token": access_token,
        "user": new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({"user": user.to_dict()}), 200
