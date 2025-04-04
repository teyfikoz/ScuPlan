"""
ScuPlan - Comprehensive Dive Planning Application
"""
import os
import json
import uuid
import logging
from datetime import datetime, date
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize database
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)

# Set up secret key for sessions
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Import technical diving module
from technical_diving import (
    calculate_mod, calculate_end, calculate_best_mix,
    calculate_cns_loading, calculate_multi_level_profile
)

# Define models
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
        return {
            'id': self.id,
            'dive_type': self.dive_type,
            'depth': self.depth,
            'bottom_time': self.bottom_time,
            'location': self.location,
            'dive_date': self.dive_date.strftime('%d.%m.%Y') if self.dive_date else None,
            'dive_time': self.dive_time,
            'total_dive_time': self.total_dive_time,
            'deco_levels': self.deco_levels,
            'deco_times': self.deco_times,
            'share_token': self.share_token,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'tanks': [tank.to_dict() for tank in self.tanks],
            'buddies': [buddy.to_dict() for buddy in self.buddies]
        }

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
            'dive_plan_id': self.dive_plan_id,
            'size': self.size,
            'pressure': self.pressure,
            'gas_type': self.gas_type,
            'o2_percentage': self.o2_percentage,
            'he_percentage': self.he_percentage
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
            'dive_plan_id': self.dive_plan_id,
            'name': self.name,
            'certification': self.certification,
            'skill_level': self.skill_level,
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
            'checklist_type': self.checklist_type,
            'is_default': self.is_default,
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
            'checklist_id': self.checklist_id,
            'text': self.text,
            'order': self.order
        }

# Create database tables within app context
with app.app_context():
    db.create_all()
    
    # Check if default checklists exist, if not create them
    if Checklist.query.filter_by(is_default=True).count() == 0:
        # Create default pre-dive checklist
        pre_dive = Checklist(name="Standard Pre-Dive Checklist", checklist_type="pre-dive", is_default=True)
        pre_dive_items = [
            "Check all equipment",
            "Test regulator",
            "Check BCD operation",
            "Verify weights",
            "Check air supply"
        ]
        
        for i, text in enumerate(pre_dive_items):
            pre_dive.items.append(ChecklistItem(text=text, order=i))
        
        db.session.add(pre_dive)
        db.session.commit()

# Routes
@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/checklist')
def checklist():
    """Checklist page"""
    return render_template('checklist.html')

@app.route('/technical')
def technical():
    """Technical diving calculations page"""
    return render_template('technical.html')

@app.route('/share')
def share():
    """Share page"""
    return render_template('share.html')

