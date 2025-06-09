from flask import Flask, jsonify, request
from flask_migrate import Migrate
from models import db, Road, Contractor, Milestone, Photo, User, Notification, RoadStats,AccessibilitySetting
from utils import sort_and_search_roads, calculate_road_stats, format_currency, format_date
from datetime import datetime
import os

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'meru_roads.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

# CLI command to initialize database
@app.cli.command('initdb')
def init_db():
    """Initialize the database with sample data"""
    db.create_all()
    
    # Create sample contractors
    contractors = [
        Contractor(name="Meru Builders Ltd.", contact_email="info@merubuilders.co.ke"),
        Contractor(name="Highway Constructors Co.", contact_email="contact@highwayconstructors.com"),
        Contractor(name="Urban Roads Ltd.", contact_email="support@urbanroads.com")
    ]
    
    # Create milestones
    milestones = [
        Milestone(name="Planning", description="Initial planning phase"),
        Milestone(name="Land Prep", description="Land acquisition and preparation"),
        Milestone(name="Foundation", description="Laying the road foundation"),
        Milestone(name="Paving", description="Asphalt paving work"),
        Milestone(name="Finishing", description="Final touches and inspections")
    ]
    
    # Create sample roads with coordinates
    roads = [
        Road(
            name="Maua Highway", 
            length=18.5, 
            budget=2400000000, 
            status="ongoing", 
            start_date=datetime(2023, 1, 15), 
            end_date=datetime(2024, 10, 30), 
            progress=65,
            description="The Maua Highway project represents our commitment to connecting Meru County's agricultural heartland to national markets.",
            map_coordinates=[[37.60, 0.08], [37.65, 0.06], [37.70, 0.04], [37.75, 0.02]]
        ),
        Road(
            name="Nkubu Bypass", 
            length=7.2, 
            budget=850000000, 
            status="ongoing", 
            start_date=datetime(2023, 3, 10), 
            end_date=datetime(2024, 5, 15), 
            progress=45,
            description="The Nkubu Bypass will alleviate traffic congestion in the central business district.",
            map_coordinates=[[37.58, 0.00], [37.62, -0.02], [37.65, -0.04]]
        ),
        Road(
            name="Makutano Junction", 
            length=3.8, 
            budget=420000000, 
            status="completed", 
            start_date=datetime(2022, 11, 1), 
            end_date=datetime(2023, 8, 20), 
            progress=100,
            description="Makutano Junction upgrade has significantly improved traffic flow and safety.",
            map_coordinates=[[37.67, 0.03], [37.68, 0.02], [37.69, 0.01]]
        )
    ]
    
    # Add relationships
    roads[0].contractors.append(contractors[0])
    roads[1].contractors.append(contractors[1])
    roads[2].contractors.append(contractors[2])
    
    for road in roads:
        for milestone in milestones:
            road.milestones.append(milestone)
    
    # Add photos
    photos = [
        Photo(url="https://images.unsplash.com/photo-1506905925346-21bda4d32df4", road=roads[0]),
        Photo(url="https://images.unsplash.com/photo-1509310202330-aec5af0c4cbc", road=roads[0]),
        Photo(url="https://images.unsplash.com/photo-1584017912151-3e2c1d0f4d0a", road=roads[1])
    ]
    
    # Create admin user
    admin_user = User(
        name="Admin User", 
        email="admin@meruroads.co.ke", 
        role="County Engineer",
        avatar_url="https://example.com/avatar.jpg"
    )
    
    # Create notifications
    notifications = [
        Notification(user=admin_user, message="New project proposal submitted"),
        Notification(user=admin_user, message="Budget approval needed for Maua Highway"),
        Notification(user=admin_user, message="Monthly progress report ready for review")
    ]
    
    # Add all to session and commit
    db.session.add_all(contractors + milestones + roads + photos + [admin_user] + notifications)
    db.session.commit()
    
    # Calculate and save stats
    stats_data = calculate_road_stats(Road.query.all())
    road_stats = RoadStats(
        total_roads=stats_data['total_roads'],
        completed_roads=stats_data['completed_roads'],
        in_progress_roads=stats_data['in_progress_roads'],
        planned_roads=stats_data['planned_roads'],
        budget_allocated=stats_data['budget_allocated'],
        budget_spent=stats_data['budget_spent']
    )
    db.session.add(road_stats)
    db.session.commit()
    
    print("Database initialized with sample data")

