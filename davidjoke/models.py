"""from flask_sqlalchemy import SQLAlchemy
from .views import app"""
from . import db

from datetime import datetime
import hashlib

# Create database connection object
#db = SQLAlchemy(app)

#One to Many with Category
#One to Many with Joke
class User(db.Model) :
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50), unique=True, nullable=False)
    user_password = db.Column(db.String(50), nullable=False)
    user_email = db.Column(db.String(50), unique=True)
    user_date_creation = db.Column(db.DateTime, default = datetime.utcnow)
    user_date_last_modification = db.Column(db.DateTime, default = datetime.utcnow)
    user_categories = db.relationship('Category', back_populates="category_user")
    user_jokes = db.relationship("Joke", back_populates="joke_user")

    def __init__(self, name, password, email=None) :
        self.user_name = name
        self.user_password = hashlib.md5(password.encode('utf-8')).hexdigest()
        self.user_email = email

#One to Many with Joke
class Category(db.Model) :
    __tablename__ = "category"
    category_id = db.Column(db.Integer, primary_key=True)
    category_text = db.Column(db.String(50), nullable=False)
    category_description = db.Column(db.String(255), nullable=False)
    category_date_creation = db.Column(db.DateTime, default = datetime.utcnow)
    category_date_last_modification = db.Column(db.DateTime, default = datetime.utcnow)
    category_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    category_user = db.relationship('User', back_populates="user_categories")
    category_jokes = db.relationship("Joke", back_populates="joke_category")

    def __init__(self, text, description, user_id) :
        self.category_text = text
        self.category_description = description
        self.category_user_id = user_id

class Joke(db.Model) :
    __tablename__ = "joke"
    joke_id = db.Column(db.Integer, primary_key=True)
    joke_text = db.Column(db.String(1000), nullable=False)
    joke_enabled = db.Column(db.Boolean, default=True)
    joke_date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    joke_date_last_modification = db.Column(db.DateTime, default=datetime.utcnow)
    joke_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    joke_category_id = db.Column(db.Integer, db.ForeignKey('category.category_id'))
    joke_user = db.relationship('User', back_populates="user_jokes")
    joke_category = db.relationship('Category', back_populates="category_jokes")

    def __init__(self, text, user_id, category_id) :
        self.joke_text = text
        self.joke_user_id = user_id
        self.joke_category_id = category_id

class Configuration(db.Model) :
    __tablename__ = "configuration"
    configuration_id = db.Column(db.Integer, primary_key=True)
    configuration_key = db.Column(db.String(255), nullable=False, unique=True)
    configuration_value = db.Column(db.String(1000))

    def __init__(self, key, value=None) :
        self.configuration_key = key
        self.configuration_value = value

class Message(db.Model) :
    __tablename__ = "message"
    message_id = db.Column(db.Integer, primary_key=True)
    message_email = db.Column(db.String(100), nullable=False)
    message_text = db.Column(db.String(1000), nullable=False)
    message_date_send = db.Column(db.DateTime, default=datetime.utcnow)
    message_seen = db.Column(db.Boolean, default=False)

    def __init__(self, email, text) :
        self.message_email = email
        self.message_text = text


def init_db():
    #db.drop_all()
    db.create_all()
    #db.session.add(Content("THIS IS SPARTAAAAAAA!!!", Gender['male']))
    #db.session.add(Content("What's your favorite scary movie?", Gender['female']))
    #db.session.commit()