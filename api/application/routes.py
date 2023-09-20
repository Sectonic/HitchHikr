from flask import request, abort, jsonify
from application import db, app, crypt
from application.models import CarPool, User, CarpoolerUserPoints
import ast
from application.maps import getClosestRouteDirections, getRoute, calculate_distance_of_polyline, decode_polyline, find_closest_point_on_route, gmaps, calculate_midpoint, calculate_zoom_level
from werkzeug.exceptions import HTTPException
from datetime import datetime


def serialize_model(model_instance):

    if not model_instance:
        return None

    serialized_data = {}
    for column in model_instance.__table__.columns:
        column_name = str(column).split('.')[-1]
        if column_name == 'startTime':
            value = getattr(model_instance, column_name)
            serialized_data[column_name] = value.strftime("%m/%d/%y %I:%M %p") if value else None
        else:
            serialized_data[column_name] = getattr(model_instance, column_name)

    return serialized_data

# Check if all required query parameters exist in the request
def check_all_params(params):
    if not all(param in request.args for param in params):
        error_message = f'Required query parameters are missing: {", ".join(params)}'

        abort(400, description=error_message)

def check_user_id(encrypted_user_id):
    try: 
        user_id = crypt.decrypt(str(encrypted_user_id).encode()).decode()
        return int(user_id)
    except:
        abort(401, description="Invalid User ID")

@app.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, HTTPException):
        response = jsonify({'description': error.description})
        response.status_code = error.code
    else:
        response = jsonify({'description': 'Internal Server Error'})
        response.status_code = 500  
    return response

@app.route("/maps/get_carpool_route", methods=["GET"])
def get_carpool_route():

    check_all_params(['userLocation', 'userDestination', 'polyline'])

    polyline = request.args.get('polyline')

    try:
        user_location = ast.literal_eval(request.args.get('userLocation'))
        user_destination = ast.literal_eval(request.args.get('userDestination'))
    except ValueError:
        abort(400, description="An error occurred while parsing user inputs.")

    route_reach_point = find_closest_point_on_route(polyline, user_location)
    route_depart_point = find_closest_point_on_route(polyline, user_destination)

    stops = [
        route_reach_point, route_depart_point
    ]

    now = datetime.now()

    directions = []
    driving_time = 0
    walking_time = 0

    for i in range(len(stops)):

        mode = "walking" if i % 2 == 0 else "driving"
        
        origin = user_location if i == 0 else stops[i - 1]
        destination = stops[i]

        directions_result = gmaps.directions(
            origin,
            destination,
            mode=mode,
            departure_time=now
        )

        if mode == 'walking':
            walking_time += directions_result[0]['legs'][0]['duration']['value'] / 60
        else:
            driving_time += directions_result[0]['legs'][0]['duration']['value'] / 60
        
        directions.append({ 'polyline': directions_result[0]["overview_polyline"]["points"], 'start_point': origin, 'end_point': destination })

    final_directions = gmaps.directions(
        stops[-1],
        user_destination,
        mode="walking",
        departure_time=now
    )
    directions.append({ 'polyline': final_directions[0]["overview_polyline"]["points"], 'start_point': stops[-1], 'end_point': user_destination })
    walking_time += final_directions[0]['legs'][0]['duration']['value'] / 60

    return { 
        'directions': directions, 
        'midpoint': calculate_midpoint(user_location, user_destination), 
        'zoom_level': calculate_zoom_level(user_location, user_destination),
        'walking_time': walking_time,
        'driving_time': driving_time,
        'stops': [str(route_reach_point), str(route_depart_point)]
    }, 200

