from flask import Blueprint, jsonify
from models import CommunityPost

community_bp = Blueprint('community', __name__)

@community_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = CommunityPost.query.order_by(CommunityPost.created_at.desc()).all()
    return jsonify({
        "posts": [p.to_dict() for p in posts],
        "total": len(posts)
    }), 200
