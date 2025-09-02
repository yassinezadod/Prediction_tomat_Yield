#Importing necessary modules
from flask import Flask, make_response, request
from config import Config
from flask_mongoengine import MongoEngine
from flask_restx import Api
from flask_cors import CORS
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask_jwt_extended import JWTManager

#Initializing the Flask app and configuring it using the Config class
app=Flask(__name__)
app.config.from_object(Config)

#Initializing the MongoEngine object and binding it to the Flask app instance
db=MongoEngine()
db.init_app(app)

mail = Mail(app)

# configure URLSafeTimedSerializer
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

#Allowing cross-origin resource sharing (CORS)
from flask_cors import CORS

# Autoriser toutes les routes avec DELETE
cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response



#Initializing the Flask-RESTX API object and binding it to the Flask app instance
api=Api()
api.init_app(app)

jwt = JWTManager(app)

#Importing the routes module where the app routes are defined
#from application import routes 
from application.routes import namespaces

for ns in namespaces:
    api.add_namespace(ns)
