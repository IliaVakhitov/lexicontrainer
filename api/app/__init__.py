import logging
from logging.handlers import RotatingFileHandler
import os
from flask import Flask
from flask_cors import CORS
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


# DB
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    # Creating app
    app = Flask(__name__, static_url_path='/', static_folder='static/build/')
    CORS(app)
    
    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app, db)

    # Main BP
    from app.main import bp as main_bp
    app.register_blueprint(main_bp)

    # Errors BP
    from app.errors import bp as errors_bp
    app.register_blueprint(errors_bp)

    # Auth BP
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    # Dictionaries BP
    from app.dicts import bp as dicts_bp
    app.register_blueprint(dicts_bp, url_prefix='/dicts')

    # Words BP
    from app.words import bp as words_bp
    app.register_blueprint(words_bp, url_prefix='/words')

    # Games BP
    from app.games import bp as games_bp
    app.register_blueprint(games_bp, url_prefix='/games')

    # Log-files and logger
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/words_learning.log',
                                       maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)

    app.logger.setLevel(logging.INFO)
    # app.logger.info('Words learning startup')

    return app


from app import models

    
