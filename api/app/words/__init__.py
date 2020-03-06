from flask import Blueprint

bp = Blueprint('words', __name__)

from app.words import routes
