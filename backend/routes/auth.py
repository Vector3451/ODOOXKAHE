"""
Auth Routes  —  thin HTTP adapter, no business logic.
All logic lives in controllers/auth_controller.py.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from controllers import auth_controller as ctrl

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    body, status = ctrl.register(request.get_json(silent=True) or {})
    return jsonify(body), status


@auth_bp.route('/login', methods=['POST'])
def login():
    body, status = ctrl.login(request.get_json(silent=True) or {})
    return jsonify(body), status


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    body, status = ctrl.logout(get_jwt())
    return jsonify(body), status


@auth_bp.route('/logout-all', methods=['POST'])
@jwt_required()
def logout_all():
    body, status = ctrl.logout_all(int(get_jwt_identity()))
    return jsonify(body), status


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    body, status = ctrl.get_profile(int(get_jwt_identity()))
    return jsonify(body), status


@auth_bp.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    body, status = ctrl.update_profile(
        int(get_jwt_identity()),
        request.get_json(silent=True) or {},
    )
    return jsonify(body), status


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    body, status = ctrl.request_password_reset(request.get_json(silent=True) or {})
    return jsonify(body), status


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    body, status = ctrl.reset_password(request.get_json(silent=True) or {})
    return jsonify(body), status
