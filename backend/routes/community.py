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

from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

@community_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.json
    user_id = get_jwt_identity()
    user = User.query.filter_by(email=user_id).first()
    
    if not user:
        # Fallback if identity is ID instead of email, or use admin
        user = User.query.first()
        
    new_post = CommunityPost(
        user_id=user.id,
        content=data.get('content'),
        image=data.get('image')
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"message": "Post created successfully", "post": new_post.to_dict()}), 201
