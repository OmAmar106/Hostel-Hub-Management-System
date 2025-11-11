from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from model import db, Mess
import datetime

mess_bp = Blueprint("mess", __name__, url_prefix="/api")


def role_required(*roles):
    def wrapper(fn):
        def inner(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)
        inner.__name__ = fn.__name__
        return jwt_required()(inner)
    return wrapper


@mess_bp.get("/mess")
@jwt_required()
def get_mess_schedule():
    """Get the weekly mess schedule - visible to all authenticated users"""
    mess_items = Mess.query.all()
    return jsonify([
        {
            "id": item.id,
            "day": item.day,
            "breakfast": item.breakfast,
            "lunch": item.lunch,
            "snacks": item.snacks,
            "dinner": item.dinner,
            "createdAt": item.created_at.isoformat(),
            "updatedAt": item.updated_at.isoformat(),
        }
        for item in mess_items
    ])


@mess_bp.post("/mess")
@role_required("admin")
def create_mess_item():
    """Create a new mess schedule item - admin only"""
    data = request.get_json() or {}
    
    if not data.get("day"):
        return jsonify({"error": "Day is required"}), 400
    
    # Check if day already exists
    if Mess.query.filter_by(day=data.get("day")).first():
        return jsonify({"error": "Day already exists in schedule"}), 409
    
    try:
        mess_item = Mess(
            day=data.get("day"),
            breakfast=data.get("breakfast", ""),
            lunch=data.get("lunch", ""),
            snacks=data.get("snacks", ""),
            dinner=data.get("dinner", ""),
        )
        db.session.add(mess_item)
        db.session.commit()
        
        return jsonify({
            "id": mess_item.id,
            "day": mess_item.day,
            "breakfast": mess_item.breakfast,
            "lunch": mess_item.lunch,
            "snacks": mess_item.snacks,
            "dinner": mess_item.dinner,
            "createdAt": mess_item.created_at.isoformat(),
            "updatedAt": mess_item.updated_at.isoformat(),
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@mess_bp.put("/mess/<int:mess_id>")
@role_required("admin")
def update_mess_item(mess_id):
    """Update a mess schedule item - admin only"""
    mess_item = Mess.query.get(mess_id)
    
    if not mess_item:
        return jsonify({"error": "Mess item not found"}), 404
    
    data = request.get_json() or {}
    
    try:
        if "day" in data:
            # Check if new day already exists (and it's not the same item)
            existing = Mess.query.filter_by(day=data.get("day")).first()
            if existing and existing.id != mess_id:
                return jsonify({"error": "Day already exists in schedule"}), 409
            mess_item.day = data.get("day")
        
        if "breakfast" in data:
            mess_item.breakfast = data.get("breakfast", "")
        if "lunch" in data:
            mess_item.lunch = data.get("lunch", "")
        if "snacks" in data:
            mess_item.snacks = data.get("snacks", "")
        if "dinner" in data:
            mess_item.dinner = data.get("dinner", "")
        
        mess_item.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "id": mess_item.id,
            "day": mess_item.day,
            "breakfast": mess_item.breakfast,
            "lunch": mess_item.lunch,
            "snacks": mess_item.snacks,
            "dinner": mess_item.dinner,
            "createdAt": mess_item.created_at.isoformat(),
            "updatedAt": mess_item.updated_at.isoformat(),
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@mess_bp.delete("/mess/<int:mess_id>")
@role_required("admin")
def delete_mess_item(mess_id):
    """Delete a mess schedule item - admin only"""
    mess_item = Mess.query.get(mess_id)
    
    if not mess_item:
        return jsonify({"error": "Mess item not found"}), 404
    
    try:
        db.session.delete(mess_item)
        db.session.commit()
        return jsonify({"message": "Mess item deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
