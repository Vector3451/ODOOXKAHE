"""
User Routes  —  thin HTTP adapter.
Covers: saved destinations, account deletion.
All logic lives in controllers/user_controller.py.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from controllers import user_controller as ctrl

users_bp = Blueprint('users', __name__)


def _uid():
    return int(get_jwt_identity())


@users_bp.route('/saved-destinations', methods=['GET'])
@jwt_required()
def get_saved():
    body, status = ctrl.get_saved_destinations(_uid())
    return jsonify(body), status


@users_bp.route('/saved-destinations', methods=['POST'])
@jwt_required()
def save_destination():
    body, status = ctrl.save_destination(_uid(), request.get_json(silent=True) or {})
    return jsonify(body), status


@users_bp.route('/saved-destinations/<string:city_name>', methods=['DELETE'])
@jwt_required()
def remove_saved(city_name):
    body, status = ctrl.remove_saved_destination(_uid(), city_name)
    return jsonify(body), status


@users_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    body, status = ctrl.soft_delete_account(_uid())
    return jsonify(body), status
