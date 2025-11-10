from flask_sqlalchemy import SQLAlchemy
import datetime

db = SQLAlchemy()

class Issue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')
    created_by = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    upvotes = db.Column(db.Integer, nullable=False, default=0)
    voters = db.Column(db.Text, nullable=True, default='')
    def __repr__(self):
        return f'<Issue {self.id}: {self.title}>'

class Notice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.datetime.utcnow)
    author = db.Column(db.String(50), nullable=False, default='Admin')

    def __repr__(self):
        return f'<Notice {self.id}: {self.title}>'
 