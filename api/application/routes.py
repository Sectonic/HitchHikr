from flask import request, abort
from application import db, app, crypt
from application.models import CarPool, User
import ast
from application.maps import getClosestRouteDirections, getRoute, calculate_distance_of_polyline, decode_polyline

# Check if all required query parameters exist in the request
def check_all_params(params):
    if not all(param in request.args for param in params):
        error_message = f'Required query parameters are missing: {", ".join(params)}'

        # Raise a 400 Bad Request with a custom error message
        abort(400, description=error_message)

def check_user_id(encrypted_user_id):
    try: 
        user_id = crypt.decrypt(encrypted_user_id).decode()
        return int(user_id)
    except:
        abort(401, description="Invalid User ID")

# Route to find suitable carpools for a user
@app.route("/maps/get_suitable_carpools", methods=['GET'])
def get_suitable_carpools():
    # Check if required query parameters exist in the request
    check_all_params(['userLocation', 'userDestination', 'walkingDistance'])

    # Parse query parameters and validate their types
    try:
        user_location = ast.literal_eval(request.args.get('userLocation'))
        user_destination = ast.literal_eval(request.args.get('userDestination'))
        user_maximum_walking_distance = int(request.args.get('walkingDistance'))
    except ValueError:
        # Handle parsing errors
        abort(400, description="An error occurred while parsing user inputs.")

    # Retrieve all available carpools
    carpools = CarPool.query.all()

    # Initialize a list to store suitable carpools
    suitable_carpools = []

    # Iterate through each carpool to determine suitability
    for carpool in carpools:
        # Decode the carpool's polyline coordinates
        polyline_coords = decode_polyline(carpool.polyline)

        # Determine the direction of latitude and longitude changes for carpool and user
        carpool_latitude_change = -1 if polyline_coords[0][0] - polyline_coords[-1][0] < 0 else 1
        carpool_longitude_change = -1 if polyline_coords[0][1] - polyline_coords[-1][1] < 0 else 1
        user_latitude_change = -1 if user_location[0] - user_destination[0] < 0 else 1
        user_longitude_change = -1 if user_location[1] - user_destination[1] < 0 else 1

        # Check if carpool and user have a generally similar direction
        # "Generally" meaning if either their latitude OR longtitude go the same direction
        if carpool_latitude_change == user_latitude_change or carpool_longitude_change == user_longitude_change:
            # Find the closest point on the route to the user's location
            closest_route_reach = getClosestRouteDirections(carpool.polyline, user_location)
            closest_route_reach_distance = calculate_distance_of_polyline(closest_route_reach[0]["overview_polyline"]["points"])

            # Check if the distance to the nearest route point is within the user's walking distance
            if closest_route_reach_distance <= user_maximum_walking_distance:
                # Find the closest point on the route to the user's destination
                closest_route_depart = getClosestRouteDirections(carpool.polyline, user_destination)
                closest_route_depart_distance = calculate_distance_of_polyline(closest_route_depart[0]["overview_polyline"]["points"])

                # Check if the distance to the nearest route point near the destination is within the user's walking distance
                if closest_route_depart_distance <= user_maximum_walking_distance:
                    # If all criteria are met, add the carpool to the list of suitable carpools
                    suitable_carpools.append(carpool)

    # Return the list of suitable carpools and a 200 OK status code
    return suitable_carpools, 200

# Register
@app.route("/accounts/register", methods=['POST'])
def register():
    # Parse the request body
    body = request.get_json()
    email = body['email']
    password = body['password']

    # Check for missing email or password
    if not email or not password:
        abort(400, description="Missing Email or Password")

    # Check if a user with the same email already exists
    userExists = User.query.filter_by(email=email).first()
    if userExists:
        abort(409, description="User with this email already exists")

    # Create a new user and add them to the database
    newUser = User(email=email, password=password)
    db.session.add(newUser)
    db.session.commit()

    # Encrypt the user's ID
    encrypted_user_id = crypt.encrypt(str(newUser.id).encode())

    # Return the encrypted user ID in the response
    return { 'user_id': encrypted_user_id }, 200

# Login
@app.route("/accounts/login", methods=['GET'])
def login():
    # Parse query parameters
    email = request.args.get('email')
    password = request.args.get('password')

    # Find the user by email
    user = User.query.filter_by(email=email).first()

    # Check if the user exists
    if not user:
        abort(404, description="No account found with this email address")

    # Check if the password is correct
    if not user.check_password_correction(password):
        abort(401, description="Invalid password")

    # Encrypt the user's ID
    encrypted_user_id = crypt.encrypt(str(user.id).encode())

    # Return the encrypted user ID in the response
    return { 'user_id': encrypted_user_id }, 200

@app.route("/carpool/create", methods=['POST'])
def carpool_create():
    body = request.get_json()

    user_id = check_user_id(body['user_id'])

    start_address = body['start_address']
    end_address = body['end_address']
    polyline = body['polyline']
    occupancy = body['occupancy']

    # Check for missing email or password
    if not start_address or not end_address or not occupancy or not polyline:
        abort(400, description="Missing Route or Occupancy")

    newCarPool = CarPool(
        start_address=start_address, 
        end_address=end_address, 
        polyline=polyline, 
        occupancy=occupancy, 
        driverId=user_id
    )
    db.session.add(newCarPool)
    db.session.commit()

    return newCarPool, 200
