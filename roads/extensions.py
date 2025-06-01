from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager

# Initialize extensions without app context
db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()