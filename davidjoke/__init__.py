"""from .views import app
from . import models

# Connect sqlalchemy to app
models.db.init_app(app)

@app.cli.command('init_db')
def init_db():
	models.init_db()"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    """Construct the core application."""
    app = Flask(__name__, instance_relative_config=False)
	#app.config.from_object('config.Config')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://david_joke_user:david_joke_password@localhost/david_joke_database'

    db.init_app(app)

    with app.app_context():
        from . import routes  # Import routes
        db.create_all()  # Create sql tables for our data models

        return app