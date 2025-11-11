import os
import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from model import db, User
from auth import auth_bp
from issues import issues_bp
from notice import notices_bp
from workers import workers_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# ✅ Fix CORS (this version allows your React frontend to connect smoothly)
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:8080"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Database setup
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "database.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretkey")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = datetime.timedelta(days=7)

# Initialize extensions
db.init_app(app)
Migrate(app, db)
JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(workers_bp)
app.register_blueprint(issues_bp)
app.register_blueprint(notices_bp)

# Example endpoint
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

# Create DB tables and default admin user
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        admin = User.query.filter_by(role="admin").first()
        if not admin:
            new_admin = User(
                full_name="Admin",
                email="admin@hostel.com",
                password_hash=generate_password_hash("admin123"),
                role="admin"
            )
            db.session.add(new_admin)
            db.session.commit()

    # Run the Flask app
    app.run(debug=True, port=5000)
