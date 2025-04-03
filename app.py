from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime
import secrets
import math
import logging
import json
import os

# Loglama yapılandırması
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Veritabanı kurulumu
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "scuplan-secret-key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///instance/diveplan.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db.init_app(app)

# İçe aktarmalar
with app.app_context():
    from models import DivePlan, Tank, Buddy, Checklist, ChecklistItem
    db.create_all()
    
    # Create default checklists if they don't exist
    default_checklists = [
        {"name": "Pre-Dive Checklist", "type": "pre-dive", "items": [
            "Check equipment", "Test regulator", "Check BCD", "Check weights", "Check air supply",
            "Partner check", "Safety plan", "Emergency plan"
        ]},
        {"name": "Post-Dive Checklist", "type": "post-dive", "items": [
            "Rinse equipment", "Hang to dry", "Log dive", "Check remaining air", "Maintenance needs"
        ]},
        {"name": "Emergency Checklist", "type": "emergency", "items": [
            "Signal distress", "Maintain buoyancy", "Establish communication", "Assess situation",
            "First aid if needed", "Controlled ascent"
        ]}
    ]
    
    if Checklist.query.count() == 0:
        for checklist_data in default_checklists:
            checklist = Checklist(
                name=checklist_data["name"],
                checklist_type=checklist_data["type"],
                is_default=True
            )
            db.session.add(checklist)
            db.session.flush()  # Get the checklist ID
            
            for i, item_text in enumerate(checklist_data["items"]):
                item = ChecklistItem(
                    checklist_id=checklist.id,
                    text=item_text,
                    order=i+1
                )
                db.session.add(item)
        
        db.session.commit()
        
        logging.debug("Default checklists created")


# Ana sayfa rotası
@app.route('/')
def index():
    """Ana sayfa"""
    return render_template('index.html')

# Kontrol listesi sayfası rotası
@app.route('/checklist')
def checklist():
    """Kontrol listesi sayfası"""
    return render_template('checklist.html')

# Paylaşım sayfası rotası
@app.route('/share')
def share():
    """Paylaşım sayfası"""
    plan_id = request.args.get('id')
    if not plan_id:
        return redirect(url_for('index'))
    return render_template('share.html')

# API: Dalış planı hesaplama
@app.route('/api/calculate', methods=['POST'])
def calculate_plan():
    """Dalış planı hesaplama API'si"""
    try:
        logger.debug("Received dive plan calculation request")
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Parametreleri al ve doğrula
        try:
            depth = float(data.get('depth', 0))
            bottom_time = float(data.get('bottomTime', 0))
            
            if depth <= 0 or bottom_time <= 0:
                raise ValueError("Depth and bottom time must be positive numbers")
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Gaz verileri
        tanks_data = data.get('tanks', [])
        gas_data = None
        if tanks_data and len(tanks_data) > 0:
            primary_tank = tanks_data[0]
            gas_data = {
                'gas_type': primary_tank.get('gasType', 'air').lower(),
                'o2_percentage': float(primary_tank.get('o2', primary_tank.get('o2_percentage', 21.0))),
                'he_percentage': float(primary_tank.get('he', primary_tank.get('he_percentage', 0.0)))
            }
        
        # Dalış profili oluştur
        profile_data = generate_dive_profile(depth, bottom_time, gas_data)
        
        # Tarih ve saat bilgilerini işle
        dive_date = data.get('diveDate', '')
        dive_time = data.get('diveTime', '')
        
        # Tarih bilgisi boşsa bugünü kullan
        if not dive_date:
            formatted_date = datetime.now().date()
        else:
            try:
                formatted_date = datetime.strptime(dive_date, '%Y-%m-%d').date()
            except ValueError:
                # Geçersiz tarih formatı durumunda bugünü kullan
                formatted_date = datetime.now().date()
        
        # Yanıt verisi
        dive_plan = {
            'depth': depth,
            'bottomTime': bottom_time,
            'diveType': data.get('diveType', 'recreational'),
            'location': data.get('location', ''),
            'diveDate': dive_date,
            'diveTime': dive_time,
            'profile': profile_data,
            'tanks': tanks_data,
            'buddies': data.get('buddies', []),
            'totalDiveTime': profile_data['totalTime']
        }
        
        # Veritabanına kaydet (opsiyonel)
        if data.get('save', True):  # Default olarak kaydet
            # Eğer tarih gönderildiyse kullan, aksi takdirde bugünü kullan
            db_dive_plan = DivePlan(
                dive_type=dive_plan['diveType'],
                depth=depth,
                bottom_time=bottom_time,
                location=dive_plan['location'],
                dive_date=formatted_date,
                dive_time=dive_time if dive_time else None,
                total_dive_time=profile_data['totalTime'],
                share_token=secrets.token_urlsafe(16)  # Paylaşım için benzersiz token
            )
            
            # Dekompresyon seviyelerini kaydet
            if profile_data['decoStops']:
                db_dive_plan.deco_levels = ','.join(str(stop['depth']) for stop in profile_data['decoStops'])
                db_dive_plan.deco_times = ','.join(str(stop['time']) for stop in profile_data['decoStops'])
            
            # Tankları kaydet
            for tank_data in tanks_data:
                tank = Tank(
                    size=float(tank_data.get('size', 0)),
                    pressure=float(tank_data.get('pressure', 0)),
                    gas_type=tank_data.get('gasType', 'air').lower(),
                    o2_percentage=float(tank_data.get('o2', 21.0)),
                    he_percentage=float(tank_data.get('he', 0.0))
                )
                db_dive_plan.tanks.append(tank)
            
            # Buddy'leri kaydet
            for buddy_data in data.get('buddies', []):
                buddy = Buddy(
                    name=buddy_data.get('name', ''),
                    certification=buddy_data.get('certification', ''),
                    skill_level=buddy_data.get('skillLevel', ''),
                    specialty=buddy_data.get('specialty', 'none')
                )
                db_dive_plan.buddies.append(buddy)
            
            db.session.add(db_dive_plan)
            db.session.commit()
            
            # Kayıtlı planın ID'sini ve paylaşım jetonunu ekle
            dive_plan['id'] = db_dive_plan.id
            dive_plan['shareToken'] = db_dive_plan.share_token
        
        return jsonify(dive_plan)
    except Exception as e:
        logger.error(f"Error calculating dive plan: {str(e)}")
        return jsonify({'error': f'Failed to calculate dive plan: {str(e)}'}), 500

