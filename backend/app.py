import os
from flask import Flask, jsonify,request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import datetime
from model import *
from notice import *
from issues import *

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)

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

if __name__ == "__main__":
    notice(app)
    issues(app)
    with app.app_context():
        db.create_all()
    app.run(debug=True,port=5000)