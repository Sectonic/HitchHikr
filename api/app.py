from flask import Flask, request, abort
from maps import getClosestRouteDirections, getRoute
import ast

app = Flask(__name__)

# API route to calculate the closest distance & directions from a coordinate point to a route
@app.route("/maps/closest_route_directions", methods=['GET'])
def closest_route_directions():

    # Check if all required query parameters exist in the request
    if not all(param in request.args for param in ['point', 'routeStart', 'routeEnd']):
        error_message = 'Required query parameters are missing: userPoint, startLocation, endLocation'

        # Raise a 400 Bad Request with a custom error message
        abort(400, description=error_message)

    # route_start and route_end are both string addresses
    route_start = request.args.get('routeStart')
    route_end = request.args.get('routeEnd')

    # the point is a tuple of (Latitude, Longitude) so we have to parse it
    point = ast.literal_eval(request.args.get('point'))

    route = getRoute(route_start, route_end)

    directions = getClosestRouteDirections(route, point)

    return { 'pointToRoute': directions, 'route': route }, 200

if __name__ == '__main__':
    app.run(host='10.0.0.58')