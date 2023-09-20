from application import socketio

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('join_request')
def handle_join_request(data):
    socketio.emit('join_request_notification', data)

@socketio.on('response_to_request')
def handle_response_to_request(data):
    socketio.emit('join_response_notification', data)