import flask
from application import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

class users(db.Document):
    # Nouveaux champs
    firstname = db.StringField(max_length=50)
    lastname = db.StringField(max_length=50)
    phone = db.StringField(max_length=20)
    bio = db.StringField(max_length=255)

    # Déjà existants
    name = db.StringField(max_length=50, required=True)
    email = db.StringField(max_length=50, unique=True, required=True)
    password = db.StringField(required=True)
    verified = db.BooleanField(default=False)
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    role = db.StringField(default="user", choices=["user", "admin"])
    def set_password(self, password):
        self.password = generate_password_hash(password, method='pbkdf2:sha512', salt_length=16)
    
    def get_password(self, password):
        return check_password_hash(self.password, password)

    def get_id(self):
        return str(self.id)

    def to_dict(self):
        return {
            'id': str(self.id),
            'firstname': self.firstname,
            'lastname': self.lastname,
            'phone': self.phone,
            'bio': self.bio,
            'name': self.name,
            'email': self.email,
            'role': self.role, 
            'verified': self.verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class courses(db.Document):
    courseID = db.StringField(unique=True, required=True)
    title = db.StringField(max_length=100, required=True)
    description = db.StringField(max_length=255)
    credits = db.IntField(required=True)
    term = db.StringField(max_length=25, required=True)
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)  # Ajout du champ created_at
    
    # Méthode utile pour obtenir l'ID en tant que string
    def get_id(self):
        return str(self.id)
    
    # Méthode pour la représentation JSON personnalisée
    def to_dict(self):
        return {
            'id': str(self.id),
            'courseID': self.courseID,
            'title': self.title,
            'description': self.description,
            'credits': self.credits,
            'term': self.term,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }