from flask import Blueprint, jsonify, request
from models import City

cities_bp = Blueprint('cities', __name__)

@cities_bp.route('/', methods=['GET'])
def get_cities():
    limit = request.args.get('limit', type=int)
    query = City.query
    if limit:
        query = query.limit(limit)
        
    cities = query.all()
    return jsonify({
        "cities": [c.to_dict() for c in cities],
        "total": len(cities)
    }), 200