# Route to find suitable carpools for a user
@app.route("/maps/get_suitable_carpools", methods=['GET'])
def get_suitable_carpools():

    check_all_params(['userLocation', 'userDestination', 'hash'])

    user_id = check_user_id(request.args.get('hash'))
    user = User.query.filter_by(id=user_id).first()

    try:
        user_location = ast.literal_eval(request.args.get('userLocation'))
        user_destination = ast.literal_eval(request.args.get('userDestination'))
    except ValueError:
        abort(400, description="An error occurred while parsing user inputs.")

    carpools = CarPool.query.all()

    suitable_carpools = []

    for carpool in carpools:
        polyline_coords = decode_polyline(carpool.route_polyline)

        # Determine the direction of latitude and longitude changes for carpool and user
        carpool_latitude_change = -1 if polyline_coords[0][0] - polyline_coords[-1][0] < 0 else 1
        carpool_longitude_change = -1 if polyline_coords[0][1] - polyline_coords[-1][1] < 0 else 1
        user_latitude_change = -1 if user_location[0] - user_destination[0] < 0 else 1
        user_longitude_change = -1 if user_location[1] - user_destination[1] < 0 else 1

        # Check if carpool and user have a generally similar direction
        # "Generally" meaning if either their latitude OR longtitude go the same direction
        if carpool_latitude_change == user_latitude_change or carpool_longitude_change == user_longitude_change:
            closest_route_reach = getClosestRouteDirections(carpool.route_polyline, user_location)
            closest_route_reach_distance = calculate_distance_of_polyline(closest_route_reach[0]["overview_polyline"]["points"])

            if closest_route_reach_distance <= user.walking_distance:
                closest_route_depart = getClosestRouteDirections(carpool.route_polyline, user_destination)
                closest_route_depart_distance = calculate_distance_of_polyline(closest_route_depart[0]["overview_polyline"]["points"])

                if closest_route_depart_distance <= user.walking_distance:
                    suitable_carpools.append(carpool)

    try: 
        return [{
            'id': carpool.id,
            'driver': {
                'id': carpool.driver.id,
                'name': carpool.driver.name,
                'car_model': carpool.driver.car_model,
                'description': carpool.driver.description
            },
            'polyline': carpool.route_polyline,
            'start_address': carpool.start_address,
            'end_address': carpool.end_address,
            'total_occupancy': carpool.occupancy,
            'current_occupancy': len(carpool.carpoolers)
        } for carpool in suitable_carpools], 200
    except Exception as e:
        print(e)
        return {}, 500

@app.route('/maps/get_route', methods=['GET'])
def get_route():

    check_all_params(['origin', 'destination'])

    try:
        location = ast.literal_eval(request.args.get('origin'))
        destination = ast.literal_eval(request.args.get('destination'))
    except ValueError:
        abort(400, description="An error occurred while parsing user inputs.")

    route = getRoute(location, destination)
    polyline_coords = decode_polyline(route[0]["overview_polyline"]["points"])
    coordinates_objects = [{"latitude": latitude, "longitude": longitude} for latitude, longitude in polyline_coords]

    return { 'polylineCoords': coordinates_objects, 'polyline': route[0]["overview_polyline"]["points"] }, 200

@app.route("/accounts/register", methods=['POST'])
def register():
    try:
        body = request.get_json()
        email = body['email']
        password = body['password']
        name = body['name']

        if not email or not password or not name:
            abort(400, description="Missing Email, Password, or Name")

        userExists = User.query.filter_by(email=email).first()
        if userExists:
            abort(409, description="User with this email already exists")

        newUser = User(email=email, password=password, name=name)
        db.session.add(newUser)
        db.session.commit()

        encrypted_user_id = crypt.encrypt(str(newUser.id).encode()).decode()

        return { 'user_id': encrypted_user_id }, 200
    except Exception as e:
        print(e)
        return {}, 500

@app.route("/accounts/login", methods=['GET'])
def login():

    email = request.args.get('email')
    password = request.args.get('password')

    user = User.query.filter_by(email=email).first()

    if not user:
        abort(404, description="No account found with this email address")

    if not user.check_password_correction(password):
        abort(401, description="Invalid password")

    encrypted_user_id = crypt.encrypt(str(user.id).encode()).decode()

    return { 'user_id': encrypted_user_id }, 200

@app.route("/accounts/get", methods=["GET"])
def accounts_get():

    check_all_params(['hash'])

    user_id = check_user_id(request.args.get('hash'))
    user = User.query.filter_by(id=user_id).first()

    return { 'name': user.name, 'email': user.email, 'car_model': user.car_model, 'description': user.description, 'walking_distance': user.walking_distance }, 200

