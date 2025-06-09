from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy import func
from datetime import datetime

db = SQLAlchemy()

# Many-to-Many relationship tables
road_contractor = db.Table('road_contractor',
    db.Column('road_id', db.Integer, db.ForeignKey('road.id'), primary_key=True),
    db.Column('contractor_id', db.Integer, db.ForeignKey('contractor.id'), primary_key=True)
)

road_milestone = db.Table('road_milestone',
    db.Column('road_id', db.Integer, db.ForeignKey('road.id'), primary_key=True),
    db.Column('milestone_id', db.Integer, db.ForeignKey('milestone.id'), primary_key=True)
)

class Road(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    length = db.Column(db.Float, nullable=False)
    budget = db.Column(db.BigInteger, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # ongoing, completed, planned
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    progress = db.Column(db.Integer, default=0)
    description = db.Column(db.Text, nullable=False)
    map_coordinates = db.Column(db.JSON, nullable=True)  # Storing GeoJSON coordinates
    contractor = db.Column(db.String(100), nullable=True)
    
    # Relationships
    photos = relationship('Photo', back_populates='road')
    contractors = relationship('Contractor', secondary=road_contractor, back_populates='roads')
    milestones = relationship('Milestone', secondary=road_milestone, back_populates='roads')
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'length': self.length,
            'budget': self.budget,
            'status': self.status,
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'progress': self.progress,
            'description': self.description,
            'map_coordinates': self.map_coordinates,
            'contractors': [c.serialize() for c in self.contractors],
            'milestones': [m.serialize() for m in self.milestones],
            'photos': [p.serialize() for p in self.photos]
        }

class Contractor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    contact_email = db.Column(db.String(120), nullable=False)
    contact_phone = db.Column(db.String(20), nullable=True)
    
    roads = relationship('Road', secondary=road_contractor, back_populates='contractors')
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone
        }

class Milestone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, in-progress, completed
    
    roads = relationship('Road', secondary=road_milestone, back_populates='milestones')
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status
        }

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(200), nullable=True)
    date_taken = db.Column(db.DateTime, default=func.now())
    road_id = db.Column(db.Integer, db.ForeignKey('road.id'), nullable=False)
    
    road = relationship('Road', back_populates='photos')
    
    def serialize(self):
        return {
            'id': self.id,
            'url': self.url,
            'caption': self.caption,
            'date_taken': self.date_taken.isoformat(),
            'road_id': self.road_id
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)  # County Engineer, Admin, etc.
    avatar_url = db.Column(db.String(255), nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'avatar_url': self.avatar_url
        }

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=func.now())
    
    user = relationship('User')
    
    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

class RoadStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_roads = db.Column(db.Integer, default=0)
    completed_roads = db.Column(db.Integer, default=0)
    in_progress_roads = db.Column(db.Integer, default=0)
    planned_roads = db.Column(db.Integer, default=0)
    budget_allocated = db.Column(db.BigInteger, default=0)
    budget_spent = db.Column(db.BigInteger, default=0)
    last_updated = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    
    def serialize(self):
        return {
            'total_roads': self.total_roads,
            'completed_roads': self.completed_roads,
            'in_progress_roads': self.in_progress_roads,
            'planned_roads': self.planned_roads,
            'budget_allocated': self.budget_allocated,
            'budget_spent': self.budget_spent,
            'last_updated': self.last_updated.isoformat()
        }
class AccessibilitySetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    high_contrast = db.Column(db.Boolean, default=False)
    text_size = db.Column(db.String(10), default='medium')  # 'small', 'medium', 'large'
    voice_navigation = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('accessibility_settings', lazy=True, uselist=False))

    def to_dict(self):
        return {
            'highContrast': self.high_contrast,
            'textSize': self.text_size,
            'voiceNavigation': self.voice_navigation
        }