from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from model import db, Issue, User
import datetime

issues_bp = Blueprint("issues", __name__, url_prefix="/api")

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

@issues_bp.get("/issues")
@jwt_required()
def get_issues():
    issues = Issue.query.order_by(Issue.created_at.desc()).all()
    return jsonify([
        {
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "roomNumber": i.room_number,
            "status": i.status,
            "createdBy": i.created_by,
            "createdAt": i.created_at.isoformat(),
            "upvotes": i.upvotes,
            "voters": i.voters.split(",") if i.voters else [],
            "assignedTo": i.assigned_to,
            "assignedWorker": i.assignee.full_name if i.assignee else None,
            "assignedAt": i.assigned_at.isoformat() if i.assigned_at else None
        }
        for i in issues
    ])

@issues_bp.post("/issues")
@role_required("student", "admin")
def create_issue():
    claims = get_jwt()
    data = request.get_json() or {}
    if not all([data.get("title"), data.get("description"), data.get("roomNumber")]):
        return jsonify({"error": "Missing fields"}), 400
    issue = Issue(
        title=data["title"],
        description=data["description"],
        room_number=data["roomNumber"],
        created_by=claims.get("email")
    )
    db.session.add(issue)
    db.session.commit()
    return jsonify({"message": "Issue created", "id": issue.id}), 201

@issues_bp.post("/issues/<int:issue_id>/status")
@role_required("admin")
def update_status(issue_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    if not new_status:
        return jsonify({"error": "Missing status"}), 400
    issue = Issue.query.get_or_404(issue_id)
    issue.status = new_status
    db.session.commit()
    return jsonify({"message": "Status updated"})

@issues_bp.post("/issues/<int:issue_id>/upvote")
@role_required("student", "admin")
def upvote(issue_id):
    claims = get_jwt()
    email = claims.get("email")
    issue = Issue.query.get_or_404(issue_id)
    voters = set(filter(None, (issue.voters or "").split(",")))
    if email in voters:
        return jsonify({"error": "Already voted"}), 409
    voters.add(email)
    issue.voters = ",".join(voters)
    issue.upvotes = len(voters)
    db.session.commit()
    return jsonify({"upvotes": issue.upvotes})

@issues_bp.post("/issues/<int:issue_id>/assign")
@role_required("admin")
def assign_issue(issue_id):
    data = request.get_json() or {}
    assignee_id = data.get("worker_id")
    # print(assignee_id)
    if not assignee_id:
        return jsonify({"error": "Missing assignee_id"}), 400
    issue = Issue.query.get_or_404(issue_id)
    assignee = User.query.get(assignee_id)

    issue.assigned_to = assignee_id
    issue.assigned_at = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message": "Issue assigned successfully",
        "assigned_to": assignee.full_name,
        "assigned_at": issue.assigned_at.isoformat()
    }),201

@issues_bp.get("/my-issues")
@role_required("repairer")
def get_my_issues():
    claims = get_jwt()
    worker_email = claims.get("email")
    worker = User.query.filter_by(email=worker_email).first()
    if not worker:
        return jsonify([])

    issues = Issue.query.filter_by(assignee=worker.id).order_by(Issue.created_at.desc()).all()
    return jsonify([
        {
            "id": i.id,
            "title": i.title,
            "description": i.description,
            "roomNumber": i.room_number,
            "status": i.status,
            "createdBy": i.created_by,
            "createdAt": i.created_at.isoformat(),
            "upvotes": i.upvotes,
            "voters": i.voters.split(",") if i.voters else [],
            "assignedTo": i.assigned_to,
        } for i in issues
    ])