@app.route('/calculate_plan', methods=['POST'])
def calculate_plan():
    """Dive plan calculation API"""
    logger.debug("Received dive plan calculation request")
    try:
        data = request.get_json()
        
        # Generate a simple dive profile
        depth = float(data.get('depth', 0))
        bottom_time = float(data.get('bottomTime', 0))
        
        # Add tanks data if present
        tanks_data = data.get('tanks', [])
        
        # Add buddies data if present
        buddies_data = data.get('buddies', [])
        
        # Optional parameters
        dive_type = data.get('diveType', 'recreational')
        location = data.get('location', '')
        dive_date_str = data.get('diveDate', '')
        dive_time_str = data.get('diveTime', '')
        
        # Process date and time
        try:
            dive_date = datetime.strptime(dive_date_str, '%d.%m.%Y').date() if dive_date_str else date.today()
        except ValueError:
            dive_date = date.today()
            
        # Generate dive profile
        profile = generate_dive_profile(depth, bottom_time)
        
        # Create response data
        response_data = {
            'depth': depth,
            'bottomTime': bottom_time,
            'diveType': dive_type,
            'location': location,
            'diveDate': dive_date_str if dive_date_str else dive_date.strftime('%d.%m.%Y'),
            'diveTime': dive_time_str,
            'totalDiveTime': profile['totalTime'],
            'profile': profile,
            'tanks': tanks_data,
            'buddies': buddies_data
        }
        
        # Check if we should save the plan to database
        if data.get('save', False):
            # Create share token
            share_token = str(uuid.uuid4())
            
            # Save to database
            plan = DivePlan(
                dive_type=dive_type,
                depth=depth,
                bottom_time=bottom_time,
                location=location,
                dive_date=dive_date,
                dive_time=dive_time_str,
                total_dive_time=profile['totalTime'],
                share_token=share_token
            )
            
            # Add decompression levels if any
            if profile.get('decoStops'):
                deco_levels = []
                deco_times = []
                for stop in profile['decoStops']:
                    deco_levels.append(str(stop['depth']))
                    deco_times.append(str(stop['time']))
                
                plan.deco_levels = ','.join(deco_levels)
                plan.deco_times = ','.join(deco_times)
            
            # Add tanks
            for tank_data in tanks_data:
                tank = Tank(
                    size=float(tank_data['size']),
                    pressure=float(tank_data['pressure']),
                    gas_type=tank_data['gasType'],
                    o2_percentage=float(tank_data.get('o2', 21.0)),
                    he_percentage=float(tank_data.get('he', 0.0))
                )
                plan.tanks.append(tank)
            
            # Add buddies
            for buddy_data in buddies_data:
                buddy = Buddy(
                    name=buddy_data['name'],
                    certification=buddy_data.get('certification', ''),
                    skill_level=buddy_data.get('skillLevel', ''),
                    specialty=buddy_data.get('specialty', '')
                )
                plan.buddies.append(buddy)
            
            db.session.add(plan)
            db.session.commit()
            
            # Add share token to response
            response_data['shareToken'] = share_token
            response_data['shareUrl'] = request.host_url + 'share/' + share_token
        
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error calculating dive plan: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/share/<token>')
def get_plan(token):
    """Get a shared dive plan by token"""
    try:
        # Try to find the plan in the database
        plan = DivePlan.query.filter_by(share_token=token).first()
        
        if plan:
            # Convert to dictionary for JSON response
            plan_data = plan.to_dict()
            
            # Render template with plan data
            return render_template('share.html', plan=plan_data, title=f"Dive Plan - {plan.location or 'Unknown location'}")
        else:
            # For demonstration, generate a dummy plan
            dummy_plan = {
                'id': 99999,
                'dive_type': 'recreational',
                'depth': 10,
                'bottom_time': 10,
                'location': 'Example Dive Site',
                'dive_date': datetime.now().strftime('%d.%m.%Y'),
                'dive_time': '10:00',
                'total_dive_time': 12,
                'deco_levels': None,
                'deco_times': None,
                'share_token': token,
                'created_at': datetime.now().isoformat(),
                'tanks': [
                    {
                        'id': 1,
                        'dive_plan_id': 99999,
                        'size': 12,
                        'pressure': 200,
                        'gas_type': 'air',
                        'o2_percentage': 21.0,
                        'he_percentage': 0.0
                    }
                ],
                'buddies': [
                    {
                        'id': 1,
                        'dive_plan_id': 99999,
                        'name': 'Example Buddy',
                        'certification': 'OWD',
                        'skill_level': 'Intermediate',
                        'specialty': 'None'
                    }
                ]
            }
            return render_template('share.html', plan=dummy_plan, title="Example Shared Dive Plan")
    except Exception as e:
        logger.error(f"Error retrieving shared plan: {e}")
        return render_template('share_error.html')

@app.route('/get_checklists')
def get_checklists():
    """Get all checklists"""
    try:
        checklists = Checklist.query.all()
        return jsonify([checklist.to_dict() for checklist in checklists])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/create_checklist', methods=['POST'])
def create_checklist():
    """Create a new checklist"""
    try:
        data = request.get_json()
        
        # Create checklist
        checklist = Checklist(
            name=data['name'],
            checklist_type=data['type'],
            is_default=False
        )
        
        # Add items
        for i, item_text in enumerate(data['items']):
            checklist.items.append(ChecklistItem(text=item_text, order=i))
        
        db.session.add(checklist)
        db.session.commit()
        
        return jsonify({'success': True, 'id': checklist.id})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/calculate_mod', methods=['POST'])
