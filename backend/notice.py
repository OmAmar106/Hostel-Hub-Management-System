from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from model import db, Notice
from issues import role_required

notices_bp = Blueprint("notices", __name__, url_prefix="/api")

@notices_bp.get("/notices")
@jwt_required()
def get_notices():
    notices = Notice.query.order_by(Notice.created_at.desc()).all()
    return jsonify([
        {
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "author": n.author,
            "createdAt": n.created_at.isoformat()
        } for n in notices
    ])

@notices_bp.post("/notices")
@role_required("admin")
def create_notice():
    data = request.get_json() or {}
    if not data.get("title") or not data.get("content"):
        return jsonify({"error": "Invalid input"}), 400
    notice = Notice(title=data["title"], content=data["content"], author=data.get("author", "Admin"))
    db.session.add(notice)
    db.session.commit()
    return jsonify({"message": "Notice created", "id": notice.id}), 201
