from app import db
from datetime import datetime
from sqlalchemy.orm import relationship
import json


class DiveSite(db.Model):
    """Dive site model representing diving locations"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(50))
    depth_max = db.Column(db.Float, default=0.0)  # Maximum depth in meters
    depth_avg = db.Column(db.Float, default=0.0)  # Average depth in meters
    difficulty = db.Column(db.String(20), default='intermediate')  # beginner, intermediate, advanced, expert
    description = db.Column(db.Text)
    water_type = db.Column(db.String(20), default='salt')  # salt, fresh
    visibility = db.Column(db.Float, default=0.0)  # Visibility in meters
    current_strength = db.Column(db.String(20), default='moderate')  # none, mild, moderate, strong, extreme
    temperature_avg = db.Column(db.Float)  # Average water temperature in Celsius
    best_season = db.Column(db.String(50))  # spring, summer, fall, winter, or combination
    latitude = db.Column(db.Float)  # For map integration
    longitude = db.Column(db.Float)  # For map integration
    entry_type = db.Column(db.String(50))  # shore, boat, platform, etc.
    special_features = db.Column(db.Text)  # Special features like wrecks, reefs, caves, etc.
    requirements = db.Column(db.Text)  # Special certification requirements
    hazards = db.Column(db.Text)  # Potential hazards at the site
    regulations = db.Column(db.Text)  # Local regulations or restrictions
    facilities = db.Column(db.Text)  # Available facilities (air fills, gear rental, etc.)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    images = relationship("DiveSiteImage", back_populates="dive_site", cascade="all, delete-orphan")
    ratings = relationship("DiveSiteRating", back_populates="dive_site", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'country': self.country,
            'depth_max': self.depth_max,
            'depth_avg': self.depth_avg,
            'difficulty': self.difficulty,
            'description': self.description,
            'water_type': self.water_type,
            'visibility': self.visibility,
            'current_strength': self.current_strength,
            'temperature_avg': self.temperature_avg,
            'best_season': self.best_season,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'entry_type': self.entry_type,
            'special_features': self.special_features,
            'requirements': self.requirements,
            'hazards': self.hazards,
            'regulations': self.regulations,
            'facilities': self.facilities,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'images': [image.to_dict() for image in self.images],
            'average_rating': self.get_average_rating()
        }
        
    def get_average_rating(self):
        """Calculate the average rating for this dive site"""
        if not self.ratings or len(self.ratings) == 0:
            return 0.0
        total = sum(rating.score for rating in self.ratings)
        return round(total / len(self.ratings), 1)


class DiveSiteImage(db.Model):
    """Images for dive sites"""
    id = db.Column(db.Integer, primary_key=True)
    dive_site_id = db.Column(db.Integer, db.ForeignKey('dive_site.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(255))
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    # Relationship
    dive_site = relationship("DiveSite", back_populates="images")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'image_url': self.image_url,
            'caption': self.caption,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DiveSiteRating(db.Model):
    """Ratings for dive sites"""
    id = db.Column(db.Integer, primary_key=True)
    dive_site_id = db.Column(db.Integer, db.ForeignKey('dive_site.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)  # 1-5 rating
    comment = db.Column(db.Text)
    user_name = db.Column(db.String(100))  # For now, just store the name
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    # Relationship
    dive_site = relationship("DiveSite", back_populates="ratings")
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'score': self.score,
            'comment': self.comment,
            'user_name': self.user_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


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