def calculate_mod_api():
    """Maximum Operating Depth (MOD) calculation API"""
    try:
        data = request.get_json()
        o2_percent = float(data.get('o2', 32))
        max_po2 = float(data.get('maxPO2', 1.4))
        
        mod = calculate_mod(o2_percent / 100, max_po2)
        
        return jsonify({
            'mod': round(mod, 1),
            'o2': o2_percent,
            'maxPO2': max_po2
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/calculate_end', methods=['POST'])
def calculate_end_api():
    """Equivalent Narcotic Depth (END) calculation API"""
    try:
        data = request.get_json()
        depth = float(data.get('depth', 30))
        o2_percent = float(data.get('o2', 32))
        he_percent = float(data.get('he', 0))
        
        end = calculate_end(depth, o2_percent / 100, he_percent / 100)
        
        return jsonify({
            'end': round(end, 1),
            'depth': depth,
            'o2': o2_percent,
            'he': he_percent
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/calculate_best_mix', methods=['POST'])
def calculate_best_mix_api():
    """Best Mix calculation API"""
    try:
        data = request.get_json()
        depth = float(data.get('depth', 30))
        max_po2 = float(data.get('maxPO2', 1.4))
        max_end = float(data.get('maxEND', 30))
        
        mix = calculate_best_mix(depth, max_po2, max_end)
        
        return jsonify({
            'o2': round(mix['o2_percentage'], 1),
            'he': round(mix['he_percentage'], 1),
            'n2': round(mix['n2_percentage'], 1),
            'end': round(mix['end'], 1),
            'mod': round(mix['mod'], 1)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/calculate_cns', methods=['POST'])
def calculate_cns_api():
    """CNS oxygen toxicity calculation API"""
    try:
        data = request.get_json()
        depth = float(data.get('depth', 30))
        o2_percent = float(data.get('o2', 32))
        exposure_time = float(data.get('exposureTime', 30))
        
        # Calculate pO2
        po2 = (depth / 10 + 1) * (o2_percent / 100)
        
        # Calculate CNS
        cns = calculate_cns_loading(po2, exposure_time)
        
        return jsonify({
            'cns': round(cns, 1),
            'po2': round(po2, 2),
            'depth': depth,
            'o2': o2_percent,
            'exposureTime': exposure_time
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/calculate_multi_level', methods=['POST'])
def calculate_multi_level_api():
    """Multi-level dive profile calculation API"""
    try:
        data = request.get_json()
        
        # Process segments
        segments = []
        for segment in data.get('segments', []):
            segments.append((
                float(segment['depth']),
                float(segment['time']),
                int(segment['gasIndex'])
            ))
        
        # Process gases
        gases = []
        for gas in data.get('gases', []):
            gases.append((
                float(gas['o2']),
                float(gas['he'])
            ))
        
        # Calculate profile
        profile = calculate_multi_level_profile(segments, gases)
        
        return jsonify(profile)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/calculate_gas_consumption', methods=['POST'])
def calculate_gas_consumption():
    """Gas consumption calculation API"""
    try:
        data = request.get_json()
        
        depth = float(data.get('depth', 18))
        bottom_time = float(data.get('bottomTime', 40))
        sac_rate = float(data.get('sacRate', 20))  # L/min at surface
        
        # Calculate pressure based on depth (atmospheres)
        pressure_factor = (depth / 10) + 1
        
        # Calculate consumption during bottom time
        bottom_consumption = sac_rate * pressure_factor * bottom_time
        
        # Simplified ascent and descent calculations
        descent_time = depth / 18  # 18 m/min descent rate
        descent_pressure_factor = (depth / 20) + 1  # Average pressure during descent
        descent_consumption = sac_rate * descent_pressure_factor * descent_time
        
        # Check if decompression is needed
        is_deco_needed = (depth > 18 and bottom_time > 35) or (depth > 30 and bottom_time > 20)
        
        # Initialize ascent variables
        ascent_consumption = 0
        deco_stops = []
        safety_stop = None
        ascent_time = 0
        
        if is_deco_needed:
            # Simple decompression model based on depth and time
            depth_factor = depth / 10
            time_factor = bottom_time / 20
            
            # Determine stops based on depth and time
            if depth > 30:
                if depth > 40:
                    nine_m_time = max(1, round(time_factor * depth_factor * 0.8))
                    deco_stops.append({'depth': 9, 'time': nine_m_time})
                
                six_m_time = max(1, round(time_factor * depth_factor * 1.5))
                deco_stops.append({'depth': 6, 'time': six_m_time})
            
            three_m_time = max(3, round(time_factor * depth_factor * 2))
            deco_stops.append({'depth': 3, 'time': three_m_time})
            
            # Calculate total ascent time
            ascent_time = 0
            current_depth = depth
            
            # Ascent to first stop
            first_stop_depth = deco_stops[0]['depth']
            ascent_to_first = (current_depth - first_stop_depth) / 9  # 9 m/min ascent rate
            ascent_time += ascent_to_first
            
            # Time at each stop and transit between stops
            for i, stop in enumerate(deco_stops):
                ascent_time += stop['time']  # Time at this stop
                
                # Transit to next stop if not the last one
                if i < len(deco_stops) - 1:
                    next_depth = deco_stops[i+1]['depth']
                    transit_time = (stop['depth'] - next_depth) / 9
                    ascent_time += transit_time
            
            # Final ascent from last stop to surface
            ascent_time += deco_stops[-1]['depth'] / 9
            
            # Calculate consumption during decompression
            # Use average pressure during ascent for simplification
            avg_deco_depth = depth / 3
            avg_deco_pressure = (avg_deco_depth / 10) + 1
            
            ascent_consumption = sac_rate * avg_deco_pressure * ascent_time
        else:
            # No decompression needed, calculate direct ascent
            ascent_time = depth / 9  # 9 m/min ascent rate
            
            # Add safety stop if depth > 15m
            if depth > 15:
                safety_stop = {'depth': 5, 'time': 3}
                
                # Adjust ascent time to include safety stop
                ascent_time = (depth - 5) / 9 + 3 + 5 / 9
            
            # Calculate gas consumption during ascent
            avg_ascent_depth = depth / 2
            avg_ascent_pressure = (avg_ascent_depth / 10) + 1
            ascent_consumption = sac_rate * avg_ascent_pressure * ascent_time
        
        # Total consumption and time
        total_consumption = bottom_consumption + descent_consumption + ascent_consumption
        total_time = bottom_time + descent_time + ascent_time
        
        # Calculate remaining gas for a standard tank (12L, 200 bar)
        tank_volume = float(data.get('tankVolume', 12))  # Liters
        tank_pressure = float(data.get('tankPressure', 200))  # Bar
        
        total_gas = tank_volume * tank_pressure
        remaining_gas = total_gas - total_consumption
        remaining_pressure = remaining_gas / tank_volume
        
        # Add safety reserve (33% rule)
        safety_reserve = total_consumption / 3
        safe_remaining_gas = remaining_gas - safety_reserve
        safe_remaining_pressure = safe_remaining_gas / tank_volume
        
        return jsonify({
            'totalConsumption': round(total_consumption),
            'bottomConsumption': round(bottom_consumption),
            'descentConsumption': round(descent_consumption),
            'ascentConsumption': round(ascent_consumption),
            'totalTime': round(total_time, 1),
            'descentTime': round(descent_time, 1),
            'bottomTime': bottom_time,
            'ascentTime': round(ascent_time, 1),
            'decoStops': deco_stops,
            'safetyStop': safety_stop,
            'remainingGas': max(0, round(remaining_gas)),
            'remainingPressure': max(0, round(remaining_pressure)),
            'safeRemainingPressure': max(0, round(safe_remaining_pressure)),
            'safetyReserve': round(safety_reserve)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Helper functions
def calculate_deco_stops(depth, bottom_time, gas_data=None):
    """Calculate decompression stops"""
    # Simple model to determine if decompression is needed
    is_deco_needed = (depth > 18 and bottom_time > 35) or (depth > 30 and bottom_time > 20)
    
    if not is_deco_needed:
        # No decompression needed
        if depth > 15:
            # Add safety stop for dives deeper than 15m
            return [{'depth': 5, 'time': 3}]
        return []
    
    # Simple decompression model based on depth and time
    depth_factor = depth / 10
    time_factor = bottom_time / 20
    
    stops = []
    
    # Determine stops based on depth and time
    if depth > 30:
        if depth > 40:
            nine_m_time = max(1, round(time_factor * depth_factor * 0.8))
            stops.append({'depth': 9, 'time': nine_m_time})
        
        six_m_time = max(1, round(time_factor * depth_factor * 1.5))
        stops.append({'depth': 6, 'time': six_m_time})
    
    # Always include a 3m stop for deco dives
    three_m_time = max(3, round(time_factor * depth_factor * 2))
    stops.append({'depth': 3, 'time': three_m_time})
    
    return stops

def generate_dive_profile(depth, bottom_time, gas_data=None):
    """Generate a dive profile"""
    # Calculate descent and ascent times
    descent_rate = 18  # m/min
    ascent_rate = 9    # m/min
    
    descent_time = depth / descent_rate
    
    # Get decompression stops
    deco_stops = calculate_deco_stops(depth, bottom_time, gas_data)
    
    # Calculate ascent time with stops
    if deco_stops:
        current_depth = depth
        ascent_time = 0
        
        # Ascent to first stop or surface
        if deco_stops:
            ascent_time += (current_depth - deco_stops[0]['depth']) / ascent_rate
            current_depth = deco_stops[0]['depth']
            
            # Time at each stop and transit between stops
            for i, stop in enumerate(deco_stops):
                ascent_time += stop['time']
                
                if i < len(deco_stops) - 1:
                    next_stop = deco_stops[i + 1]
                    ascent_time += (stop['depth'] - next_stop['depth']) / ascent_rate
                    current_depth = next_stop['depth']
            
            # Final ascent to surface
            ascent_time += current_depth / ascent_rate
        else:
            # Direct ascent
            ascent_time = depth / ascent_rate
    else:
        # No deco stops
        if depth > 15:
            # Add safety stop
            ascent_time = (depth - 5) / ascent_rate + 3 + 5 / ascent_rate
            deco_stops = [{'depth': 5, 'time': 3}]
        else:
            ascent_time = depth / ascent_rate
    
    # Total dive time
    total_time = descent_time + bottom_time + ascent_time
    
    # Create profile points
    points = [
        {'time': 0, 'depth': 0, 'phase': 'surface'},
        {'time': descent_time, 'depth': depth, 'phase': 'bottom_start'},
        {'time': descent_time + bottom_time, 'depth': depth, 'phase': 'bottom_end'}
    ]
    
    # Add deco stops
    time_elapsed = descent_time + bottom_time
    current_depth = depth
    
    if deco_stops:
        # Ascent to first stop
        first_stop = deco_stops[0]
        time_to_first = (current_depth - first_stop['depth']) / ascent_rate
        time_elapsed += time_to_first
        
        points.append({
            'time': time_elapsed,
            'depth': first_stop['depth'],
            'phase': 'deco_start'
        })
        
        # Process stops
        for i, stop in enumerate(deco_stops):
            # Time at stop
            time_elapsed += stop['time']
            points.append({
                'time': time_elapsed,
                'depth': stop['depth'],
                'phase': 'deco_stop'
            })
            
            # Transit to next stop
            if i < len(deco_stops) - 1:
                next_stop = deco_stops[i + 1]
                transit_time = (stop['depth'] - next_stop['depth']) / ascent_rate
                time_elapsed += transit_time
                
                points.append({
                    'time': time_elapsed,
                    'depth': next_stop['depth'],
                    'phase': 'deco_transit'
                })
        
        # Final ascent
        final_stop = deco_stops[-1]
        time_to_surface = final_stop['depth'] / ascent_rate
        time_elapsed += time_to_surface
    else:
        # Direct ascent or with safety stop
        time_elapsed += ascent_time
    
    # Add surface point
    points.append({
        'time': time_elapsed,
        'depth': 0,
        'phase': 'surface'
    })
    
    # Return profile data
    return {
        'points': points,
        'decoStops': deco_stops,
        'descentTime': round(descent_time, 1),
        'bottomTime': bottom_time,
        'ascentTime': round(ascent_time, 1),
        'totalTime': round(total_time, 1)
    }

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

# Main entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