# ========================
# ROADS ENDPOINTS
# ========================
@app.route('/api/roads', methods=['GET'])
def get_roads():
    roads = Road.query.all()
    search_query = request.args.get('search')
    sort_by = request.args.get('sort', 'name')
    reverse = request.args.get('order', 'asc') == 'desc'
    
    result = sort_and_search_roads(roads, sort_by, search_query, reverse)
    
    if isinstance(result, Road):  # Single road from search
        return jsonify([result.serialize()])
    
    return jsonify([road.serialize() for road in result])

@app.route('/api/roads/<int:road_id>', methods=['GET'])
def get_road(road_id):
    road = Road.query.get_or_404(road_id)
    return jsonify(road.serialize())

@app.route('/api/roads', methods=['POST'])
def create_road():
    data = request.json
    required_fields = ['name', 'length', 'budget', 'status', 'start_date', 'end_date', 'description']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_road = Road(
        name=data['name'],
        length=data['length'],
        budget=data['budget'],
        status=data['status'],
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d'),
        progress=data.get('progress', 0),
        description=data['description'],
        map_coordinates=data.get('map_coordinates')
    )
    
    # Handle contractors
    for contractor_id in data.get('contractor_ids', []):
        contractor = Contractor.query.get(contractor_id)
        if contractor:
            new_road.contractors.append(contractor)
    
    # Handle milestones
    for milestone_id in data.get('milestone_ids', []):
        milestone = Milestone.query.get(milestone_id)
        if milestone:
            new_road.milestones.append(milestone)
    
    db.session.add(new_road)
    db.session.commit()
    
    # Update stats
    update_road_stats()
    
    return jsonify(new_road.serialize()), 201

@app.route('/api/roads/<int:road_id>/progress', methods=['PATCH'])
def update_road_progress(road_id):
    road = Road.query.get_or_404(road_id)
    data = request.json
    
    if 'progress' not in data:
        return jsonify({'error': 'Progress value required'}), 400
    
    new_progress = data['progress']
    if not 0 <= new_progress <= 100:
        return jsonify({'error': 'Progress must be between 0 and 100'}), 400
    
    road.progress = new_progress
    db.session.commit()
    
    # Update stats
    update_road_stats()
    
    return jsonify(road.serialize())

# ========================
# CONTRACTORS ENDPOINTS
# ========================
@app.route('/api/contractors', methods=['GET'])
def get_contractors():
    contractors = Contractor.query.all()
    return jsonify([contractor.serialize() for contractor in contractors])

# ========================
# PHOTOS ENDPOINTS
# ========================
@app.route('/api/roads/<int:road_id>/photos', methods=['POST'])
def add_road_photo(road_id):
    road = Road.query.get_or_404(road_id)
    data = request.json
    
    if 'url' not in data:
        return jsonify({'error': 'Photo URL required'}), 400
    
    new_photo = Photo(
        url=data['url'],
        caption=data.get('caption', ''),
        road=road
    )
    
    db.session.add(new_photo)
    db.session.commit()
    return jsonify(new_photo.serialize()), 201

# ========================
# STATS ENDPOINTS
# ========================
@app.route('/api/stats', methods=['GET'])
def get_road_stats():
    stats = RoadStats.query.order_by(RoadStats.last_updated.desc()).first()
    if not stats:
        return jsonify({'error': 'No statistics available'}), 404
    
    return jsonify(stats.serialize())
# ========================
# ADDITIONAL ENDPOINTS
# ========================
@app.route('/api/user', methods=['GET'])
def get_current_user():
    # In real app, you'd get user from session
    admin_user = User.query.filter_by(email="admin@meruroads.co.ke").first()
    if not admin_user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(admin_user.serialize())

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    user = User.query.filter_by(email="admin@meruroads.co.ke").first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    notifications = Notification.query.filter_by(user_id=user.id, is_read=False).all()
    return jsonify([n.serialize() for n in notifications])

@app.route('/api/photos', methods=['GET'])
def get_photos():
    road_id = request.args.get('road_id')
    if road_id:
        photos = Photo.query.filter_by(road_id=road_id).all()
    else:
        photos = Photo.query.limit(6).all()
    return jsonify([p.serialize() for p in photos])

