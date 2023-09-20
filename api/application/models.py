from application import db, bcrypt
from datetime import datetime

# Defines a association table for the many-to-many relationship between users and carpools
user_carpool_association = db.Table(
    'user_carpool_association',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('carpool_id', db.Integer, db.ForeignKey('carpool.id'))
)

class CarPool(db.Model):
    __tablename__ = 'carpool'

    id = db.Column(db.Integer, primary_key=True) 

    start_address = db.Column(db.String)
    _start_point = db.Column(db.String)

    end_address = db.Column(db.String)
    _end_point = db.Column(db.String)
    
    route_polyline = db.Column(db.String)

    startTime = db.Column(db.DateTime, default=datetime.utcnow)
    ended = db.Column(db.Boolean, default=False)
    occupancy = db.Column(db.Integer)
        
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"))
    driver = db.relationship(
        'User',
        foreign_keys=[driver_id],
        back_populates='carpools_as_driver',
        uselist=False  
    )
    
    carpoolers = db.relationship(
        'User',
        secondary=user_carpool_association,
        back_populates='carpools'
    )

    carpool_user_points = db.relationship(
        'CarpoolerUserPoints',
        backref='carpool',
        lazy=True
    )

class CarpoolerUserPoints(db.Model):
    __tablename__ = 'carpooleruserpoints'
    id = db.Column(db.Integer, primary_key=True)


    _start_point = db.Column(db.String)
    _end_point = db.Column(db.String)


    _route_reach = db.Column(db.String)
    _route_depart = db.Column(db.String)


    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    carpool_id = db.Column(db.Integer, db.ForeignKey('carpool.id'))

    @property
    def start_point(self):
        return tuple(map(int, self._start_point.split(',')))

    @start_point.setter
    def start_point(self, value):
        self._start_point = ','.join(map(str, value))

    @property
    def end_point(self):
        return tuple(map(int, self._end_point.split(',')))

    @end_point.setter
    def end_point(self, value):
        self._end_point = ','.join(map(str, value))

    @property
    def route_reach(self):
        return tuple(map(int, self._route_reach.split(',')))

    @route_reach.setter
    def route_reach(self, value):
        self._route_reach = ','.join(map(str, value))

    @property
    def route_depart(self):
        return tuple(map(int, self._route_depart.split(',')))

    @route_depart.setter
    def route_depart(self, value):
        self._route_depart = ','.join(map(str, value))

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String)
    email = db.Column(db.String)
    password_hash = db.Column(db.String(length=60))

    # required to carpool
    walking_distance = db.Column(db.Float)

    # required to drive
    description = db.Column(db.String)
    car_model = db.Column(db.String)

    image_url = db.Column(db.String)
    image_id = db.Column(db.String)
    
    carpools_as_driver = db.relationship('CarPool', back_populates='driver', lazy=True)

    carpools = db.relationship(
        'CarPool',
        secondary=user_carpool_association,
        back_populates='carpoolers'
    )

    @property
    def password(self):
        return self.password

    @password.setter
    def password(self, plain_text_password):
        self.password_hash = bcrypt.generate_password_hash(plain_text_password).decode('utf-8')

    def check_password_correction(self, attempted_password):
        return bcrypt.check_password_hash(self.password_hash, attempted_password)