import googlemaps
from datetime import datetime
import geopy.distance
import os

# Initialize the Google Maps client using an API key from the environment variables
gmaps = googlemaps.Client(key=os.environ['GOOGLE_MAPS_API'])

# Function to find the closest point on a route to a given location
def find_closest_point_on_route(route_polyline, point):

    # Decode the polyline representing the route into a list of coordinates
    decoded_route = decode_polyline(route_polyline)
    closest_distance = float('inf')
    closest_point = (None, None)

    # Iterate through the decoded route coordinates to find the closest point
    for route_coordinate in decoded_route:
        # Calculate the distance between the user's location (point_E) and the route coordinate
        distance = geopy.distance.distance(point, route_coordinate).m

        # Update the closest point if the current coordinate is closer
        if distance < closest_distance:
            closest_distance = distance
            closest_point = route_coordinate

    return closest_point

# Function to decode a polyline into a list of coordinates
def decode_polyline(polyline):
    coords = []
    index = 0
    lat, lng = 0, 0

    while index < len(polyline):
        shift, result = 0, 0

        # Decode latitude and longitude coordinates from the polyline
        while True:
            byte = ord(polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if not byte >= 0x20:
                break

        # Calculate and add latitude and longitude coordinates to the list
        lat += (~(result >> 1) if result & 1 else (result >> 1))
        shift, result = 0, 0
        while True:
            byte = ord(polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if not byte >= 0x20:
                break
        lng += (~(result >> 1) if result & 1 else (result >> 1))
        coords.append((lat / 100000.0, lng / 100000.0))

    return coords

def calculate_distance_of_polyline(polyline):
    # Decode the polyline to get a list of coordinates
    decoded_route = decode_polyline(polyline)
    
    total_distance = 0.0

    # Iterate through the decoded coordinates to calculate distances
    for i in range(len(decoded_route) - 1):
        coord1 = decoded_route[i]
        coord2 = decoded_route[i + 1]
        
        # Calculate the distance between consecutive coordinates
        distance = geopy.distance.distance(coord1, coord2).meters
        total_distance += distance

    return total_distance

def getRoute(route_start, route_end):
    return gmaps.directions(route_start, route_end, mode="driving", departure_time=datetime.now())

# Function to get the closest route directions from a user's location (point) to a route (route_start and route_end)
def getClosestRouteDirections(route, point):

    # Get driving directions from route_start to route_end
    if isinstance(route, str):
        route_polyline = route
    else:
        route_polyline = route[0]["overview_polyline"]["points"]

    # Find the closest point on the route to the user's location (point)
    closest_point_to_start = find_closest_point_on_route(route_polyline, point)

    # Get walking directions from point to the closest point on the route
    new_route = gmaps.directions(
        point,
        (closest_point_to_start[0], closest_point_to_start[1]),
        mode="walking",
        departure_time=datetime.now()
    )

    return new_route
