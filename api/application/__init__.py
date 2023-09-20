from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv
from flask_socketio import SocketIO

load_dotenv() 

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
crypt = Fernet(os.environ['SECRET_KEY'])
socketio = SocketIO(app)

# from application import models

# with app.app_context():
#     db.drop_all();
#     db.create_all();

from application import sockets
from application import routes