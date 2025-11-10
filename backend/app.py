import os, datetime
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from model import db
from auth import auth_bp
from issues import issues_bp
from notice import notices_bp
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, expose_headers=["Authorization"])

basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "database.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = datetime.timedelta(days=7)

db.init_app(app)
Migrate(app, db)
JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(issues_bp)
app.register_blueprint(notices_bp)

@app.get("/api/categories")
def get_categories():
    return jsonify([
        {"id": "1", "name": "Room Cleaning"},
        {"id": "2", "name": "Water Complaint"},
        {"id": "3", "name": "Internet"},
        {"id": "4", "name": "Furniture"},
        {"id": "5", "name": "Electronics"},
        {"id": "6", "name": "Washroom"},
        {"id": "7", "name": "Others"},
    ])

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
