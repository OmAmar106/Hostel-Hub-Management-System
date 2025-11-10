from flask import Flask, jsonify,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from model import *

def notice(app):
    @app.route("/api/notices", methods=['GET'])
    def get_notices():
        notices = Notice.query.order_by(Notice.created_at.desc()).all()
        results = [
            {
                "id": notice.id,
                "title": notice.title,
                "content": notice.content,
                "author": notice.author,
                "createdAt": notice.created_at.isoformat()
            } for notice in notices
        ]
        return jsonify(results)


    @app.route("/api/notices", methods=['POST'])
    def create_notice():
        data = request.get_json()
        if not data or not data.get('title') or not data.get('content'):
            return jsonify({"error": "Invalid input"}), 400

        new_notice = Notice(
            title=data.get('title'),
            content=data.get('content'),
            author=data.get('author', 'Admin') 
        )

        db.session.add(new_notice)
        db.session.commit()

        return jsonify({
            "message": "Notice created successfully!",
            "notice": {
                "id": new_notice.id,
                "title": new_notice.title,
                "content": new_notice.content,
                "author": new_notice.author,
                "createdAt": new_notice.created_at.isoformat()
            }
        }), 201