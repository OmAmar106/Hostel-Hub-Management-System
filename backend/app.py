import os
from flask import Flask, jsonify,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import datetime

# 1. Create the Flask application instance
app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))


# 2. Configure CORS to allow requests from our React frontend
# This will allow all origins for now. We can make it more specific later.
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Optional: to suppress a warning

db = SQLAlchemy(app)
migrate = Migrate(app, db)


# --- DATABASE MODELS ---
# In backend/app.py

class Issue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')
    created_by = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    
    # --- ADD THESE TWO NEW COLUMNS ---
    upvotes = db.Column(db.Integer, nullable=False, default=0)
    voters = db.Column(db.Text, nullable=True, default='') # Stores comma-separated user IDs

    def __repr__(self):
        return f'<Issue {self.id}: {self.title}>'

# In backend/app.py, add this class under the Issue model

 

class Notice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    # In a real app, this would be a foreign key to the admin user who posted it
    author = db.Column(db.String(50), nullable=False, default='Admin')

    def __repr__(self):
        return f'<Notice {self.id}: {self.title}>'


@app.route("/api/issues", methods=['GET'])
def get_issues():
    # 1. Query the database to get all issues
    issues = Issue.query.all()

    # 2. Convert each issue object into a dictionary
   # In backend/app.py, inside get_issues()
    results = [
    {
        "id": issue.id,
        "title": issue.title,
        "description": issue.description,
        "roomNumber": issue.room_number, # Mapped from snake_case to camelCase
        "status": issue.status,
        "createdBy": issue.created_by,   # Mapped from snake_case to camelCase
        "createdAt": issue.created_at.isoformat(),
        "upvotes": issue.upvotes,
        "voters": issue.voters.split(',') if issue.voters else []
    } for issue in issues
]

    # 3. Return the list of issues as a JSON response
    return jsonify(results)


# CREATE a new issue
@app.route("/api/issues", methods=['POST'])
def create_issue():
    # 1. Get the JSON data from the incoming request
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    # 2. Create a new Issue instance with the data
    new_issue = Issue(
        title=data.get('title'),
        description=data.get('description'),
        room_number=data.get('roomNumber'),
        created_by=data.get('createdBy')
        # Status will use the default 'Pending'
    )

    # 3. Add the new issue to the database session and commit
    db.session.add(new_issue)
    db.session.commit()

    # 4. Return a success response with the new issue's data
    # In backend/app.py, inside create_issue()
    return jsonify({
     "message": "Issue created successfully!",
     "issue": {
        "id": new_issue.id,
        "title": new_issue.title,
        "description": new_issue.description,
        "roomNumber": new_issue.room_number, # Mapped from snake_case
        "status": new_issue.status,
        "createdBy": new_issue.created_by,   # Mapped from snake_case
        "createdAt": new_issue.created_at.isoformat(),
        "upvotes": new_issue.upvotes,
        "voters": []
    }
    }), 201 # 201 status code means "Created"
# In backend/app.py

# --- Add this new route ---
@app.route("/api/categories", methods=['GET'])
def get_categories():
    categories = [
        { "id": "1", "name": "Room Cleaning" },
        { "id": "2", "name": "Water Complaint" },
        { "id": "3", "name": "Internet" },
        { "id": "4", "name": "Furniture" },
        { "id": "5", "name": "Electronics" },
        { "id": "6", "name": "Washroom" },
        { "id": "7", "name": "Others" },
    ]
    return jsonify(categories)

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

# CREATE a new notice
@app.route("/api/notices", methods=['POST'])
def create_notice():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({"error": "Invalid input"}), 400

    new_notice = Notice(
        title=data.get('title'),
        content=data.get('content'),
        # In a real app, you'd get the author from the logged-in user session
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
# 4. A guard to ensure this runs only when the script is executed directly
if __name__ == "__main__":
    # We will run the app on port 5000
    app.run(debug=True, port=5000)