@app.route('/api/map/roads', methods=['GET'])
def get_map_roads():
    roads = Road.query.all()
    features = []
    for road in roads:
        features.append({
            "type": "Feature",
            "properties": {
                "id": road.id,
                "name": road.name,
                "status": road.status,
                "progress": road.progress
            },
            "geometry": {
                "type": "LineString",
                "coordinates": road.map_coordinates
            }
        })
    
    return jsonify({
        "type": "FeatureCollection",
        "features": features
    })

@app.route('/api/road/<int:road_id>/milestones', methods=['GET'])
def get_road_milestones(road_id):
    road = Road.query.get_or_404(road_id)
    return jsonify({
        "milestones": [m.serialize() for m in road.milestones],
        "completed": request.args.get('completed', 0)
    })

# Add to existing imports
from datetime import datetime

# Add to CLI command
def init_db():
    # ... existing code ...
    
    # Add this after creating admin_user
    admin_user = User(
        name="Admin User", 
        email="admin@meruroads.co.ke", 
        role="County Engineer",
        avatar_url="https://example.com/avatar.jpg"
    )
    
    # Create notifications
    notifications = [
        Notification(user=admin_user, message="New project proposal submitted"),
        Notification(user=admin_user, message="Budget approval needed for Maua Highway"),
        Notification(user=admin_user, message="Monthly progress report ready for review")
    ]
    

# ========================
# HELPER FUNCTIONS
# ========================

@app.route('/api/contractors/<int:contractor_id>', methods=['GET'])
def get_contractor(contractor_id):
    contractor = Contractor.query.get_or_404(contractor_id)
    return jsonify(contractor.serialize())

@app.route('/api/contractors', methods=['POST'])
def create_contractor():
    data = request.get_json()
    name = data.get('name')
    contact_email = data.get('contact_email')
    contact_phone = data.get('contact_phone')

    if not name or not contact_email:
        return jsonify({'error': 'Name and contact_email are required'}), 400

    if Contractor.query.filter_by(name=name).first():
        return jsonify({'error': 'Contractor with that name already exists'}), 409

    contractor = Contractor(
        name=name,
        contact_email=contact_email,
        contact_phone=contact_phone
    )

    db.session.add(contractor)
    db.session.commit()

    return jsonify(contractor.serialize()), 201





def update_road_stats():
    roads = Road.query.all()
    stats_data = calculate_road_stats(roads)
    
    new_stats = RoadStats(
        total_roads=stats_data['total_roads'],
        completed_roads=stats_data['completed_roads'],
        in_progress_roads=stats_data['in_progress_roads'],
        planned_roads=stats_data['planned_roads'],
        budget_allocated=stats_data['budget_allocated'],
        budget_spent=stats_data['budget_spent']
    )
    
    db.session.add(new_stats)
    db.session.commit()

from flask import Blueprint, request, jsonify
from models import db, User

user_bp = Blueprint('user_bp', __name__, url_prefix='/api/users')

@user_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()
    permissions = data.get('permissions', [])
    if isinstance(permissions, str):
        permissions = [p.strip() for p in permissions.split(',') if p.strip()]

    user = User(name=data['name'], role=data['role'], permissions=permissions)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.name = data.get('name', user.name)
    user.role = data.get('role', user.role)
    permissions = data.get('permissions')
    if permissions:
        if isinstance(permissions, str):
            permissions = [p.strip() for p in permissions.split(',') if p.strip()]
        user.permissions = permissions
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/api/accessibility/<int:user_id>', methods=['GET'])
def get_accessibility_settings(user_id):
    settings = AccessibilitySetting.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    return jsonify(settings.serialize())

@app.route('/api/accessibility/<int:user_id>', methods=['POST'])
def update_accessibility_settings(user_id):
    data = request.get_json()
    settings = AccessibilitySetting.query.filter_by(user_id=user_id).first()

    if not settings:
        settings = AccessibilitySetting(user_id=user_id)

    settings.high_contrast = data.get('high_contrast', settings.high_contrast)
    settings.text_size = data.get('text_size', settings.text_size)
    settings.voice_navigation = data.get('voice_navigation', settings.voice_navigation)

    db.session.add(settings)
    db.session.commit()
    return jsonify(settings.serialize())



# ========================
# ERROR HANDLERS
# ========================
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)