# API: Dalış planı getirme
@app.route('/api/plan/<token>')
def get_plan(token):
    """Dalış planını token ile getir"""
    try:
        logger.debug(f"Attempting to load dive plan with token: {token}")
        
        # Önce ID ile kontrol et
        try:
            plan_id = int(token)
            logger.debug(f"Treating token as ID: {plan_id}")
            plan = DivePlan.query.get(plan_id)
            if plan:
                logger.debug(f"Plan found by ID")
            else:
                logger.debug(f"No plan found with ID: {plan_id}")
        except ValueError:
            # Sayısal ID değilse, token ile ara
            logger.debug(f"Treating token as share_token")
            plan = DivePlan.query.filter_by(share_token=token).first()
            if plan:
                logger.debug(f"Plan found by token")
            else:
                logger.debug(f"No plan found with token: {token}")
        
        if not plan:
            logger.warning(f"Dive plan not found for token: {token}")
            return jsonify({
                'error': 'Dive plan not found',
                'message': 'The plan may have been deleted or the link is invalid.'
            }), 404
        
        # Plan verilerini JSON'a dönüştür
        logger.debug(f"Converting plan #{plan.id} to JSON")
        plan_data = plan.to_dict()
        
        # Dalış profilini yeniden oluştur
        logger.debug(f"Generating dive profile for plan")
        gas_info = None
        if plan.tanks:
            primary_tank = plan.tanks[0]
            gas_info = {
                'gas_type': primary_tank.gas_type,
                'o2_percentage': primary_tank.o2_percentage,
                'he_percentage': primary_tank.he_percentage
            }
            logger.debug(f"Using gas data from tank: {gas_info}")
        
        profile_data = generate_dive_profile(
            plan.depth, 
            plan.bottom_time,
            gas_info
        )
        
        plan_data['profile'] = profile_data
        logger.debug(f"Successfully prepared plan data")
        
        return jsonify(plan_data)
    except Exception as e:
        logger.error(f"Error retrieving dive plan: {str(e)}")
        # Print traceback for easier debugging
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': 'Failed to retrieve dive plan',
            'message': f'An unexpected error occurred: {str(e)}'
        }), 500

# API: Kontrol listeleri getirme
@app.route('/api/checklists')
def get_checklists():
    """Tüm kontrol listelerini getir"""
    try:
        checklist_type = request.args.get('type')
        
        if checklist_type:
            checklists = Checklist.query.filter_by(checklist_type=checklist_type).all()
        else:
            checklists = Checklist.query.all()
            
        return jsonify([checklist.to_dict() for checklist in checklists])
    except Exception as e:
        logger.error(f"Error retrieving checklists: {str(e)}")
        return jsonify({'error': f'Failed to retrieve checklists: {str(e)}'}), 500

