import googlemaps
from datetime import datetime
import geopy.distance
import os

gmaps = googlemaps.Client(key=os.environ['GOOGLE_MAPS_API'])

# Function to find the closest point on a route to a given location
def find_closest_point_on_route(route_polyline, point):

    decoded_route = decode_polyline(route_polyline)
    closest_distance = float('inf')
    closest_point = (None, None)

    for route_coordinate in decoded_route:

        distance = geopy.distance.distance(point, route_coordinate).m

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


        while True:
            byte = ord(polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if not byte >= 0x20:
                break


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

# Calculate the mile distance of a polyline
def calculate_distance_of_polyline(polyline):

    decoded_route = decode_polyline(polyline)
    
    total_distance = 0.0


    for i in range(len(decoded_route) - 1):
        coord1 = decoded_route[i]
        coord2 = decoded_route[i + 1]
        

        distance = geopy.distance.distance(coord1, coord2).miles
        total_distance += distance

    return total_distance

# Gets the Google Maps route from start point to end point
def getRoute(route_start, route_end):
    directions = gmaps.directions(route_start, route_end, mode="driving", departure_time=datetime.now())
    return directions

# Function to get the closest route directions from a user's location (point) to a route (route_start and route_end)
def getClosestRouteDirections(route, point):

    if isinstance(route, str):
        route_polyline = route
    else:
        route_polyline = route[0]["overview_polyline"]["points"]


    closest_point_to_start = find_closest_point_on_route(route_polyline, point)


    new_route = gmaps.directions(
        point,
        (closest_point_to_start[0], closest_point_to_start[1]),
        mode="walking",
        departure_time=datetime.now()
    )

    return new_route

# Gets how zoomed out a map should be to include the two coordinates on it
def calculate_zoom_level(coord1, coord2):

    lat1, lon1 = coord1
    lat2, lon2 = coord2

    lat_diff = abs(lat1 - lat2)
    lon_diff = abs(lon1 - lon2)


    buffer_percentage = 0.1
    lat_buffer = lat_diff * buffer_percentage
    lon_buffer = lon_diff * buffer_percentage


    latitudeDelta = lat_diff + 2 * lat_buffer
    longitudeDelta = lon_diff + 2 * lon_buffer

    return { 'latitude_delta': latitudeDelta, 'longitude_delta': longitudeDelta }

def calculate_midpoint(coord1, coord2):

    lat1, lon1 = coord1
    lat2, lon2 = coord2

    mid_lat = (lat1 + lat2) / 2
    mid_lon = (lon1 + lon2) / 2

    return { 'latitude': mid_lat, 'longitude': mid_lon }