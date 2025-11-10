from flask import Flask, jsonify,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from model import *

def issues(app):
    @app.route("/api/issues", methods=['GET'])
    def get_issues():
        issues = Issue.query.all()
        results = [
        {
            "id": issue.id,
            "title": issue.title,
            "description": issue.description,
            "roomNumber": issue.room_number,
            "status": issue.status,
            "createdBy": issue.created_by,
            "createdAt": issue.created_at.isoformat(),
            "upvotes": issue.upvotes,
            "voters": issue.voters.split(',') if issue.voters else []
        } for issue in issues
        ]
        return jsonify(results)


    @app.route("/api/issues", methods=['POST'])
    def create_issue():
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid input"}), 400

        new_issue = Issue(
            title=data.get('title'),
            description=data.get('description'),
            room_number=data.get('roomNumber'),
            created_by=data.get('createdBy')
        )

        db.session.add(new_issue)
        db.session.commit()

        return jsonify({
        "message": "Issue created successfully!",
        "issue": {
            "id": new_issue.id,
            "title": new_issue.title,
            "description": new_issue.description,
            "roomNumber": new_issue.room_number,
            "status": new_issue.status,
            "createdBy": new_issue.created_by,
            "createdAt": new_issue.created_at.isoformat(),
            "upvotes": new_issue.upvotes,
            "voters": []
        }
        }), 201 