@app.route("/accounts/edit", methods=["POST"])
def accounts_edit():
    body = request.get_json()
    
    user_id = check_user_id(body['user_id'])
    user = User.query.filter_by(id=user_id).first()

    user.name = body['name']
    user.email = body['email']
    user.description = body['description']
    user.car_model = body['car_model']
    user.walking_distance = body['walking_distance']

    db.session.commit()

    return { 'name': body['name'], 'email': body['email'], 'car_model': body['car_model'], 'description': body['description'], 'walking_distance': body['walking_distance'] }, 200

@app.route("/carpool/get", methods=['GET'])
def carpool_get():

    check_all_params(['hash', 'type'])

    type = request.args.get('type')

    user_id = check_user_id(request.args.get('hash'))
    user = User.query.filter_by(id=user_id).first()
    
    if type == 'driver':
        if not user.description or not user.car_model:
            abort(400, description="To drive, a description and car model must be provided")
        all_carpools = user.carpools_as_driver

    else:
        if not user.walking_distance:
            abort(400, description="To carpool, a maximum walking distance must be provided")
        all_carpools = user.carpools

    carpools = [{
        'id': carpool.id,
        'end_point': carpool._end_point, 
        'start_point': carpool._start_point, 
        'start_address': carpool.start_address, 
        'end_address': carpool.end_address, 
        'start_time': carpool.startTime.strftime("%m/%d/%y %I:%M %p"),
        'active': True if not carpool.ended else False,
        'carpoolers': len(carpool.carpoolers),
        'distance': calculate_distance_of_polyline(carpool.route_polyline)
    } for carpool in all_carpools]

    return { 'carpools': carpools }, 200

@app.route('/carpool/connect', methods=['POST'])
def carpool_connect():
    data = request.get_json()
    user_id = check_user_id(data['user_id'])
    carpool_id = data['carpool_id']

    try:
        stops = [ast.literal_eval(stop) for stop in data['stops']]
        location = ast.literal_eval(request.args.get('location'))
        destination = ast.literal_eval(request.args.get('destination'))
    except ValueError:
        abort(400, description="An error occurred while parsing user inputs.")

    carpool = CarPool.query.get(carpool_id)
    user = User.query.get(user_id)

    user.carpools.append(carpool)

    if (len(carpool.carpoolers) >= carpool.occupancy):
        abort(400, description="Carpool is full.")

    carpool_user_point = CarpoolerUserPoints(
        start_point=location,
        end_point=destination,
        route_reach=stops[0],
        route_depart=stops[1],
        carpool_id=carpool_id,
        user_id=user_id
    )
    db.session.add(carpool_user_point)
    db.session.commit()

    return {
        'route_reach': str(stops[0]),
        'route_depart': str(stops[1])
    }, 200

@app.route('/user/get', methods=['GET'])
def user_get():
    user_id = check_user_id(request.args.get('user_id'))
    user = User.query.get(user_id)
    return { 'name': user.name }, 200

@app.route('/carpool/<carpool_id>', methods=['GET'])
def carpool_by_id(carpool_id):

    carpool = CarPool.query.get(carpool_id)
    return {
        'id': carpool.id,
        'end_point': carpool._end_point, 
        'start_point': carpool._start_point, 
        'start_address': carpool.start_address, 
        'end_address': carpool.end_address, 
        'start_time': carpool.startTime.strftime("%m/%d/%y %I:%M %p"),
        'active': True if not carpool.ended else False,
        'carpoolers': len(carpool.carpoolers),
        'polyline': carpool.route_polyline,
        'distance': calculate_distance_of_polyline(carpool.route_polyline)
    }, 200
    

@app.route("/carpool/create", methods=['POST'])
def carpool_create():
    body = request.get_json()

    user_id = check_user_id(body['hash'])

    start_address = body['start_address']
    end_address = body['end_address']
    polyline = body['polyline']
    occupancy = body['occupancy']

    if not start_address or not end_address or not occupancy or not polyline:
        abort(400, description="Missing Route or Occupancy")

    polylineCoords = decode_polyline(polyline)

    newCarPool = CarPool(
        start_address=start_address, 
        end_address=end_address, 
        route_polyline=polyline, 
        occupancy=occupancy, 
        driver_id=user_id,
        _start_point=str(polylineCoords[0]),
        _end_point=str(polylineCoords[-1])
    )
    db.session.add(newCarPool)
    db.session.commit()

    return { 'id': newCarPool.id }, 200