# API: Yeni kontrol listesi oluşturma
@app.route('/api/checklists', methods=['POST'])
def create_checklist():
    """Yeni kontrol listesi oluştur"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({'error': 'Checklist name is required'}), 400
            
        checklist = Checklist(
            name=data['name'],
            checklist_type=data.get('type', 'pre-dive'),
            is_default=False
        )
        
        db.session.add(checklist)
        db.session.flush()  # Get the checklist ID
        
        # Add items if provided
        for i, item_text in enumerate(data.get('items', [])):
            item = ChecklistItem(
                checklist_id=checklist.id,
                text=item_text,
                order=i+1
            )
            db.session.add(item)
            
        db.session.commit()
        
        return jsonify(checklist.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating checklist: {str(e)}")
        return jsonify({'error': f'Failed to create checklist: {str(e)}'}), 500

# Dekompresyon hesaplama fonksiyonu
def calculate_deco_stops(depth, bottom_time, gas_data=None):
    """Dekompresyon duraklarını hesaplar"""
    # 1. Veri doğrulama ve dönüştürme
    depth = float(depth)
    bottom_time = float(bottom_time)
    
    # Gas verilerini işleme
    if gas_data is None:
        gas_data = {'gas_type': 'air', 'o2_percentage': 21, 'he_percentage': 0}
    
    # Gas yüzdelerini normalize et (eğer 0-100 aralığında verildiyse)
    o2_percent = gas_data.get('o2_percentage', 21)
    he_percent = gas_data.get('he_percentage', 0)
    
    if isinstance(o2_percent, str):
        o2_percent = float(o2_percent)
    if isinstance(he_percent, str):
        he_percent = float(he_percent)
    
    if o2_percent > 1:
        o2_percent = o2_percent / 100
    if he_percent > 1:
        he_percent = he_percent / 100
    
    # 2. Dekompresyon ihtiyacını belirle (basit model)
    # Bu basit bir modeldir, gerçek dalış planlama için daha gelişmiş modeller kullanılmalıdır
    is_deco_needed = (depth > 18 and bottom_time > 35) or (depth > 30 and bottom_time > 20)
    
    if not is_deco_needed:
        return []
    
    # 3. Dekompresyon duraklarını hesapla (basit model)
    stops = []
    
    # Hesaplama faktörleri (derinlik ve zaman bazlı)
    derinlik_faktoru = depth / 10
    zaman_faktoru = bottom_time / 20
    
    # Duraklar için temel hesaplama
    if depth > 30:
        # 6m durak
        altı_metre_durak = math.ceil(zaman_faktoru * derinlik_faktoru * 1.5)
        if altı_metre_durak > 1:
            stops.append({'depth': 6, 'time': altı_metre_durak})
        
        # 9m durak (daha derin dalışlar için)
        if depth > 40:
            dokuz_metre_durak = math.ceil(zaman_faktoru * derinlik_faktoru * 0.8)
            if dokuz_metre_durak > 1:
                stops.append({'depth': 9, 'time': dokuz_metre_durak})
    
    # 3m güvenlik durağı (her zaman ekle)
    uc_metre_durak = math.ceil(zaman_faktoru * derinlik_faktoru * 2) 
    if uc_metre_durak < 3:  # Minimum 3 dakika
        uc_metre_durak = 3
    stops.append({'depth': 3, 'time': uc_metre_durak})
    
    # Derinliğe göre sırala (en derinden yüzeye)
    stops.sort(key=lambda x: x['depth'], reverse=True)
    
    return stops

# Dalış profili oluşturma fonksiyonu
def generate_dive_profile(depth, bottom_time, gas_data=None):
    """Dalış profilini oluşturur"""
    # 1. Sabit parametreler
    descent_rate = 18  # m/dak (iniş hızı)
    ascent_rate = 9    # m/dak (çıkış hızı)
    
    # 2. İniş ve çıkış sürelerini hesapla
    descent_time = depth / descent_rate
    
    # 3. Dekompresyon duraklarını hesapla
    deco_stops = calculate_deco_stops(depth, bottom_time, gas_data)
    
    # 4. Normal çıkış süresini hesapla (dekompresyonsuz)
    normal_ascent_time = depth / ascent_rate
    
    # 5. Toplam çıkış süresini hesapla (dekompresyonlu)
    if deco_stops:
        # İlk durağa kadar iniş
        ascent_time = (depth - deco_stops[0]['depth']) / ascent_rate
        
        # Duraklar arası ve durak süreleri
        for i, stop in enumerate(deco_stops):
            ascent_time += stop['time']  # Durakta geçen süre
            
            # Sonraki durağa geçiş süresi (son durak hariç)
            if i < len(deco_stops) - 1:
                depth_diff = stop['depth'] - deco_stops[i+1]['depth']
                ascent_time += depth_diff / ascent_rate
            else:
                # Son duraktan yüzeye çıkış
                ascent_time += stop['depth'] / ascent_rate
    else:
        ascent_time = normal_ascent_time
    
    # 6. Toplam dalış süresini hesapla
    total_time = descent_time + bottom_time + ascent_time
    
    # 7. Profil noktalarını oluştur
    profile_points = []
    
    # İniş profili
    time_elapsed = 0
    for t in range(0, int(descent_time * 60), 30):  # 30 saniyelik adımlar
        seconds = t
        minutes = seconds / 60
        depth_at_time = minutes * descent_rate
        profile_points.append({
            'time': minutes,
            'depth': depth_at_time,
            'phase': 'descent'
        })
    
    # Dip zamanı
    time_elapsed = descent_time
    profile_points.append({
        'time': time_elapsed,
        'depth': depth,
        'phase': 'bottom_start'
    })
    
    time_elapsed += bottom_time
    profile_points.append({
        'time': time_elapsed,
        'depth': depth,
        'phase': 'bottom_end'
    })
    
    # Çıkış profili (dekompresyonlu veya dekompresyonsuz)
    if deco_stops:
        current_depth = depth
        
        # İlk durağa çıkış
        next_depth = deco_stops[0]['depth']
        ascent_time_to_stop = (current_depth - next_depth) / ascent_rate
        time_at_next_stop = time_elapsed + ascent_time_to_stop
        
        profile_points.append({
            'time': time_at_next_stop,
            'depth': next_depth,
            'phase': 'deco_start'
        })
        
        # Duraklar
        for i, stop in enumerate(deco_stops):
            # Durağın sonu
            time_elapsed = time_at_next_stop + stop['time']
            
            profile_points.append({
                'time': time_elapsed,
                'depth': stop['depth'],
                'phase': 'deco_stop'
            })
            
            # Sonraki durağa geçiş (son durak hariç)
            if i < len(deco_stops) - 1:
                current_depth = stop['depth']
                next_depth = deco_stops[i+1]['depth']
                ascent_time_to_stop = (current_depth - next_depth) / ascent_rate
                time_at_next_stop = time_elapsed + ascent_time_to_stop
                
                profile_points.append({
                    'time': time_at_next_stop,
                    'depth': next_depth,
                    'phase': 'deco_transit'
                })
            else:
                # Son duraktan yüzeye
                current_depth = stop['depth']
                ascent_time_to_stop = current_depth / ascent_rate
                time_elapsed += ascent_time_to_stop
                
                profile_points.append({
                    'time': time_elapsed,
                    'depth': 0,
                    'phase': 'surface'
                })
    else:
        # Dekompresyonsuz çıkış
        time_elapsed += normal_ascent_time
        
        profile_points.append({
            'time': time_elapsed,
            'depth': 0,
            'phase': 'surface'
        })
    
    # 8. Sonuç
    return {
        'points': profile_points,
        'decoStops': deco_stops,
        'descentTime': round(descent_time, 1),
        'bottomTime': round(bottom_time, 1),
        'ascentTime': round(ascent_time, 1),
        'totalTime': round(total_time, 1)
    }

# Gas tüketim hesaplaması
@app.route('/api/gas_consumption', methods=['POST'])
def calculate_gas_consumption():
    """Gaz tüketim hesaplama API'si"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Temel parametreler
        depth = float(data.get('depth', 0))
        bottom_time = float(data.get('bottomTime', 0))
        sac_rate = float(data.get('sacRate', 20))  # Surface Air Consumption rate (L/min)
        
        if depth <= 0 or bottom_time <= 0:
            return jsonify({'error': 'Depth and bottom time must be positive numbers'}), 400
            
        # Tank verileri
        tanks = data.get('tanks', [])
        if not tanks:
            return jsonify({'error': 'At least one tank is required'}), 400
            
        # Dekompresyon hesaplaması için gaz verilerini al
        primary_tank = tanks[0]
        gas_data = {
            'gas_type': primary_tank.get('gasType', 'air').lower(),
            'o2_percentage': float(primary_tank.get('o2', 21)),
            'he_percentage': float(primary_tank.get('he', 0))
        }
        
        # Profil hesapla
        profile = generate_dive_profile(depth, bottom_time, gas_data)
        
        # Gaz tüketimi hesapla
        results = []
        
        for tank in tanks:
            tank_size = float(tank.get('size', 0))  # Litre
            tank_pressure = float(tank.get('pressure', 0))  # Bar
            
            # Basınç faktörü (derinliğe göre)
            pressure_factor = (depth / 10) + 1
            
            # Dip zaman tüketimi
            bottom_consumption = sac_rate * pressure_factor * bottom_time
            
            # İniş tüketimi (ortalama derinlik = max_derinlik/2)
            descent_pressure_factor = (depth / 20) + 1
            descent_consumption = sac_rate * descent_pressure_factor * profile['descentTime']
            
            # Çıkış tüketimi (dekompresyon dahil)
            ascent_consumption = 0
            current_depth = depth
            
            if profile['decoStops']:
                # İlk durağa kadar
                first_stop_depth = profile['decoStops'][0]['depth']
                ascent_time_to_first = (depth - first_stop_depth) / 9  # 9 m/min
                avg_depth_to_first = (depth + first_stop_depth) / 2
                first_pressure_factor = (avg_depth_to_first / 10) + 1
                ascent_consumption += sac_rate * first_pressure_factor * ascent_time_to_first
                
                current_depth = first_stop_depth
                
                # Duraklar ve aralarındaki geçişler
                for i, stop in enumerate(profile['decoStops']):
                    # Durağın kendisi
                    stop_depth = stop['depth']
                    stop_time = stop['time']
                    stop_pressure_factor = (stop_depth / 10) + 1
                    ascent_consumption += sac_rate * stop_pressure_factor * stop_time
                    
                    # Sonraki durağa geçiş (varsa)
                    if i < len(profile['decoStops']) - 1:
                        next_stop = profile['decoStops'][i+1]
                        next_depth = next_stop['depth']
                        
                        transit_time = (stop_depth - next_depth) / 9  # 9 m/min
                        avg_transit_depth = (stop_depth + next_depth) / 2
                        transit_pressure_factor = (avg_transit_depth / 10) + 1
                        
                        ascent_consumption += sac_rate * transit_pressure_factor * transit_time
                    else:
                        # Son duraktan yüzeye
                        final_ascent_time = stop_depth / 9  # 9 m/min
                        avg_final_depth = stop_depth / 2
                        final_pressure_factor = (avg_final_depth / 10) + 1
                        
                        ascent_consumption += sac_rate * final_pressure_factor * final_ascent_time
            else:
                # Dekompresyonsuz düz çıkış
                avg_ascent_depth = depth / 2
                ascent_pressure_factor = (avg_ascent_depth / 10) + 1
                ascent_consumption = sac_rate * ascent_pressure_factor * profile['ascentTime']
            
            # Toplam gaz tüketimi (litre)
            total_consumption = bottom_consumption + descent_consumption + ascent_consumption
            
            # Tank gaz içeriği (litre)
            total_gas = tank_size * tank_pressure
            
            # Kalan gaz (litre ve bar)
            remaining_gas = total_gas - total_consumption
            remaining_pressure = remaining_gas / tank_size if tank_size > 0 else 0
            
            # Güvenlik faktörü (%33)
            safety_reserve = total_consumption * 0.33
            safe_remaining = remaining_gas - safety_reserve
            safe_remaining_pressure = safe_remaining / tank_size if tank_size > 0 else 0
            
            # Tank sonuçlarını ekle
            tank_result = {
                'tankIndex': tanks.index(tank),
                'tankSize': tank_size,
                'initialPressure': tank_pressure,
                'gasType': tank.get('gasType', 'air'),
                'o2': tank.get('o2', 21),
                'he': tank.get('he', 0),
                'totalConsumption': round(total_consumption, 1),
                'descentConsumption': round(descent_consumption, 1),
                'bottomConsumption': round(bottom_consumption, 1),
                'ascentConsumption': round(ascent_consumption, 1),
                'remainingGas': round(remaining_gas, 1),
                'remainingPressure': round(remaining_pressure, 1),
                'safeRemainingPressure': round(safe_remaining_pressure, 1),
                'safetyReserve': round(safety_reserve, 1)
            }
            
            results.append(tank_result)
        
        return jsonify({'results': results, 'profile': profile})
        
    except Exception as e:
        logger.error(f"Error calculating gas consumption: {str(e)}")
        return jsonify({'error': f'Failed to calculate gas consumption: {str(e)}'}), 500
