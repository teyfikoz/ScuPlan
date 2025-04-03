from app import db
from datetime import datetime
from sqlalchemy.orm import relationship
import json


class DivePlan(db.Model):
    """Dive plan data model"""
    id = db.Column(db.Integer, primary_key=True)
    dive_type = db.Column(db.String(50), nullable=False, default='recreational')
    depth = db.Column(db.Float, nullable=False)
    bottom_time = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(100))
    dive_date = db.Column(db.Date, default=datetime.now().date)
    dive_time = db.Column(db.String(10))  # Dive time in hh:mm format
    total_dive_time = db.Column(db.Float)
    deco_levels = db.Column(db.String(500))  # Comma-separated depths
    deco_times = db.Column(db.String(500))   # Comma-separated times
    share_token = db.Column(db.String(64), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    # Relationships
    tanks = relationship("Tank", back_populates="dive_plan", cascade="all, delete-orphan")
    buddies = relationship("Buddy", back_populates="dive_plan", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        result = {
            'id': self.id,
            'diveType': self.dive_type,
            'depth': self.depth,
            'bottomTime': self.bottom_time,
            'location': self.location,
            'diveDate': self.dive_date.isoformat() if self.dive_date else None,
            'diveTime': self.dive_time,
            'totalDiveTime': self.total_dive_time,
            'shareToken': self.share_token,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'tanks': [tank.to_dict() for tank in self.tanks],
            'buddies': [buddy.to_dict() for buddy in self.buddies]
        }
        
        # Add decompression stops if they exist
        if self.deco_levels and self.deco_times:
            deco_depths = [float(d) for d in self.deco_levels.split(',')]
            deco_times = [float(t) for t in self.deco_times.split(',')]
            
            result['decoStops'] = [
                {'depth': depth, 'time': time} 
                for depth, time in zip(deco_depths, deco_times)
            ]
        else:
            result['decoStops'] = []
            
        return result


class Tank(db.Model):
    """Tank data model"""
    id = db.Column(db.Integer, primary_key=True)
    dive_plan_id = db.Column(db.Integer, db.ForeignKey('dive_plan.id'), nullable=False)
    size = db.Column(db.Float, nullable=False)  # Tank size in liters
    pressure = db.Column(db.Float, nullable=False)  # Tank pressure in bars
    gas_type = db.Column(db.String(50), default='air')  # air, nitrox, trimix, etc.
    o2_percentage = db.Column(db.Float, default=21.0)  # Oxygen percentage
    he_percentage = db.Column(db.Float, default=0.0)   # Helium percentage
    
    # Relationship
    dive_plan = relationship("DivePlan", back_populates="tanks")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'size': self.size,
            'pressure': self.pressure,
            'gasType': self.gas_type,
            'o2': self.o2_percentage,
            'he': self.he_percentage
        }


class Buddy(db.Model):
    """Buddy data model"""
    id = db.Column(db.Integer, primary_key=True)
    dive_plan_id = db.Column(db.Integer, db.ForeignKey('dive_plan.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    certification = db.Column(db.String(100))
    skill_level = db.Column(db.String(50))
    specialty = db.Column(db.String(100))
    
    # Relationship
    dive_plan = relationship("DivePlan", back_populates="buddies")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'certification': self.certification,
            'skillLevel': self.skill_level,
            'specialty': self.specialty
        }


class Checklist(db.Model):
    """Dive checklist model"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    checklist_type = db.Column(db.String(50), default='pre-dive')  # pre-dive, post-dive, emergency
    is_default = db.Column(db.Boolean, default=False)
    
    # Relationship
    items = relationship("ChecklistItem", back_populates="checklist", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.checklist_type,
            'isDefault': self.is_default,
            'items': [item.to_dict() for item in self.items]
        }


class ChecklistItem(db.Model):
    """Checklist item model"""
    id = db.Column(db.Integer, primary_key=True)
    checklist_id = db.Column(db.Integer, db.ForeignKey('checklist.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, default=0)
    
    # Relationship
    checklist = relationship("Checklist", back_populates="items")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'text': self.text,
            'order': self.order
        }
