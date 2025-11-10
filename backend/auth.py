from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from model import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

def _claims(user):
    return {"role": user.role, "email": user.email, "name": user.full_name}

@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}
    name, email, pwd = data.get("full_name"), data.get("email"), data.get("password")
    role = (data.get("role") or "student").lower()
    role = "admin"

    if not name or not email or not pwd:
        return jsonify({"error": "Missing fields"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    if role not in ("student",):
        return jsonify({"error": "Invalid role"}), 400
    user = User(full_name=name, email=email, password_hash=generate_password_hash(pwd), role=role)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Account created"}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email, pwd = data.get("email"), data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, pwd):
        return jsonify({"error": "Invalid credentials"}), 401

    access = create_access_token(identity=str(user.id), additional_claims=_claims(user))
    refresh = create_refresh_token(identity=str(user.id), additional_claims=_claims(user))
    return jsonify({"access": access, "refresh": refresh})

@auth_bp.get("/me")
@jwt_required()
def me():
    user = User.query.get(get_jwt_identity())
    return jsonify({
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role
    })
