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

@cities_bp.route('/search', methods=['GET'])
def search_cities():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({"cities": [], "message": "Query parameter 'q' is required"}), 400
        
    search_term = f"%{q}%"
    cities = City.query.filter(
        (City.name.ilike(search_term)) | 
        (City.country.ilike(search_term)) |
        (City.region.ilike(search_term))
    ).limit(20).all()
    
    return jsonify({
        "cities": [c.to_dict() for c in cities],
        "total": len(cities)
    }), 200
